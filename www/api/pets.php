<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/pets_schema.php';

function publicPet(array $pet): array
{
    $dateNaissance = $pet['date_naissance'] ?? null;
    $poids = $pet['poids'] ?? null;

    return [
        'id' => (int) $pet['id'],
        'user_id' => (int) $pet['user_id'],
        'userId' => (int) $pet['user_id'],
        'name' => $pet['name'],
        'species' => $pet['species'],
        'race' => $pet['race'] ?? '',
        'sexe' => $pet['sexe'] ?? '',
        'date_naissance' => $dateNaissance,
        'dateNaissance' => $dateNaissance,
        'poids' => $poids !== null ? (float) $poids : null,
        'sterilise' => (bool) ($pet['sterilise'] ?? false),
        'compatible_chiens' => $pet['compatible_chiens'] ?? 'a_tester',
        'compatibleChiens' => $pet['compatible_chiens'] ?? 'a_tester',
        'compatible_chats' => $pet['compatible_chats'] ?? 'a_tester',
        'compatibleChats' => $pet['compatible_chats'] ?? 'a_tester',
        'compatible_enfants' => $pet['compatible_enfants'] ?? 'a_tester',
        'compatibleEnfants' => $pet['compatible_enfants'] ?? 'a_tester',
        'craintif' => (bool) ($pet['craintif'] ?? false),
        'fugueur' => (bool) ($pet['fugueur'] ?? false),
        'tres_energetique' => (bool) ($pet['tres_energetique'] ?? false),
        'tresEnergetique' => (bool) ($pet['tres_energetique'] ?? false),
        'protecteur_ressources' => (bool) ($pet['protecteur_ressources'] ?? false),
        'protecteurRessources' => (bool) ($pet['protecteur_ressources'] ?? false),
        'aboiements_frequents' => (bool) ($pet['aboiements_frequents'] ?? false),
        'aboiementsFrequents' => (bool) ($pet['aboiements_frequents'] ?? false),
        'commentaires_comportement' => $pet['commentaires_comportement'] ?? '',
        'commentairesComportement' => $pet['commentaires_comportement'] ?? '',
        'allergies' => $pet['allergies'] ?? '',
        'traitement_medical' => $pet['traitement_medical'] ?? '',
        'traitementMedical' => $pet['traitement_medical'] ?? '',
        'regime_alimentaire' => $pet['regime_alimentaire'] ?? '',
        'regimeAlimentaire' => $pet['regime_alimentaire'] ?? '',
        'commentaires' => $pet['commentaires'] ?? '',
        'created_at' => $pet['created_at'] ?? null,
        'createdAt' => $pet['created_at'] ?? null,
    ];
}

function findPetForUser(int $petId, int $userId): ?array
{
    $statement = db()->prepare('SELECT * FROM pets WHERE id = :id AND user_id = :user_id LIMIT 1');
    $statement->execute(['id' => $petId, 'user_id' => $userId]);
    $pet = $statement->fetch();

    return $pet ?: null;
}

