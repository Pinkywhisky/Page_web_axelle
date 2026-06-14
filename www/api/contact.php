<?php

declare(strict_types=1);

require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';

function publicContactRequest(array $request): array
{
    return [
        'id' => (int) $request['id'],
        'full_name' => $request['full_name'],
        'fullName' => $request['full_name'],
        'email' => $request['email'],
        'phone' => $request['phone'] ?? '',
        'message' => $request['message'],
        'admin_reply' => $request['admin_reply'] ?? '',
        'adminReply' => $request['admin_reply'] ?? '',
        'client_reply' => $request['client_reply'] ?? '',
        'clientReply' => $request['client_reply'] ?? '',
        'status' => $request['status'],
        'replied_at' => $request['replied_at'] ?? null,
        'repliedAt' => $request['replied_at'] ?? null,
        'client_replied_at' => $request['client_replied_at'] ?? null,
        'clientRepliedAt' => $request['client_replied_at'] ?? null,
        'is_registered_user' => (bool) ($request['is_registered_user'] ?? false),
        'isRegisteredUser' => (bool) ($request['is_registered_user'] ?? false),
        'messages' => contactMessages($request),
        'created_at' => $request['created_at'],
        'createdAt' => $request['created_at'],
    ];
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

function ensureContactReplyColumns(): void
{
    db()->exec(
        "ALTER TABLE contact_requests
         MODIFY COLUMN status ENUM('new', 'waiting', 'closed', 'handled') NOT NULL DEFAULT 'new'"
    );
    db()->exec("UPDATE contact_requests SET status = 'closed' WHERE status = 'handled'");
    db()->exec(
        "ALTER TABLE contact_requests
         MODIFY COLUMN status ENUM('new', 'waiting', 'closed') NOT NULL DEFAULT 'new'"
    );

    if (!columnExists('contact_requests', 'admin_reply')) {
        db()->exec('ALTER TABLE contact_requests ADD COLUMN admin_reply TEXT DEFAULT NULL');
    }

    if (!columnExists('contact_requests', 'client_reply')) {
        db()->exec('ALTER TABLE contact_requests ADD COLUMN client_reply TEXT DEFAULT NULL');
    }

    if (!columnExists('contact_requests', 'replied_at')) {
        db()->exec('ALTER TABLE contact_requests ADD COLUMN replied_at DATETIME DEFAULT NULL');
    }

    if (!columnExists('contact_requests', 'client_replied_at')) {
        db()->exec('ALTER TABLE contact_requests ADD COLUMN client_replied_at DATETIME DEFAULT NULL');
    }

    if (!columnExists('contact_requests', 'conversation')) {
        db()->exec('ALTER TABLE contact_requests ADD COLUMN conversation TEXT DEFAULT NULL');
    }
}

function findContactRequestById(int $id): ?array
{
    $statement = db()->prepare('SELECT * FROM contact_requests WHERE id = :id LIMIT 1');
    $statement->execute(['id' => $id]);
    $request = $statement->fetch();

    return $request ?: null;
}

function contactEmailHasUser(string $email): bool
{
    $statement = db()->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $statement->execute(['email' => strtolower(trim($email))]);

    return (bool) $statement->fetch();
}

function contactMessages(array $contact): array
{
    $conversation = trim((string) ($contact['conversation'] ?? ''));
    $decoded = $conversation !== '' ? json_decode($conversation, true) : null;

    if (is_array($decoded)) {
        return array_values(array_filter($decoded, fn(mixed $message): bool => is_array($message)));
    }

    $messages = [[
        'author' => 'client',
        'authorName' => $contact['full_name'] ?? '',
        'message' => $contact['message'] ?? '',
        'createdAt' => $contact['created_at'] ?? null,
    ]];

    if (!empty($contact['admin_reply'])) {
        $messages[] = [
            'author' => 'admin',
            'authorName' => 'Axelle',
            'message' => $contact['admin_reply'],
            'createdAt' => $contact['replied_at'] ?? null,
        ];
    }

    if (!empty($contact['client_reply'])) {
        $messages[] = [
            'author' => 'client',
            'authorName' => $contact['full_name'] ?? '',
            'message' => $contact['client_reply'],
            'createdAt' => $contact['client_replied_at'] ?? null,
        ];
    }

    return $messages;
}

function appendLegacyMessage(?string $existing, string $message): string
{
    $existing = trim((string) $existing);

    if ($existing === '') {
        return $message;
    }

    return $existing . "\n\n" . $message;
}

function encodeContactMessages(array $contact, string $author, string $authorName, string $message): string
{
    $messages = contactMessages($contact);
    $messages[] = [
        'author' => $author,
        'authorName' => $authorName,
        'message' => $message,
        'createdAt' => date('Y-m-d H:i:s'),
    ];

    return json_encode($messages, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method !== 'GET') {
        requireCsrfToken();
    }

    if ($method === 'GET') {
        requireLogin();
        ensureContactReplyColumns();

        if (!isAdmin()) {
            $user = currentUser();
            $statement = db()->prepare(
                'SELECT contact_requests.*, 1 AS is_registered_user
                 FROM contact_requests
                 WHERE email = :email
                   AND status <> "closed"
                 ORDER BY created_at DESC, id DESC'
            );
            $statement->execute(['email' => $user['email'] ?? '']);

            jsonResponse(['contacts' => array_map('publicContactRequest', $statement->fetchAll())]);
        }

        $statement = db()->query(
            'SELECT contact_requests.*,
                    EXISTS(
                        SELECT 1
                        FROM users
                        WHERE users.email = contact_requests.email
                    ) AS is_registered_user
             FROM contact_requests
             ORDER BY
                FIELD(status, "new", "waiting", "closed"),
                created_at DESC,
                id DESC'
        );

        jsonResponse(['contacts' => array_map('publicContactRequest', $statement->fetchAll())]);
    }

    if ($method === 'POST') {
        ensureContactReplyColumns();

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

        if (!isValidFrenchPhone($phone)) {
            jsonResponse(['error' => 'Numéro de téléphone invalide.'], 400);
        }

        $conversation = json_encode([[
            'author' => 'client',
            'authorName' => $fullName,
            'message' => $message,
            'createdAt' => date('Y-m-d H:i:s'),
        ]], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $statement = db()->prepare(
            'INSERT INTO contact_requests (full_name, email, phone, message, conversation)
             VALUES (:full_name, :email, :phone, :message, :conversation)'
        );
        $statement->execute([
            'full_name' => $fullName,
            'email' => $email,
            'phone' => $phone ?: null,
            'message' => $message,
            'conversation' => $conversation,
        ]);

        jsonResponse(['message' => 'Votre message a bien été envoyé.'], 201);
    }

    if ($method === 'PUT') {
        requireLogin();
        ensureContactReplyColumns();

        $data = readJsonBody();
        $id = (int) ($data['id'] ?? 0);
        $contact = findContactRequestById($id);

        if ($id <= 0 || !$contact) {
            jsonResponse(['error' => 'Message introuvable.'], 404);
        }

        if (!isAdmin()) {
            $user = currentUser();

            if (($user['email'] ?? '') !== ($contact['email'] ?? '')) {
                jsonResponse(['error' => 'Accès refusé.'], 403);
            }

            if (($contact['status'] ?? '') === 'closed') {
                jsonResponse(['error' => 'Cette discussion est fermée.'], 400);
            }

            $clientReply = cleanText($data['client_reply'] ?? $data['clientReply'] ?? '', 1200);

            if ($clientReply === '') {
                jsonResponse(['error' => 'Merci de saisir une réponse.'], 400);
            }

            if (strlen($clientReply) > 1200) {
                jsonResponse(['error' => 'La réponse est trop longue.'], 400);
            }

            $statement = db()->prepare(
                'UPDATE contact_requests
                 SET status = "new",
                     client_reply = :client_reply,
                     client_replied_at = NOW(),
                     conversation = :conversation
                 WHERE id = :id'
            );
            $statement->execute([
                'id' => $id,
                'client_reply' => appendLegacyMessage($contact['client_reply'] ?? '', $clientReply),
                'conversation' => encodeContactMessages($contact, 'client', $contact['full_name'] ?? '', $clientReply),
            ]);

            jsonResponse(['message' => 'Réponse envoyée.', 'contact' => publicContactRequest(findContactRequestById($id))]);
        }

        $status = cleanText($data['status'] ?? '', 20);
        $adminReply = cleanText($data['admin_reply'] ?? $data['adminReply'] ?? '', 1200);

        if (!in_array($status, ['new', 'waiting', 'closed'], true)) {
            jsonResponse(['error' => 'Statut invalide.'], 400);
        }

        if ($status === 'waiting' && $adminReply === '') {
            jsonResponse(['error' => 'Merci de saisir une réponse.'], 400);
        }

        if (($contact['status'] ?? '') === 'closed' && $adminReply !== '') {
            jsonResponse(['error' => 'Cette discussion est fermée.'], 400);
        }

        if (strlen($adminReply) > 1200) {
            jsonResponse(['error' => 'La réponse est trop longue.'], 400);
        }

        if ($adminReply !== '' && !contactEmailHasUser((string) $contact['email'])) {
            jsonResponse([
                'error' => "Réponse impossible : cette adresse e-mail n'est pas associée à un compte.",
            ], 409);
        }

        $adminName = currentUser()['full_name'] ?? 'Axelle';
        $nextAdminReply = $adminReply !== ''
            ? appendLegacyMessage($contact['admin_reply'] ?? '', $adminReply)
            : ($contact['admin_reply'] ?? null);
        $nextConversation = $adminReply !== ''
            ? encodeContactMessages($contact, 'admin', $adminName, $adminReply)
            : ($contact['conversation'] ?? null);

        $statement = db()->prepare(
            'UPDATE contact_requests
             SET status = :status,
                 admin_reply = :admin_reply,
                 replied_at = CASE
                    WHEN :admin_reply_for_date <> "" THEN NOW()
                    ELSE replied_at
                 END,
                 conversation = :conversation
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'status' => $status,
            'admin_reply' => $nextAdminReply,
            'admin_reply_for_date' => $adminReply,
            'conversation' => $nextConversation,
        ]);

        jsonResponse(['message' => 'Message mis à jour.', 'contact' => publicContactRequest(findContactRequestById($id))]);
    }

    if ($method === 'DELETE') {
        requireAdmin();
        ensureContactReplyColumns();

        $data = readJsonBody();
        $id = (int) ($data['id'] ?? $_GET['id'] ?? 0);
        $contact = findContactRequestById($id);

        if ($id <= 0 || !$contact) {
            jsonResponse(['error' => 'Message introuvable.'], 404);
        }

        if (($contact['status'] ?? '') !== 'closed') {
            jsonResponse(['error' => 'Seules les conversations archivées peuvent être supprimées.'], 400);
        }

        $statement = db()->prepare('DELETE FROM contact_requests WHERE id = :id');
        $statement->execute(['id' => $id]);

        jsonResponse(['message' => 'Conversation supprimée.']);
    }

    jsonResponse(['error' => 'Méthode non autorisée.'], 405);
} catch (PDOException $error) {
    jsonResponse(['error' => 'Erreur base de données.'], 500);
}
