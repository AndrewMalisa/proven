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

$name = trim((string)($input['name'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$password = (string)($input['password'] ?? '');

if ($name === '' || $email === '' || $password === '') {
    send_json([
        'success' => false,
        'message' => 'Name, email and password are required',
    ], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json([
        'success' => false,
        'message' => 'Invalid email address',
    ], 422);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$role = 'user'; // default role for now

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
        'INSERT INTO users (name, email, password_hash, role)
         VALUES (:name, :email, :password_hash, :role)'
    );

    $stmt->execute([
        ':name'          => $name,
        ':email'         => $email,
        ':password_hash' => $passwordHash,
        ':role'          => $role,
    ]);

    send_json([
        'success' => true,
        'message' => 'User registered successfully',
    ], 201);
} catch (PDOException $e) {
    if ((int)$e->getCode() === 23000) {
        // Likely duplicate email
        send_json([
            'success' => false,
            'message' => 'Email is already registered',
        ], 409);
    }

    send_json([
        'success' => false,
        'message' => 'Registration failed',
    ], 500);
}

