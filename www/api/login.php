<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Méthode non autorisée.'], 405);
}

requireCsrfToken();

$data = readJsonBody();
$email = strtolower(trim((string) ($data['email'] ?? '')));
$password = (string) ($data['password'] ?? '');

if (!isValidEmailStrict($email) || $password === '') {
    jsonResponse(['error' => 'Adresse e-mail ou mot de passe invalide.'], 400);
}

$statement = db()->prepare('SELECT * FROM users WHERE email = :email LIMIT 1');
$statement->execute(['email' => $email]);
$user = $statement->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    jsonResponse(['error' => 'Identifiants incorrects.'], 401);
}

session_regenerate_id(true);
refreshSessionUser($user);

jsonResponse(['user' => currentUser()]);
