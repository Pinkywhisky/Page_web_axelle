<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/pets_schema.php';

function findUserById(int $id): ?array
{
    $statement = db()->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $user = $statement->fetch();

    return $user ?: null;
}

function tableExists(string $tableName): bool
{
    $statement = db()->prepare(
        'SELECT COUNT(*) AS total
         FROM information_schema.tables
         WHERE table_schema = DATABASE()
           AND table_name = :table_name'
    );
    $statement->execute(['table_name' => $tableName]);

    return (int) $statement->fetch()['total'] > 0;
}

function ensurePetTables(): void
{
    cdpEnsurePetTables();
}

function petsForUser(int $userId): array
{
    if (!tableExists('pets')) {
        return [];
    }

    $statement = db()->prepare('SELECT * FROM pets WHERE user_id = :user_id ORDER BY created_at ASC, id ASC');
    $statement->execute(['user_id' => $userId]);
    return $statement->fetchAll();
}

function enrichUserWithPets(array $user): array
{
    $publicUser = publicUser($user);
    $pets = petsForUser((int) $user['id']);
    $publicUser['pets'] = array_map(
        fn(array $pet): array => [
            'id' => (int) $pet['id'],
            'name' => $pet['name'],
            'species' => $pet['species'],
        ],
        $pets
    );

    return $publicUser;
}

function deleteUserCascade(array $user): void
{
    $pdo = db();
    $userId = (int) $user['id'];
    $email = (string) $user['email'];

    $pdo->beginTransaction();

    if (tableExists('booking_request_pets') && tableExists('booking_requests')) {
        $statement = $pdo->prepare(
            'DELETE booking_request_pets
             FROM booking_request_pets
             JOIN booking_requests ON booking_requests.id = booking_request_pets.booking_request_id
             WHERE booking_requests.user_id = :user_id'
        );
        $statement->execute(['user_id' => $userId]);
    }

    if (tableExists('booking_request_pets') && tableExists('pets')) {
        $statement = $pdo->prepare(
            'DELETE booking_request_pets
             FROM booking_request_pets
             JOIN pets ON pets.id = booking_request_pets.pet_id
             WHERE pets.user_id = :user_id'
        );
        $statement->execute(['user_id' => $userId]);
    }

    if (tableExists('booking_requests')) {
        $statement = $pdo->prepare('DELETE FROM booking_requests WHERE user_id = :user_id');
        $statement->execute(['user_id' => $userId]);
    }

    if (tableExists('pets')) {
        $statement = $pdo->prepare('DELETE FROM pets WHERE user_id = :user_id');
        $statement->execute(['user_id' => $userId]);
    }

    if (tableExists('contact_requests')) {
        $statement = $pdo->prepare('DELETE FROM contact_requests WHERE email = :email');
        $statement->execute(['email' => $email]);
    }

    $statement = $pdo->prepare('DELETE FROM users WHERE id = :id');
    $statement->execute(['id' => $userId]);

    $pdo->commit();
}

