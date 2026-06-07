<?php

declare(strict_types=1);

function e(?string $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function jsonResponse(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function isValidEmailStrict(string $email): bool
{
    $email = trim($email);

    if ($email === '' || strlen($email) > 190) {
        return false;
    }

    if (preg_match('/[^\x00-\x7F]/', $email)) {
        return false;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return false;
    }

    return (bool) preg_match('/^[A-Za-z0-9.!#$%&\'*+\/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/', $email);
}

function readJsonBody(): array
{
    $rawBody = file_get_contents('php://input') ?: '';
    $data = json_decode($rawBody, true);

    return is_array($data) ? $data : [];
}

function cleanText(mixed $value, int $maxLength): string
{
    $text = trim((string) $value);

    return $text;
}

function publicUser(array $user): array
{
    return [
        'id' => (int) $user['id'],
        'full_name' => $user['full_name'],
        'fullName' => $user['full_name'],
        'email' => $user['email'],
        'phone' => $user['phone'] ?? '',
        'animal_type' => $user['animal_type'] ?? '',
        'animalType' => $user['animal_type'] ?? '',
        'animal_name' => $user['animal_name'] ?? '',
        'animalName' => $user['animal_name'] ?? '',
        'role' => $user['role'],
        'created_at' => $user['created_at'] ?? null,
        'createdAt' => $user['created_at'] ?? null,
    ];
}
