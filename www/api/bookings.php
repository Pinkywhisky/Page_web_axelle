<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

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

function columnExists(string $tableName, string $columnName): bool
{
    $statement = db()->prepare(
        'SELECT COUNT(*) AS total
         FROM information_schema.columns
         WHERE table_schema = DATABASE()
           AND table_name = :table_name
           AND column_name = :column_name'
    );
    $statement->execute([
        'table_name' => $tableName,
        'column_name' => $columnName,
    ]);

    return (int) $statement->fetch()['total'] > 0;
}

function publicBooking(array $booking): array
{
    $pets = bookingPets((int) $booking['id']);
    $bookingTime = $booking['booking_time'] ?? null;

    return [
        'id' => (int) $booking['id'],
        'user_id' => (int) $booking['user_id'],
        'userId' => (int) $booking['user_id'],
        'full_name' => $booking['full_name'] ?? '',
        'fullName' => $booking['full_name'] ?? '',
        'email' => $booking['email'] ?? '',
        'animal_type' => $booking['animal_type'],
        'animalType' => $booking['animal_type'],
        'animal_name' => $booking['animal_name'],
        'animalName' => $booking['animal_name'],
        'start_datetime' => $booking['start_datetime'],
        'startDateTime' => str_replace(' ', 'T', substr($booking['start_datetime'], 0, 16)),
        'end_datetime' => $booking['end_datetime'],
        'endDateTime' => str_replace(' ', 'T', substr($booking['end_datetime'], 0, 16)),
        'booking_time' => $bookingTime,
        'bookingTime' => $bookingTime ? substr((string) $bookingTime, 0, 5) : '',
        'notes' => $booking['notes'] ?? '',
        'status' => $booking['status'],
        'admin_note' => $booking['admin_note'] ?? '',
        'adminNote' => $booking['admin_note'] ?? '',
        'pets' => $pets,
        'created_at' => $booking['created_at'],
        'createdAt' => $booking['created_at'],
    ];
}

function bookingPets(int $bookingId): array
{
    if (!tableExists('booking_request_pets') || !tableExists('pets')) {
        return [];
    }

    $statement = db()->prepare(
        'SELECT pets.id, pets.user_id, pets.name, pets.species, pets.notes
         FROM booking_request_pets
         JOIN pets ON pets.id = booking_request_pets.pet_id
         WHERE booking_request_pets.booking_request_id = :booking_id
         ORDER BY pets.name ASC, pets.id ASC'
    );
    $statement->execute(['booking_id' => $bookingId]);

    return array_map(
        fn(array $pet): array => [
            'id' => (int) $pet['id'],
            'user_id' => (int) $pet['user_id'],
            'userId' => (int) $pet['user_id'],
            'name' => $pet['name'],
            'species' => $pet['species'],
            'notes' => $pet['notes'] ?? '',
        ],
        $statement->fetchAll()
    );
}

function findBookingById(int $id): ?array
{
    $statement = db()->prepare(
        'SELECT booking_requests.*, users.full_name, users.email
         FROM booking_requests
         JOIN users ON users.id = booking_requests.user_id
         WHERE booking_requests.id = :id
         LIMIT 1'
    );
    $statement->execute(['id' => $id]);
    $booking = $statement->fetch();

    return $booking ?: null;
}

function parseBookingDateTime(mixed $value): ?string
{
    $rawValue = trim((string) $value);

    if ($rawValue === '') {
        return null;
    }

    $dateTime = DateTime::createFromFormat('Y-m-d\TH:i', $rawValue)
        ?: DateTime::createFromFormat('Y-m-d H:i:s', $rawValue)
        ?: DateTime::createFromFormat('Y-m-d H:i', $rawValue);

    return $dateTime ? $dateTime->format('Y-m-d H:i:s') : null;
}