function validateUserPayload(array $data, bool $requirePassword = false): array
{
    $fullName = cleanText($data['full_name'] ?? $data['fullName'] ?? '', 150);
    $email = strtolower(cleanText($data['email'] ?? '', 190));
    $password = (string) ($data['password'] ?? '');
    $phone = cleanText($data['phone'] ?? '', 30);
    $role = cleanText($data['role'] ?? 'client', 20);

    if ($fullName === '') {
        jsonResponse(['error' => 'Le nom complet est obligatoire.'], 400);
    }

    if (
        strlen($fullName) > 150 ||
        strlen($email) > 190 ||
        strlen($phone) > 30
    ) {
        jsonResponse(['error' => 'Un des champs saisis est trop long.'], 400);
    }

    if (!isValidFrenchPhone($phone)) {
        jsonResponse(['error' => 'Numéro de téléphone invalide.'], 400);
    }

    if (!isValidEmailStrict($email)) {
        jsonResponse(['error' => 'Adresse e-mail invalide. Les accents ne sont pas autorisés.'], 400);
    }

    if ($requirePassword && strlen($password) < 6) {
        jsonResponse(['error' => 'Le mot de passe doit contenir au moins 6 caractères.'], 400);
    }

    if ($password !== '' && strlen($password) > 255) {
        jsonResponse(['error' => 'Le mot de passe est trop long.'], 400);
    }

    if (!in_array($role, ['client', 'admin'], true)) {
        jsonResponse(['error' => 'Rôle invalide.'], 400);
    }

    return [
        'full_name' => $fullName,
        'email' => $email,
        'password' => $password,
        'phone' => $phone,
        'role' => $role,
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    ensurePetTables();

    if ($method !== 'GET') {
        requireCsrfToken();
    }

    if ($method === 'GET') {
        requireAdmin();

        $statement = db()->query(
            'SELECT id, full_name, email, phone, role, created_at
             FROM users
             ORDER BY created_at DESC, id DESC'
        );
        $users = array_map('enrichUserWithPets', $statement->fetchAll());

        jsonResponse(['users' => $users]);
    }

    if ($method === 'POST') {
        $payload = validateUserPayload(readJsonBody(), true);
        $payload['role'] = 'client';

        $statement = db()->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $statement->execute(['email' => $payload['email']]);

        if ($statement->fetch()) {
            jsonResponse(['error' => 'Cet e-mail est déjà utilisé.'], 409);
        }

        $insert = db()->prepare(
            'INSERT INTO users (full_name, email, password_hash, phone, role)
             VALUES (:full_name, :email, :password_hash, :phone, :role)'
        );

        $insert->execute([
            'full_name' => $payload['full_name'],
            'email' => $payload['email'],
            'password_hash' => password_hash($payload['password'], PASSWORD_DEFAULT),
            'phone' => $payload['phone'] ?: null,
            'role' => $payload['role'],
        ]);

        $user = findUserById((int) db()->lastInsertId());
        jsonResponse(['message' => 'Votre espace a bien été créé.', 'user' => publicUser($user)], 201);
    }

    if ($method === 'PUT') {
        requireLogin();

        $data = readJsonBody();
        $id = (int) ($data['id'] ?? 0);
        $sessionUser = currentUser();

        if ($id <= 0) {
            jsonResponse(['error' => 'Utilisateur introuvable.'], 400);
        }

        $isSelfUpdate = $sessionUser && (int) $sessionUser['id'] === $id;
        if (!$isSelfUpdate && !isAdmin()) {
            jsonResponse(['error' => 'Accès réservé aux administrateurs.'], 403);
        }

        $existing = findUserById($id);
        if (!$existing) {
            jsonResponse(['error' => 'Utilisateur introuvable.'], 404);
        }

        $payload = validateUserPayload($data, false);
        $nextRole = isAdmin() && !$isSelfUpdate ? $payload['role'] : $existing['role'];

        $statement = db()->prepare('SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1');
        $statement->execute(['email' => $payload['email'], 'id' => $id]);

        if ($statement->fetch()) {
            jsonResponse(['error' => 'Cet e-mail est déjà utilisé par un autre compte.'], 409);
        }

        $update = db()->prepare(
            'UPDATE users
             SET full_name = :full_name,
                 email = :email,
                 phone = :phone,
                 role = :role
             WHERE id = :id'
        );
        $update->execute([
            'id' => $id,
            'full_name' => $payload['full_name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'] ?: null,
            'role' => $nextRole,
        ]);

        $updated = findUserById($id);
        if ($isSelfUpdate) {
            refreshSessionUser($updated);
        }

        jsonResponse(['message' => 'Utilisateur mis à jour.', 'user' => publicUser($updated)]);
    }

    if ($method === 'DELETE') {
        requireAdmin();

        $data = readJsonBody();
        $id = (int) ($data['id'] ?? $_GET['id'] ?? 0);

        if ($id <= 0) {
            jsonResponse(['error' => 'Utilisateur introuvable.'], 400);
        }

        $sessionUser = currentUser();
        if ($sessionUser && (int) $sessionUser['id'] === $id) {
            jsonResponse(['error' => 'Vous ne pouvez pas supprimer votre propre compte administrateur.'], 409);
        }

        $existing = findUserById($id);
        if (!$existing) {
            jsonResponse(['error' => 'Utilisateur introuvable.'], 404);
        }

        deleteUserCascade($existing);

        jsonResponse(['message' => 'Utilisateur supprimé.']);
    }

    jsonResponse(['error' => 'Méthode non autorisée.'], 405);
} catch (PDOException $error) {
    if (db()->inTransaction()) {
        db()->rollBack();
    }

    if ($error->getCode() === '23000') {
        jsonResponse(['error' => 'Cet e-mail est déjà utilisé.'], 409);
    }

    jsonResponse(['error' => 'Erreur base de données.'], 500);
}
