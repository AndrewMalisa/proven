<?php
declare(strict_types=1);

class Database
{
    private string $host = '127.0.0.1';
    private string $dbName = 'proven';
    private string $username = 'root';
    private string $password = '';

    public function getConnection(): ?PDO
    {
        try {
            $dsn = sprintf(
                'mysql:host=%s;dbname=%s;charset=utf8mb4',
                $this->host,
                $this->dbName
            );

            $pdo = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);

            return $pdo;
        } catch (PDOException $e) {
            // In production, log this instead of exposing details.
            return null;
        }
    }
}
