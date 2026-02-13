<?php
// ==========================================
// 1. LOAD ENVIRONMENT
// ==========================================
require __DIR__ . '/../vendor/autoload.php';

require __DIR__ . '/../config/env.php';
require __DIR__ . '/../config/database.php';
require __DIR__ . '/../core/Response.php';
require __DIR__ . '/../models/Bank.php';
require __DIR__ . '/../controllers/AuthController.php';
require __DIR__ . '/../controllers/UserController.php';
require __DIR__ . '/../controllers/WalletController.php';
require __DIR__ . '/../controllers/FlutterwaveController.php';
require __DIR__ . '/../controllers/BankController.php';
require __DIR__ . '/../controllers/EscrowController.php';
require __DIR__ . '/../controllers/VTUController.php';
require __DIR__ . '/../controllers/NotificationController.php';
require __DIR__ . '/../controllers/SupportController.php';
require __DIR__ . '/../controllers/CardController.php';
require __DIR__ . '/../controllers/AdminController.php';
require __DIR__ . '/../controllers/MailController.php';
require __DIR__ . '/../scripts/sync_banks.php';

// 🔐 Allow specific frontend (recommended for prod)
$allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

// Handle CORS
if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// 🔥 Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ==========================================
// 2. ROUTING
// ==========================================
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Normalize URL: remove trailing slash and extra spaces
$uri = rtrim(trim($uri), '/');

// Optional: remove folder prefix if needed (your DocumentRoot is already 'public', so this can be empty)
$basePath = '';
if (!empty($basePath) && strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
}


// ===========================
// ROUTE DEFINITIONS
// ===========================

