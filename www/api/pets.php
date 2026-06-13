<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

function publicPet(array $pet): array
{
    return [
        'id' => (int) $pet['id'],
        'user_id' => (int) $pet['user_id'],
        'userId' => (int) $pet['user_id'],
        'name' => $pet['name'],
        'species' => $pet['species'],
        'notes' => $pet['notes'] ?? '',
        'created_at' => $pet['created_at'] ?? null,
        'createdAt' => $pet['created_at'] ?? null,
    ];
}

function ensurePetTables(): void
{
    db()->exec(
        "CREATE TABLE IF NOT EXISTS pets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            species ENUM('chien', 'chat') NOT NULL,
            notes TEXT DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_pet_user
                FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );

    db()->exec(
        "CREATE TABLE IF NOT EXISTS booking_request_pets (
            booking_request_id INT NOT NULL,
            pet_id INT NOT NULL,
            PRIMARY KEY (booking_request_id, pet_id),
            CONSTRAINT fk_booking_request_pet_booking
                FOREIGN KEY (booking_request_id) REFERENCES booking_requests(id)
                ON DELETE CASCADE,
            CONSTRAINT fk_booking_request_pet_pet
                FOREIGN KEY (pet_id) REFERENCES pets(id)
                ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
}

function findPetForUser(int $petId, int $userId): ?array
{
    $statement = db()->prepare('SELECT * FROM pets WHERE id = :id AND user_id = :user_id LIMIT 1');
    $statement->execute(['id' => $petId, 'user_id' => $userId]);
    $pet = $statement->fetch();

    return $pet ?: null;
}

function validatePetPayload(array $data): array
{
    $name = cleanText($data['name'] ?? '', 100);
    $species = cleanText($data['species'] ?? '', 50);
    $notes = cleanText($data['notes'] ?? '', 1200);

    if ($name === '') {
        jsonResponse(['error' => 'Le nom de l’animal est obligatoire.'], 400);
    }

    if (!in_array($species, ['chien', 'chat'], true)) {
        jsonResponse(['error' => 'L’espèce doit être chien ou chat.'], 400);
    }

    if (strlen($name) > 100 || strlen($notes) > 1200) {
        jsonResponse(['error' => 'Un des champs saisis est trop long.'], 400);
    }

    return [
        'name' => $name,
        'species' => $species,
        'notes' => $notes,
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    requireLogin();
    ensurePetTables();

    if (isAdmin()) {
        jsonResponse(['error' => 'La gestion des animaux est réservée aux comptes clients.'], 403);
    }

    $user = currentUser();
    $userId = (int) $user['id'];

    if ($method === 'GET') {
        $statement = db()->prepare('SELECT * FROM pets WHERE user_id = :user_id ORDER BY created_at ASC, id ASC');
        $statement->execute(['user_id' => $userId]);
        jsonResponse(['pets' => array_map('publicPet', $statement->fetchAll())]);
    }

    requireCsrfToken();

    if ($method === 'POST') {
        $payload = validatePetPayload(readJsonBody());
        $statement = db()->prepare(
            'INSERT INTO pets (user_id, name, species, notes)
             VALUES (:user_id, :name, :species, :notes)'
        );
        $statement->execute([
            'user_id' => $userId,
            'name' => $payload['name'],
            'species' => $payload['species'],
            'notes' => $payload['notes'] ?: null,
        ]);

        $pet = findPetForUser((int) db()->lastInsertId(), $userId);
        jsonResponse(['message' => 'Animal ajouté.', 'pet' => publicPet($pet)], 201);
    }

    if ($method === 'PUT') {
        $data = readJsonBody();
        $petId = (int) ($data['id'] ?? 0);

        if ($petId <= 0 || !findPetForUser($petId, $userId)) {
            jsonResponse(['error' => 'Animal introuvable.'], 404);
        }

        $payload = validatePetPayload($data);
        $statement = db()->prepare(
            'UPDATE pets
             SET name = :name, species = :species, notes = :notes
             WHERE id = :id AND user_id = :user_id'
        );
        $statement->execute([
            'id' => $petId,
            'user_id' => $userId,
            'name' => $payload['name'],
            'species' => $payload['species'],
            'notes' => $payload['notes'] ?: null,
        ]);

        jsonResponse(['message' => 'Animal mis à jour.', 'pet' => publicPet(findPetForUser($petId, $userId))]);
    }

    if ($method === 'DELETE') {
        $data = readJsonBody();
        $petId = (int) ($data['id'] ?? $_GET['id'] ?? 0);

        if ($petId <= 0 || !findPetForUser($petId, $userId)) {
            jsonResponse(['error' => 'Animal introuvable.'], 404);
        }

        $statement = db()->prepare('DELETE FROM pets WHERE id = :id AND user_id = :user_id');
        $statement->execute(['id' => $petId, 'user_id' => $userId]);
        jsonResponse(['message' => 'Animal supprimé.']);
    }

    jsonResponse(['error' => 'Méthode non autorisée.'], 405);
} catch (PDOException $error) {
    jsonResponse(['error' => 'Erreur base de données.'], 500);
}