function findPetById(int $petId): ?array
{
    $statement = db()->prepare('SELECT * FROM pets WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $petId]);
    $pet = $statement->fetch();

    return $pet ?: null;
}

function petUserIdInput(array $data): ?int
{
    $value = $data['user_id'] ?? $data['userId'] ?? null;

    if ($value === null || $value === '') {
        return null;
    }

    if (!is_numeric($value) || (int) $value <= 0) {
        jsonResponse(['error' => 'Utilisateur invalide.'], 400);
    }

    return (int) $value;
}

function petUserExists(int $userId): bool
{
    $statement = db()->prepare('SELECT id FROM users WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $userId]);

    return (bool) $statement->fetch();
}

function resolvePetUserId(array $sessionUser, array $data, bool $requiredForAdmin): int
{
    if (!isAdmin()) {
        return (int) $sessionUser['id'];
    }

    $userId = petUserIdInput($data);

    if ($userId === null) {
        if ($requiredForAdmin) {
            jsonResponse(['error' => 'Selectionnez un membre pour gerer ses animaux.'], 400);
        }

        return 0;
    }

    if (!petUserExists($userId)) {
        jsonResponse(['error' => 'Utilisateur introuvable.'], 404);
    }

    return $userId;
}

function petText(array $data, string $snakeKey, string $camelKey, int $maxLength): string
{
    $text = cleanText($data[$snakeKey] ?? $data[$camelKey] ?? '', $maxLength);

    if (strlen($text) > $maxLength) {
        jsonResponse(['error' => 'Un des champs saisis est trop long.'], 400);
    }

    return $text;
}

function petBoolean(array $data, string $snakeKey, string $camelKey): int
{
    $value = $data[$snakeKey] ?? $data[$camelKey] ?? false;

    if (is_bool($value)) {
        return $value ? 1 : 0;
    }

    if (is_int($value)) {
        return $value === 1 ? 1 : 0;
    }

    if (is_string($value)) {
        $normalized = strtolower(trim($value));

        if (in_array($normalized, ['1', 'true', 'oui', 'on'], true)) {
            return 1;
        }

        if (in_array($normalized, ['0', 'false', 'non', 'off', ''], true)) {
            return 0;
        }
    }

    jsonResponse(['error' => 'Une valeur booléenne est invalide.'], 400);
}

function petCompatibility(array $data, string $snakeKey, string $camelKey): string
{
    $value = cleanText($data[$snakeKey] ?? $data[$camelKey] ?? 'a_tester', 20);

    if (!in_array($value, ['oui', 'non', 'a_tester'], true)) {
        jsonResponse(['error' => 'Une compatibilité contient une valeur invalide.'], 400);
    }

    return $value;
}

function petBirthDate(array $data): ?string
{
    $value = cleanText($data['date_naissance'] ?? $data['dateNaissance'] ?? '', 10);

    if ($value === '') {
        return null;
    }

    $date = DateTime::createFromFormat('Y-m-d', $value);
    $errors = DateTime::getLastErrors();

    if (!$date || ($errors && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
        jsonResponse(['error' => 'La date de naissance est invalide.'], 400);
    }

    if ($date->format('Y-m-d') !== $value || $date > new DateTime('today')) {
        jsonResponse(['error' => 'La date de naissance est invalide.'], 400);
    }

    return $value;
}

function petWeight(array $data): ?string
{
    $value = $data['poids'] ?? null;

    if ($value === null || trim((string) $value) === '') {
        return null;
    }

    if (!is_numeric($value) || (float) $value <= 0 || (float) $value > 999.99) {
        jsonResponse(['error' => 'Le poids doit être un nombre positif.'], 400);
    }

    return number_format((float) $value, 2, '.', '');
}

function validatePetPayload(array $data): array
{
    $name = petText($data, 'name', 'name', 100);
    $species = petText($data, 'species', 'species', 50);
    $race = petText($data, 'race', 'race', 100);
    $sexe = petText($data, 'sexe', 'sexe', 20);
    $commentairesComportement = petText($data, 'commentaires_comportement', 'commentairesComportement', 1200);
    $allergies = petText($data, 'allergies', 'allergies', 1200);
    $traitementMedical = petText($data, 'traitement_medical', 'traitementMedical', 1200);
    $regimeAlimentaire = petText($data, 'regime_alimentaire', 'regimeAlimentaire', 1200);
    $commentaires = petText($data, 'commentaires', 'commentaires', 2000);


    if ($name === '') {
        jsonResponse(['error' => 'Le nom de l’animal est obligatoire.'], 400);
    }

    if (!in_array($species, ['chien', 'chat'], true)) {
        jsonResponse(['error' => 'L’espèce doit être chien ou chat.'], 400);
    }

    if ($sexe === 'mâle') {
        $sexe = 'male';
    }

    if ($sexe !== '' && !in_array($sexe, ['male', 'femelle'], true)) {
        jsonResponse(['error' => 'Le sexe doit être mâle ou femelle.'], 400);
    }

    return [
        'name' => $name,
        'species' => $species,
        'race' => $race,
        'sexe' => $sexe,
        'date_naissance' => petBirthDate($data),
        'poids' => petWeight($data),
        'sterilise' => petBoolean($data, 'sterilise', 'sterilise'),
        'compatible_chiens' => petCompatibility($data, 'compatible_chiens', 'compatibleChiens'),
        'compatible_chats' => petCompatibility($data, 'compatible_chats', 'compatibleChats'),
        'compatible_enfants' => petCompatibility($data, 'compatible_enfants', 'compatibleEnfants'),
        'craintif' => petBoolean($data, 'craintif', 'craintif'),
        'fugueur' => petBoolean($data, 'fugueur', 'fugueur'),
        'tres_energetique' => petBoolean($data, 'tres_energetique', 'tresEnergetique'),
        'protecteur_ressources' => petBoolean($data, 'protecteur_ressources', 'protecteurRessources'),
        'aboiements_frequents' => petBoolean($data, 'aboiements_frequents', 'aboiementsFrequents'),
        'commentaires_comportement' => $commentairesComportement,
        'allergies' => $allergies,
        'traitement_medical' => $traitementMedical,
        'regime_alimentaire' => $regimeAlimentaire,
        'commentaires' => $commentaires,
    ];
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    requireLogin();
    cdpEnsurePetTables();

    $user = currentUser();

    if ($method === 'GET') {
        $userId = resolvePetUserId($user, $_GET, true);
        $statement = db()->prepare('SELECT * FROM pets WHERE user_id = :user_id ORDER BY created_at ASC, id ASC');
        $statement->execute(['user_id' => $userId]);
        jsonResponse(['pets' => array_map('publicPet', $statement->fetchAll())]);
    }

    requireCsrfToken();

    if ($method === 'POST') {
        $data = readJsonBody();
        $userId = resolvePetUserId($user, $data, true);
        $payload = validatePetPayload($data);
        $statement = db()->prepare(
            'INSERT INTO pets (
                user_id, name, species, race, sexe, date_naissance, poids, sterilise,
                compatible_chiens, compatible_chats, compatible_enfants,
                craintif, fugueur, tres_energetique, protecteur_ressources, aboiements_frequents,
                commentaires_comportement, allergies, traitement_medical, regime_alimentaire,
                commentaires
             ) VALUES (
                :user_id, :name, :species, :race, :sexe, :date_naissance, :poids, :sterilise,
                :compatible_chiens, :compatible_chats, :compatible_enfants,
                :craintif, :fugueur, :tres_energetique, :protecteur_ressources, :aboiements_frequents,
                :commentaires_comportement, :allergies, :traitement_medical, :regime_alimentaire,
                :commentaires
             )'
        );
        $statement->execute([
            'user_id' => $userId,
            ...$payload,
        ]);

        $pet = findPetForUser((int) db()->lastInsertId(), $userId);
        jsonResponse(['message' => 'Animal ajoute.', 'pet' => publicPet($pet)], 201);
    }

    if ($method === 'PUT') {
        $data = readJsonBody();
        $petId = (int) ($data['id'] ?? 0);
        $existingPet = $petId > 0
            ? (isAdmin() ? findPetById($petId) : findPetForUser($petId, (int) $user['id']))
            : null;

        if (!$existingPet) {
            jsonResponse(['error' => 'Animal introuvable.'], 404);
        }

        $userId = (int) $existingPet['user_id'];
        $requestedUserId = petUserIdInput($data);
        if (isAdmin() && $requestedUserId !== null && $requestedUserId !== $userId) {
            jsonResponse(['error' => 'Cet animal n appartient pas au membre selectionne.'], 403);
        }

        $payload = validatePetPayload($data);
        $statement = db()->prepare(
            'UPDATE pets
             SET name = :name,
                 species = :species,
                 race = :race,
                 sexe = :sexe,
                 date_naissance = :date_naissance,
                 poids = :poids,
                 sterilise = :sterilise,
                 compatible_chiens = :compatible_chiens,
                 compatible_chats = :compatible_chats,
                 compatible_enfants = :compatible_enfants,
                 craintif = :craintif,
                 fugueur = :fugueur,
                 tres_energetique = :tres_energetique,
                 protecteur_ressources = :protecteur_ressources,
                 aboiements_frequents = :aboiements_frequents,
                 commentaires_comportement = :commentaires_comportement,
                 allergies = :allergies,
                 traitement_medical = :traitement_medical,
                 regime_alimentaire = :regime_alimentaire,
                 commentaires = :commentaires
             WHERE id = :id AND user_id = :user_id'
        );
        $statement->execute([
            'id' => $petId,
            'user_id' => $userId,
            ...$payload,
        ]);

        jsonResponse(['message' => 'Animal mis a jour.', 'pet' => publicPet(findPetForUser($petId, $userId))]);
    }

    if ($method === 'DELETE') {
        $data = readJsonBody();
        $petId = (int) ($data['id'] ?? $_GET['id'] ?? 0);
        $existingPet = $petId > 0
            ? (isAdmin() ? findPetById($petId) : findPetForUser($petId, (int) $user['id']))
            : null;

        if (!$existingPet) {
            jsonResponse(['error' => 'Animal introuvable.'], 404);
        }

        $userId = (int) $existingPet['user_id'];
        $requestedUserId = petUserIdInput($data);
        if (isAdmin() && $requestedUserId !== null && $requestedUserId !== $userId) {
            jsonResponse(['error' => 'Cet animal n appartient pas au membre selectionne.'], 403);
        }

        $statement = db()->prepare('DELETE FROM pets WHERE id = :id AND user_id = :user_id');
        $statement->execute(['id' => $petId, 'user_id' => $userId]);
        jsonResponse(['message' => 'Animal supprime.']);
    }

    jsonResponse(['error' => 'Methode non autorisee.'], 405);
} catch (PDOException $error) {
    jsonResponse(['error' => 'Erreur base de donnees.'], 500);
}