function parseBookingTime(mixed $value): string|false|null
{
    $rawValue = trim((string) $value);

    if ($rawValue === '') {
        return null;
    }

    if (!preg_match('/^\d{2}:\d{2}$/', $rawValue)) {
        return false;
    }

    $time = DateTime::createFromFormat('H:i', $rawValue);
    $errors = DateTime::getLastErrors();

    if (!$time || ($errors && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
        return false;
    }

    return $time->format('H:i:s');
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        requireLogin();
        $user = currentUser();

        if (!tableExists('booking_requests')) {
            jsonResponse(['bookings' => []]);
        }

        if (isAdmin()) {
            $statement = db()->query(
                'SELECT booking_requests.*, users.full_name, users.email
                 FROM booking_requests
                 JOIN users ON users.id = booking_requests.user_id
                 ORDER BY
                    FIELD(booking_requests.status, "pending", "approved", "rejected", "cancelled"),
                    booking_requests.start_datetime ASC,
                    booking_requests.id DESC'
            );
        } else {
            $statement = db()->prepare(
                'SELECT booking_requests.*, users.full_name, users.email
                 FROM booking_requests
                 JOIN users ON users.id = booking_requests.user_id
                 WHERE booking_requests.user_id = :user_id
                 ORDER BY booking_requests.start_datetime DESC, booking_requests.id DESC'
            );
            $statement->execute(['user_id' => (int) $user['id']]);
        }

        $bookings = array_map('publicBooking', $statement->fetchAll());
        jsonResponse(['bookings' => $bookings]);
    }

    if ($method === 'POST') {
        requireLogin();

        if (isAdmin()) {
            jsonResponse(['error' => 'Les demandes de garde sont réservées aux comptes clients.'], 403);
        }

        if (!tableExists('booking_requests')) {
            jsonResponse(['error' => 'Le module de demandes de garde n’est pas encore installé en base.'], 500);
        }

        $data = readJsonBody();
        $user = currentUser();
        $animalType = cleanText($data['animal_type'] ?? $data['animalType'] ?? '', 50);
        $animalName = cleanText($data['animal_name'] ?? $data['animalName'] ?? '', 100);
        $petIds = array_values(array_unique(array_map('intval', $data['pet_ids'] ?? $data['petIds'] ?? [])));
        $startDatetime = parseBookingDateTime($data['start_datetime'] ?? $data['startDateTime'] ?? '');
        $endDatetime = parseBookingDateTime($data['end_datetime'] ?? $data['endDateTime'] ?? '');
        $bookingTime = parseBookingTime($data['booking_time'] ?? $data['bookingTime'] ?? '');
        $notes = cleanText($data['notes'] ?? '', 1200);
        $selectedPets = [];

        if ($petIds && (!tableExists('pets') || !tableExists('booking_request_pets'))) {
            jsonResponse(['error' => 'La sélection des animaux n’est pas encore installée en base.'], 500);
        }

        if ($petIds) {
            $placeholders = implode(',', array_fill(0, count($petIds), '?'));
            $statement = db()->prepare(
                "SELECT * FROM pets WHERE user_id = ? AND id IN ($placeholders) ORDER BY name ASC, id ASC"
            );
            $statement->execute([(int) $user['id'], ...$petIds]);
            $selectedPets = $statement->fetchAll();

            if (count($selectedPets) !== count($petIds)) {
                jsonResponse(['error' => 'Un animal sélectionné est introuvable.'], 404);
            }

            $animalName = implode(', ', array_map(fn(array $pet): string => $pet['name'], $selectedPets));
            $species = array_unique(array_map(fn(array $pet): string => $pet['species'], $selectedPets));
            $animalType = count($species) === 1 ? $species[0] : 'plusieurs';
        }

        if (!$petIds && !in_array($animalType, ['chien', 'chat'], true)) {
            jsonResponse(['error' => 'Merci de choisir chien ou chat.'], 400);
        }

        if ($animalName === '') {
            jsonResponse(['error' => 'Merci de sélectionner ou renseigner un animal.'], 400);
        }

        if (!$startDatetime || !$endDatetime) {
            jsonResponse(['error' => 'Merci de renseigner une arrivée et un départ valides.'], 400);
        }

        if ($bookingTime === false) {
            jsonResponse(['error' => 'Merci de renseigner un horaire au format HH:mm.'], 400);
        }

        if (strtotime($endDatetime) <= strtotime($startDatetime)) {
            jsonResponse(['error' => 'Le départ doit être après l’arrivée.'], 400);
        }

        if (strtotime($startDatetime) < time() - 60) {
            jsonResponse(['error' => 'La date d’arrivée doit être à venir.'], 400);
        }

        $pdo = db();
        $pdo->beginTransaction();

        $hasBookingTime = columnExists('booking_requests', 'booking_time');
        $insertSql = $hasBookingTime
            ? 'INSERT INTO booking_requests
                (user_id, animal_type, animal_name, start_datetime, end_datetime, booking_time, notes)
               VALUES
                (:user_id, :animal_type, :animal_name, :start_datetime, :end_datetime, :booking_time, :notes)'
            : 'INSERT INTO booking_requests
                (user_id, animal_type, animal_name, start_datetime, end_datetime, notes)
               VALUES
                (:user_id, :animal_type, :animal_name, :start_datetime, :end_datetime, :notes)';

        $insertPayload = [
            'user_id' => (int) $user['id'],
            'animal_type' => $animalType,
            'animal_name' => $animalName,
            'start_datetime' => $startDatetime,
            'end_datetime' => $endDatetime,
            'notes' => $notes ?: null,
        ];

        if ($hasBookingTime) {
            $insertPayload['booking_time'] = $bookingTime;
        }

        $insert = $pdo->prepare($insertSql);
        $insert->execute($insertPayload);

        $bookingId = (int) $pdo->lastInsertId();

        if ($selectedPets) {
            $linkInsert = $pdo->prepare(
                'INSERT INTO booking_request_pets (booking_request_id, pet_id)
                 VALUES (:booking_request_id, :pet_id)'
            );

            foreach ($selectedPets as $pet) {
                $linkInsert->execute([
                    'booking_request_id' => $bookingId,
                    'pet_id' => (int) $pet['id'],
                ]);
            }
        }

        $pdo->commit();

        $booking = findBookingById($bookingId);
        jsonResponse(['message' => 'Votre demande de garde a bien été envoyée.', 'booking' => publicBooking($booking)], 201);
    }

    if ($method === 'PUT') {
        requireAdmin();

        $data = readJsonBody();
        $id = (int) ($data['id'] ?? 0);
        $status = cleanText($data['status'] ?? '', 20);
        $adminNote = cleanText($data['admin_note'] ?? $data['adminNote'] ?? '', 1200);

        if ($id <= 0) {
            jsonResponse(['error' => 'Demande de garde introuvable.'], 400);
        }

        if (!in_array($status, ['pending', 'approved', 'rejected', 'cancelled'], true)) {
            jsonResponse(['error' => 'Statut invalide.'], 400);
        }

        if (!findBookingById($id)) {
            jsonResponse(['error' => 'Demande de garde introuvable.'], 404);
        }

        $update = db()->prepare(
            'UPDATE booking_requests
             SET status = :status, admin_note = :admin_note
             WHERE id = :id'
        );
        $update->execute([
            'id' => $id,
            'status' => $status,
            'admin_note' => $adminNote ?: null,
        ]);

        jsonResponse(['message' => 'Demande de garde mise à jour.', 'booking' => publicBooking(findBookingById($id))]);
    }

    if ($method === 'DELETE') {
        requireLogin();

        $data = readJsonBody();
        $id = (int) ($data['id'] ?? $_GET['id'] ?? 0);
        $booking = findBookingById($id);
        $user = currentUser();

        if (!$booking) {
            jsonResponse(['error' => 'Demande de garde introuvable.'], 404);
        }

        if (!isAdmin() && (int) $booking['user_id'] !== (int) $user['id']) {
            jsonResponse(['error' => 'Accès refusé.'], 403);
        }

        if (isAdmin()) {
            $delete = db()->prepare('DELETE FROM booking_requests WHERE id = :id');
            $delete->execute(['id' => $id]);
            jsonResponse(['message' => 'Demande de garde supprimée.']);
        }

        $update = db()->prepare('UPDATE booking_requests SET status = "cancelled" WHERE id = :id');
        $update->execute(['id' => $id]);
        jsonResponse(['message' => 'Demande de garde annulée.']);
    }

    jsonResponse(['error' => 'Méthode non autorisée.'], 405);
} catch (PDOException $error) {
    if (db()->inTransaction()) {
        db()->rollBack();
    }

    jsonResponse(['error' => 'Erreur base de données.'], 500);
}
