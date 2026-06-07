<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

function findUserById(int $id): ?array
{
    $statement = db()->prepare('SELECT * FROM users WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $user = $statement->fetch();

    return $user ?: null;
}

function validateUserPayload(array $data, bool $requirePassword = false): array
{
    $fullName = cleanText($data['full_name'] ?? $data['fullName'] ?? '', 150);
    $email = strtolower(cleanText($data['email'] ?? '', 190));
    $password = (string) ($data['password'] ?? '');
    $phone = cleanText($data['phone'] ?? '', 30);
    $animalType = cleanText($data['animal_type'] ?? $data['animalType'] ?? '', 50);
    $animalName = cleanText($data['animal_name'] ?? $data['animalName'] ?? '', 100);
    $role = cleanText($data['role'] ?? 'client', 20);

    if ($fullName === '') {
        jsonResponse(['error' => 'Le nom complet est obligatoire.'], 400);
    }

    if (
        strlen($fullName) > 150 ||
        strlen($email) > 190 ||
        strlen($phone) > 30 ||
        strlen($animalType) > 50 ||
        strlen($animalName) > 100
    ) {
        jsonResponse(['error' => 'Un des champs saisis est trop long.'], 400);
    }

    if (!isValidEmailStrict($email)) {
        jsonResponse(['error' => 'Adresse e-mail invalide. Les accents ne sont pas autorisés.'], 400);
    }

    if ($requirePassword && strlen($password) < 6) {
        jsonResponse(['error' => 'Le mot de passe doit contenir au moins 6 caractères.'], 400);
    }

    if ($animalType !== '' && !in_array($animalType, ['chien', 'chat'], true)) {
        jsonResponse(['error' => 'Le type d’animal doit être chien ou chat.'], 400);
    }

    if (!in_array($role, ['client', 'admin'], true)) {
        jsonResponse(['error' => 'Rôle invalide.'], 400);
    }

    return [
        'full_name' => $fullName,
        'email' => $email,
        'password' => $password,
        'phone' => $phone,
        'animal_type' => $animalType,
        'animal_name' => $animalName,
        'role' => $role,
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        requireAdmin();

        $statement = db()->query(
            'SELECT id, full_name, email, phone, animal_type, animal_name, role, created_at
             FROM users
             ORDER BY created_at DESC, id DESC'
        );
        $users = array_map('publicUser', $statement->fetchAll());

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
            'INSERT INTO users (full_name, email, password_hash, phone, animal_type, animal_name, role)
             VALUES (:full_name, :email, :password_hash, :phone, :animal_type, :animal_name, :role)'
        );
        $insert->execute([
            'full_name' => $payload['full_name'],
            'email' => $payload['email'],
            'password_hash' => password_hash($payload['password'], PASSWORD_DEFAULT),
            'phone' => $payload['phone'] ?: null,
            'animal_type' => $payload['animal_type'] ?: null,
            'animal_name' => $payload['animal_name'] ?: null,
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
        $nextRole = isAdmin() ? $payload['role'] : $existing['role'];

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
                 animal_type = :animal_type,
                 animal_name = :animal_name,
                 role = :role
             WHERE id = :id'
        );
        $update->execute([
            'id' => $id,
            'full_name' => $payload['full_name'],
            'email' => $payload['email'],
            'phone' => $payload['phone'] ?: null,
            'animal_type' => $payload['animal_type'] ?: null,
            'animal_name' => $payload['animal_name'] ?: null,
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

        $delete = db()->prepare('DELETE FROM users WHERE id = :id');
        $delete->execute(['id' => $id]);

        jsonResponse(['message' => 'Utilisateur supprimé.']);
    }

    jsonResponse(['error' => 'Méthode non autorisée.'], 405);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        jsonResponse(['error' => 'Cet e-mail est déjà utilisé.'], 409);
    }

    jsonResponse(['error' => 'Erreur base de données.'], 500);
}
