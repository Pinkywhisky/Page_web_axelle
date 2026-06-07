<?php

declare(strict_types=1);

require_once __DIR__ . '/functions.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function isLoggedIn(): bool
{
    return isset($_SESSION['user']) && is_array($_SESSION['user']);
}

function currentUser(): ?array
{
    return isLoggedIn() ? $_SESSION['user'] : null;
}

function isAdmin(): bool
{
    $user = currentUser();
    return $user !== null && ($user['role'] ?? '') === 'admin';
}

function requireLogin(): void
{
    if (!isLoggedIn()) {
        jsonResponse(['error' => 'Vous devez être connecté.'], 401);
    }
}

function requireAdmin(): void
{
    requireLogin();

    if (!isAdmin()) {
        jsonResponse(['error' => 'Accès réservé aux administrateurs.'], 403);
    }
}

function refreshSessionUser(array $user): void
{
    $_SESSION['user'] = publicUser($user);
}

