<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/functions.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée.'], 405);
}

$data = readJsonBody();
$fullName = cleanText($data['full_name'] ?? $data['fullName'] ?? '', 150);
$email = strtolower(cleanText($data['email'] ?? '', 190));
$phone = cleanText($data['phone'] ?? '', 30);
$message = cleanText($data['message'] ?? '', 1200);

if ($fullName === '') {
    jsonResponse(['error' => 'Le nom complet est obligatoire.'], 400);
}

if (!isValidEmailStrict($email)) {
    jsonResponse(['error' => 'Adresse e-mail invalide. Les accents ne sont pas autorisés.'], 400);
}

if ($message === '') {
    jsonResponse(['error' => 'Le message est obligatoire.'], 400);
}

if (
    strlen($fullName) > 150 ||
    strlen($email) > 190 ||
    strlen($phone) > 30 ||
    strlen($message) > 1200
) {
    jsonResponse(['error' => 'Un des champs saisis est trop long.'], 400);
}

try {
    $statement = db()->prepare(
        'INSERT INTO contact_requests (full_name, email, phone, message)
         VALUES (:full_name, :email, :phone, :message)'
    );
    $statement->execute([
        'full_name' => $fullName,
        'email' => $email,
        'phone' => $phone ?: null,
        'message' => $message,
    ]);

    jsonResponse(['message' => 'Votre message a bien été envoyé.'], 201);
} catch (PDOException $error) {
    jsonResponse(['error' => 'Erreur base de données.'], 500);
}