$routes = [
    '/api/tester' => [
        'ANY' => [NotificationController::class, 'testNotification']
    ],

    // ---------------------------
    // USER ROUTES
    // ---------------------------
    '/api/user/me' => [
        'POST' => [UserController::class, 'getUserByUUID']
    ],
    '/api/user/verifyEmail' => [
        'POST' => [UserController::class, 'verifyUserEmail']
    ],
    '/api/user/get_verification' => [
        'POST' => [UserController::class, 'getUserVerifications']
    ],
    '/api/user/submit_bvn' => [
        'POST' => [UserController::class, 'updateUserBVN']
    ],
    '/api/user/submit_nin' => [
        'POST' => [UserController::class, 'updateUserNIN']
    ],
    '/api/user/submit_address' => [
        'POST' => [UserController::class, 'updateUserAddress']
    ],
    '/api/user/submit_nok' => [
        'POST' => [UserController::class, 'updateUserNOK']
    ],
    '/api/user/fetchUserByDetails' => [
        'POST' => [UserController::class, 'fetchUserByDetails']
    ],

    // ---------------------------
    // AUTH ROUTES
    // ---------------------------
    '/api/auth/login' => [
        'POST' => [AuthController::class, 'login']
    ],
    '/api/auth/login/pin' => [
        'POST' => [AuthController::class, 'loginWithPin']
    ],
    '/api/auth/send_email_code' => [
        'POST' => [AuthController::class, 'sendEmailCode']
    ],
    '/api/auth/verify_email_code' => [
        'POST' => [AuthController::class, 'verifyEmailCode']
    ],
    '/api/auth/register' => [
        'POST' => [UserController::class, 'createUser']
    ],
    '/api/auth/create_login_pin' => [
        'POST' => [AuthController::class, 'createLoginPin']
    ],
    '/api/auth/update_pin' => [
        'POST' => [AuthController::class, 'updatePin']
    ],
    '/api/auth/change_password' => [
        'POST' => [AuthController::class, 'changePassword']
    ],
    '/api/auth/send_reset_code' => [
        'POST' => [AuthController::class, 'resetPassword']
    ],
    '/api/auth/logout' => [
        'POST' => [AuthController::class, 'logoutDevice']
    ],
    '/api/auth/verifyTxPin' => [
        'POST' => [AuthController::class, 'verifyTxPin']
    ],
    '/api/auth/saveBiometricToken' => [
        'POST' => [AuthController::class, 'saveBiometricToken']
    ],
    '/api/auth/validateSessionToken' => [
        'POST' => [AuthController::class, 'validateSessionToken']
    ],

    // ---------------------------
    // WALLET ROUTES
    // ---------------------------
    '/api/wallet/transfer' => [
        'POST' => [WalletController::class, 'transferByPaymentCode']
    ],
    '/api/wallet/airtime_purchase' => [
        'POST' => [WalletController::class, 'purchaseAirtime']
    ],
    '/api/wallet/data_purchase' => [
        'POST' => [WalletController::class, 'purchaseData']
    ],
    '/api/wallet/withdraw' => [
        'POST' => [WalletController::class, 'withdraw']
    ],
    '/api/wallet/get_withdrawal_status' => [
        'POST' => [WalletController::class, 'getWithdrawalStatus']
    ],
    '/api/wallet/statement' => [
        'POST' => [WalletController::class, 'getWalletTransactionsInRange']
    ],
    '/api/wallet/get' => [
        'POST' => [WalletController::class, 'getWalletDetails']
    ],
    '/api/wallet/get_account' => [
        'POST' => [FlutterwaveController::class, 'getOrCreateDedicatedAccount']
    ],

    // ---------------------------
    // BENEFICIARY ROUTES
    // ---------------------------
    '/api/beneficiary/find' => [
        'POST' => [WalletController::class, 'getUserByPaymentCode']
    ],
    '/api/beneficiary/add' => [
        'POST' => [WalletController::class, 'addBeneficiary']
    ],
    '/api/beneficiaries' => [
        'POST' => [WalletController::class, 'listBeneficiaries']
    ],

    // ---------------------------
    // ESCROW ROUTES
    // ---------------------------
    '/api/escrow/getEscrow' => [
        'POST' => [EscrowController::class, 'getEscrow']
    ],
    '/api/escrow/create' => [
        'POST' => [EscrowController::class, 'createEscrow']
    ],
    '/api/escrow/fund' => [
        'POST' => [EscrowController::class, 'fundEscrow']
    ],
    '/api/escrow/release' => [
        'POST' => [EscrowController::class, 'releaseEscrow']
    ],
    '/api/escrow/refund' => [
        'POST' => [EscrowController::class, 'refundEscrow']
    ],
    '/api/escrow/deliver' => [
        'POST' => [EscrowController::class, 'deliverEscrow']
    ],
    '/api/escrow/dispute' => [
        'POST' => [EscrowController::class, 'disputeEscrow']
    ],
    '/api/escrow/cancel' => [
        'POST' => [EscrowController::class, 'cancelEscrow']
    ],

    // ---------------------------
    // CARD ROUTES
    // ---------------------------
    '/api/cards/request' => [
        'POST' => [CardController::class, 'requestCard']
    ],

    // ---------------------------
    // VTU ROUTES
    // ---------------------------
    '/api/vtu/balance' => [
        'GET' => [VTUController::class, 'checkMyBalance']
    ],

    // ---------------------------
    // NOTIFICATION ROUTES
    // ---------------------------
    '/api/notification/saveDevice' => [
        'POST' => [NotificationController::class, 'saveDeviceToken']
    ],
    '/api/notification/disable' => [
        'POST' => [NotificationController::class, 'deactivateDevice']
    ],
    '/api/notification/markAsRead' => [
        'POST' => [NotificationController::class, 'markNotificationAsRead']
    ],

    // ---------------------------
    //? SUPPORT ROUTES
    // ---------------------------
    '/api/support/sendMessage' => [
        'POST' => [SupportController::class, 'storeMessage']
    ],
    '/api/support/getMessages' => [
        'POST' => [SupportController::class, 'getMessages']
    ],

    // ---------------------------
    //? BANK ROUTES
    // ---------------------------
    '/api/banks' => [
        'GET' => [BankController::class, 'index']
    ],
    '/api/banks/sync' => [
        'GET' => [Cron::class, 'index']
    ],
    '/api/banks/resolve' => [
        'GET' => [BankController::class, 'resolve']
    ],

    // ---------------------------
    // WEBHOOK ROUTES
    // ---------------------------
    '/api/webhooks/flutterwave' => [
        'ANY' => [FlutterwaveController::class, 'handleFlutterwaveWebhook']
    ],

    // ---------------------------
    // ADMIN ROUTES
    // ---------------------------

    '/api/admin/getUsers' => [
        'GET' => [AdminController::class, 'getAllUsers']
    ],
    '/api/admin/getUserDetails' => [
        'POST' => [AdminController::class, 'getUserDetails']
    ],
    '/api/admin/getUserVerifications' => [
        'GET' => [AdminController::class, 'getAllUserVerifications']
    ],
    '/api/admin/updateUserVerification' => [
        'POST' => [AdminController::class, 'updateUserVerification']
    ],
    '/api/admin/getSupportMessages' => [
        'GET' => [AdminController::class, 'getSupportMessagesGroupedByUser']
    ],

];

if (isset($routes[$uri])) {
    $route = $routes[$uri];
    if (isset($route[$method])) {
        [$controller, $action] = $route[$method];
        $controller::$action();
    } elseif (isset($route['ANY'])) {
        [$controller, $action] = $route['ANY'];
        $controller::$action();
    } else {
        Response::error("Method not allowed", 405);
    }
} else {
    Response::error("Endpoint not found", 404);
}



