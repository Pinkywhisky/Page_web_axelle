<?php

declare(strict_types=1);

/*
 * Script de bootstrap.
 * À supprimer ou désactiver en production.
 */

require_once __DIR__ . '/includes/db.php';
require_once __DIR__ . '/includes/functions.php';

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    echo 'Ce script doit être exécuté en ligne de commande.';
    exit;
}

if (ALLOW_CREATE_ADMIN !== 'true') {
    echo "Création admin désactivée. Passez ALLOW_CREATE_ADMIN=\"true\" dans .env le temps du bootstrap.\n";
    exit(1);
}

$email = strtolower(trim($argv[1] ?? ''));
$password = (string) ($argv[2] ?? '');
$fullName = trim($argv[3] ?? 'Administrateur');

if (!isValidEmailStrict($email) || strlen($password) < 8 || $fullName === '') {
    echo "Usage: php create_admin.php admin@example.com motdepasse \"Nom Admin\"\n";
    echo "Le mot de passe doit contenir au moins 8 caractères.\n";
    exit(1);
}

$statement = db()->prepare(
    'INSERT INTO users (full_name, email, password_hash, role)
     VALUES (:full_name, :email, :password_hash, "admin")'
);
$statement->execute([
    'full_name' => $fullName,
    'email' => $email,
    'password_hash' => password_hash($password, PASSWORD_DEFAULT),
]);

echo "Compte admin créé. Supprimez ce fichier immédiatement.\n";
