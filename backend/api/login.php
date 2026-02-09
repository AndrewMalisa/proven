<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_json(['success' => false, 'message' => 'Method not allowed'], 405);
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput ?? '', true);

if (!is_array($input)) {
    send_json(['success' => false, 'message' => 'Invalid JSON body'], 400);
}

$email = trim((string)($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if ($email === '' || $password === '') {
    send_json([
        'success' => false,
        'message' => 'Email and password are required',
    ], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json([
        'success' => false,
        'message' => 'Invalid email address',
    ], 422);
}

$database = new Database();
$db = $database->getConnection();

if ($db === null) {
    send_json([
        'success' => false,
        'message' => 'Database connection failed',
    ], 500);
}

try {
    $stmt = $db->prepare(
        'SELECT id, name, email, password_hash, role
         FROM users
         WHERE email = :email
         LIMIT 1'
    );

    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        send_json([
            'success' => false,
            'message' => 'Invalid email or password',
        ], 401);
    }

    // Remove sensitive fields before returning
    unset($user['password_hash']);

    send_json([
        'success' => true,
        'message' => 'Login successful',
        'user'    => $user,
    ]);
} catch (PDOException $e) {
    send_json([
        'success' => false,
        'message' => 'Login failed',
    ], 500);
}

