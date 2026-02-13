<?php

class EscrowController
{
    /* ==============================
     * Helpers
     * ============================== */

    private static function generateRef(): string
    {
        return 'ESC_' . strtoupper(bin2hex(random_bytes(6)));
    }

    private static function getEscrowByRef(PDO $pdo, string $ref): array
    {
        $stmt = $pdo->prepare(
            "SELECT * FROM escrows WHERE escrow_ref = :ref LIMIT 1"
        );
        $stmt->execute([':ref' => $ref]);
        $escrow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$escrow) {
            throw new Exception("Escrow not found");
        }

        return $escrow;
    }

    private static function logTransaction(
        PDO $pdo,
        int $escrowId,
        string $action,
        int $actorId,
        float $amount
    ): void {
        $stmt = $pdo->prepare("
            INSERT INTO escrow_transactions
                (escrow_id, action, actor_id, amount)
            VALUES
                (:escrow_id, :action, :actor_id, :amount)
        ");
        $stmt->execute([
            ':escrow_id' => $escrowId,
            ':action' => $action,
            ':actor_id' => $actorId,
            ':amount' => $amount
        ]);
    }

    /* ==============================
     * Core Escrow Operations
     * ============================== */

    /**
     * Create escrow (no funds moved yet)
     */
    public static function createEscrow()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            $payerId = (int) ($data['payerId'] ?? 0);
            $payeeId = (int) ($data['payeeId'] ?? 0);
            $amount = (float) ($data['amount'] ?? 0);
            $description = $data['description'] ?? null;
            $expiresAtRaw = trim($data['expiresAt'] ?? '');
            $expiresAt = (new DateTime($expiresAtRaw))->format('Y-m-d H:i:s');

            if ($payerId <= 0 || $payeeId <= 0) {
                Response::error("Invalid payer or payee", 400);
            }

            if ($amount <= 0) {
                Response::error("Invalid escrow amount", 400);
            }

            $pdo = Database::connect();

            $ref = self::generateRef();

            $stmt = $pdo->prepare("
            INSERT INTO escrows
                (escrow_ref, payer_id, payee_id, amount, description, status, expires_at)
            VALUES
                (:ref, :payer, :payee, :amount, :description, 'pending', :expires_at)
        ");

            $stmt->execute([
                ':ref' => $ref,
                ':payer' => $payerId,
                ':payee' => $payeeId,
                ':amount' => $amount,
                ':description' => $description,
                ':expires_at' => $expiresAt ?: null
            ]);

            Response::json([
                'escrow_ref' => $ref,
                'status' => 'pending'
            ]);

        } catch (PDOException $e) {
            // Database-related errors
            Response::error("Database error", 500);

        } catch (Throwable $e) {
            // Any other unexpected errors
            Response::error("Something went wrong", 500);
        }
    }

    // get escrow
    public static function getEscrow()
    {
        $data = json_decode(file_get_contents("php://input"), true);
        $escrowId = (int) ($data['escrowId'] ?? 0);

        $pdo = Database::connect();


        try {
            // 1️⃣ Fetch escrow + payer/payee + transactions
            $stmt = $pdo->prepare("
            SELECT 
                e.*,
                payer.id AS payer_id, payer.full_name AS payer_name, payer.username AS payer_username,
                payee.id AS payee_id, payee.full_name AS payee_name, payee.username AS payee_username,
                t.id AS tx_id, t.action AS tx_action, t.actor_id AS tx_actor_id, t.amount AS tx_amount, t.created_at AS tx_created_at,
                actor.full_name AS actor_name, actor.username AS actor_username
            FROM escrows e
            JOIN users payer ON payer.id = e.payer_id
            JOIN users payee ON payee.id = e.payee_id
            LEFT JOIN escrow_transactions t ON t.escrow_id = e.id
            LEFT JOIN users actor ON actor.id = t.actor_id
            WHERE e.id = ?
            ORDER BY t.created_at ASC
        ");
            $stmt->execute([$escrowId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!$rows) {
                Response::error("Escrow not found");
            }

            // 2️⃣ Map the escrow object
            $first = $rows[0];
            $escrow = [
                "id" => (int) $first['id'],
                "escrow_ref" => $first['escrow_ref'],
                "payer" => [
                    "id" => (int) $first['payer_id'],
                    "full_name" => $first['payer_name'],
                    "username" => $first['payer_username']
                ],
                "payee" => [
                    "id" => (int) $first['payee_id'],
                    "full_name" => $first['payee_name'],
                    "username" => $first['payee_username']
                ],
                "amount" => (float) $first['amount'],
                "description" => $first['description'],
                "status" => $first['status'],
                "expires_at" => $first['expires_at'],
                "created_at" => $first['created_at'],
                "transactions" => []
            ];

            // 3️⃣ Map transactions
            foreach ($rows as $row) {
                if ($row['tx_id']) {
                    $escrow['transactions'][] = [
                        "id" => (int) $row['tx_id'],
                        "escrow_id" => (int) $row['id'],
                        "action" => $row['tx_action'],
                        "actor" => [
                            "id" => (int) $row['tx_actor_id'],
                            "full_name" => $row['actor_name'],
                            "username" => $row['actor_username']
                        ],
                        "amount" => (float) $row['tx_amount'],
                        "created_at" => $row['tx_created_at']
                    ];
                }
            }

            // 4️⃣ Optional: compute countdown if expires_at is set
            if ($escrow['expires_at']) {
                $expires = new DateTime($escrow['expires_at']);
                $now = new DateTime();
                $escrow['time_left'] = max(0, $expires->getTimestamp() - $now->getTimestamp());
            }

            // 5️⃣ Return success response
            Response::json([
                "status" => true,
                "message" => "Escrow fetched successfully",
                "data" => $escrow
            ]);
        } catch (PDOException $e) {
            Response::error("Something went wrong");
        }
    }

    /**
     * Fund escrow (lock payer funds)
     */
    public static function fundEscrow()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            $escrowRef = trim($data['escrowRef'] ?? '');
            $payerId = (int) ($data['payerId'] ?? 0);

            if (!$escrowRef || $payerId <= 0) {
                Response::error("Invalid request data", 400);
            }

            $pdo = Database::connect();

            $escrow = self::getEscrowByRef($pdo, $escrowRef);

            if ($escrow['status'] !== 'pending') {
                Response::error("Escrow cannot be funded", 400);
            }

            if ((int) $escrow['payer_id'] !== $payerId) {
                Response::error("Unauthorized funding attempt", 403);
            }

            $pdo->beginTransaction();

            // Lock funds
            $stmt = $pdo->prepare("
                UPDATE wallets
                SET balance = balance - :amount,
                    locked_balance = locked_balance + :amount
                WHERE user_id = :user_id
                AND balance >= :amount
            ");
            $stmt->execute([
                ':amount' => $escrow['amount'],
                ':user_id' => $payerId
            ]);

            if ($stmt->rowCount() !== 1) {
                throw new Exception("Insufficient balance");
            }

            // Update escrow
            $stmt = $pdo->prepare("
                UPDATE escrows
                SET status = 'funded'
                WHERE id = :id
            ");
            $stmt->execute([':id' => $escrow['id']]);

            self::logTransaction(
                $pdo,
                (int) $escrow['id'],
                'fund',
                $payerId,
                (float) $escrow['amount']
            );

            $pdo->commit();

            Response::json([
                'escrow_ref' => $escrowRef,
                'status' => 'funded'
            ]);

        } catch (PDOException $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            Response::error("Database error", 500);

        } catch (Throwable $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            Response::error($e->getMessage(), 400);
        }
    }


    /**
     * Release funds to payee
     */
    public static function releaseEscrow()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            $escrowRef = trim($data['escrowRef'] ?? '');
            $actorId = (int) ($data['actorId'] ?? 0);

            if (!$escrowRef) {
                Response::error("Invalid escrow reference", 400);
            }

            if ($actorId < 0) {
                Response::error("Invalid actor", 400);
            }


            $pdo = Database::connect();

            $escrow = self::getEscrowByRef($pdo, $escrowRef);

            if ($escrow['status'] !== 'delivered') {
                Response::error("Escrow cannot be released", 400);
            }

            // Actor must be payer
            if ((int) $escrow['payer_id'] !== $actorId) {
                Response::error("Unauthorized release", 403);
            }

            $pdo->beginTransaction();

            // Debit locked funds from payer
            $stmt = $pdo->prepare("
                UPDATE wallets
                SET locked_balance = locked_balance - :amount
                WHERE user_id = :payer_id
                AND locked_balance >= :amount
            ");
            $stmt->execute([
                ':amount' => $escrow['amount'],
                ':payer_id' => $escrow['payer_id']
            ]);

            if ($stmt->rowCount() !== 1) {
                throw new Exception("Locked balance error");
            }

            // Credit payee wallet
            $stmt = $pdo->prepare("
                UPDATE wallets
                SET balance = balance + :amount
                WHERE user_id = :payee_id
            ");
            $stmt->execute([
                ':amount' => $escrow['amount'],
                ':payee_id' => $escrow['payee_id']
            ]);

            // Update escrow status (guard against double release)
            $stmt = $pdo->prepare("
                UPDATE escrows
                SET status = 'released'
                WHERE id = :id AND status = 'delivered'
            ");
            $stmt->execute([':id' => $escrow['id']]);

            if ($stmt->rowCount() !== 1) {
                throw new Exception("Escrow already released");
            }

            self::logTransaction(
                $pdo,
                (int) $escrow['id'],
                'release',
                $actorId,
                (float) $escrow['amount']
            );

            $pdo->commit();

            Response::json([
                'escrow_ref' => $escrowRef,
                'status' => 'released'
            ]);

        } catch (PDOException $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            Response::error("Database error", 500);

        } catch (Throwable $e) {
            if (isset($pdo) && $pdo->inTransaction()) {
                $pdo->rollBack();
            }
            Response::error($e->getMessage(), 400);
        }
    }


    /**
     * Refund escrow to payer
     */
    public static function refundEscrow()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            $escrowRef = trim($data['escrowRef'] ?? '');
            $actorId = (int) ($data['actorId'] ?? 0);

            $pdo = Database::connect();

            if (!$escrowRef || $actorId < 0) {
                Response::error("Invalid request data", 400);
            }

            $escrow = self::getEscrowByRef($pdo, $escrowRef);

            if ($escrow['status'] !== 'funded') {
                Response::error("Escrow cannot be refunded", 400);
            }

            // Actor must be payee
            if ((int) $escrow['payee_id'] !== $actorId) {
                Response::error("Unauthorized refund", 403);
            }



            $pdo->beginTransaction();

            $stmt = $pdo->prepare("
            UPDATE wallets
            SET locked_balance = locked_balance - :amount,
                balance = balance + :amount
            WHERE user_id = :payer_id
        ");
            $stmt->execute([
                ':amount' => $escrow['amount'],
                ':payer_id' => $escrow['payer_id']
            ]);

            if ($stmt->rowCount() !== 1) {
                Response::error("Wallet refund failed", 500);
            }

            $stmt = $pdo->prepare("
            UPDATE escrows
            SET status = 'refunded'
            WHERE id = :id
        ");
            $stmt->execute([':id' => $escrow['id']]);

            self::logTransaction(
                $pdo,
                (int) $escrow['id'],
                'refund',
                $actorId,
                (float) $escrow['amount']
            );

            $pdo->commit();

            Response::json([
                'escrow_ref' => $escrowRef,
                'status' => 'refunded'
            ]);
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }

            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Mark escrow as delivered
     */
    public static function deliverEscrow()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            $escrowRef = trim($data['escrowRef'] ?? '');
            $actorId = (int) ($data['actorId'] ?? 0);

            $pdo = Database::connect();

            if (!$escrowRef || $actorId <= 0) {
                Response::error("Invalid request data", 400);
            }

            $escrow = self::getEscrowByRef($pdo, $escrowRef);

            if ($escrow['status'] !== 'funded') {
                Response::error("Escrow not funded", 400);
            }

            // Only payee 
            if ((int) $escrow['payee_id'] !== $actorId) {
                Response::error("Unauthorized dispute", 403);
            }

            $stmt = $pdo->prepare("
                UPDATE escrows
                SET status = 'delivered'
                WHERE id = :id
            ");
            $stmt->execute([':id' => $escrow['id']]);

            self::logTransaction(
                $pdo,
                (int) $escrow['id'],
                'deliver',
                $actorId,
                (float) $escrow['amount']
            );

            Response::json([
                'escrow_ref' => $escrowRef,
                'status' => 'delivered'
            ]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Mark escrow as disputed
     */
    public static function disputeEscrow()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            $escrowRef = trim($data['escrowRef'] ?? '');
            $actorId = (int) ($data['actorId'] ?? 0);

            $pdo = Database::connect();

            if (!$escrowRef || $actorId <= 0) {
                Response::error("Invalid request data", 400);
            }

            $escrow = self::getEscrowByRef($pdo, $escrowRef);

            if ($escrow['status'] !== 'funded' && $escrow['status'] !== 'delivered') {
                Response::error("Only funded escrows can be disputed", 400);
            }

            // Only payer or payee can raise a dispute
            if (
                !in_array(
                    $actorId,
                    [(int) $escrow['payer_id'], (int) $escrow['payee_id']],
                    true
                )
            ) {
                Response::error("Unauthorized dispute", 403);
            }

            $stmt = $pdo->prepare("
            UPDATE escrows
            SET status = 'disputed'
            WHERE id = :id
        ");
            $stmt->execute([':id' => $escrow['id']]);

            self::logTransaction(
                $pdo,
                (int) $escrow['id'],
                'dispute',
                $actorId,
                (float) $escrow['amount']
            );

            Response::json([
                'escrow_ref' => $escrowRef,
                'status' => 'disputed'
            ]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

    /**
     * Cancel Escrow
     */
    public static function cancelEscrow()
    {
        try {
            $data = json_decode(file_get_contents("php://input"), true);

            $escrowRef = trim($data['escrowRef'] ?? '');
            $actorId = (int) ($data['actorId'] ?? 0);

            $pdo = Database::connect();

            if (!$escrowRef || $actorId <= 0) {
                Response::error("Invalid request data", 400);
            }

            $escrow = self::getEscrowByRef($pdo, $escrowRef);

            if ($escrow['status'] !== 'pending') {
                Response::error("Escrow cannot be cancelled", 400);
            }

            // Only payer or payee can cancel
            if (
                !in_array(
                    $actorId,
                    [(int) $escrow['payer_id'], (int) $escrow['payee_id']],
                    true
                )
            ) {
                Response::error("Unauthorized action", 403);
            }

            $stmt = $pdo->prepare("
                UPDATE escrows
                SET status = 'cancelled'
                WHERE id = :id
            ");
            $stmt->execute([':id' => $escrow['id']]);

            self::logTransaction(
                $pdo,
                (int) $escrow['id'],
                'cancel',
                $actorId,
                (float) $escrow['amount']
            );

            Response::json([
                'escrow_ref' => $escrowRef,
                'status' => 'cancelled'
            ]);
        } catch (Throwable $e) {
            Response::error($e->getMessage(), 500);
        }
    }

}
