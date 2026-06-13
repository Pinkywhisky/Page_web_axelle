<?php

declare(strict_types=1);

require_once __DIR__ . '/functions.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
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

function csrfToken(): string
{
    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function requireCsrfToken(): void
{
    $expected = csrfToken();
    $provided = (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');

    if ($provided === '' || !hash_equals($expected, $provided)) {
        jsonResponse(['error' => 'Session expirée, merci de rafraîchir la page.'], 419);
    }
}

function refreshSessionUser(array $user): void
{
    $_SESSION['user'] = publicUser($user);
}
