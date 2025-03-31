<?php
/**
 * CahayaDigital25 - GitHub Webhook untuk Otomatis Deployment
 * 
 * Script ini menerima webhook dari GitHub setiap kali ada push ke repository
 * dan otomatis menjalankan script auto_deploy.php.
 * 
 * @author CahayaDigital25
 * @version 1.0
 */

// ======= KONFIGURASI =========
$config = [
    // Settings
    'github_secret'    => 'Onomah1337*$',                  // Secret yang dikonfigurasi di GitHub webhook
    'deploy_script'    => './auto_deploy.php',             // Path ke script deployment
    'log_file'         => './webhook_logs.txt',            // File log
    
    // FTP settings (disimpan di sini untuk otomatisasi)
    'ftp_user'         => '',                              // Username FTP InfinityFree (wajib diisi)
    'ftp_pass'         => '',                              // Password FTP InfinityFree (wajib diisi)
    
    // Branches yang diizinkan untuk di-deploy
    'allowed_branches' => ['main', 'master'],
    
    // Repository yang diizinkan
    'allowed_repos'    => ['CahayaDigital25/cahayadigital', 'CahayaDigital25/workspace'],
];

// ======= FUNGSI HELPER =========

/**
 * Log pesan ke file
 */
function log_message($message, $config, $type = 'INFO') {
    $timestamp = date('[Y-m-d H:i:s]');
    $log_entry = "$timestamp [$type] $message\n";
    file_put_contents($config['log_file'], $log_entry, FILE_APPEND);
}

/**
 * Verifikasi signature dari GitHub
 */
function verify_signature($payload, $signature, $secret) {
    $expected = 'sha1=' . hash_hmac('sha1', $payload, $secret);
    return hash_equals($expected, $signature);
}

/**
 * Jalankan script deployment
 */
function run_deployment($config, $is_full = true) {
    // Jika kredensial FTP tidak dikonfigurasi, exit
    if (empty($config['ftp_user']) || empty($config['ftp_pass'])) {
        log_message("ERROR: FTP credentials not configured", $config, 'ERROR');
        return false;
    }
    
    // Parameter untuk auto_deploy.php
    $params = [
        'api' => 'true',
        'key' => 'Onomah1337*$',
        'ftp_user' => $config['ftp_user'],
        'ftp_pass' => $config['ftp_pass'],
        'full' => $is_full ? 'true' : 'false'
    ];
    
    // Build query string
    $query = http_build_query($params);
    
    // URL ke script deployment
    $url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . 
           "://{$_SERVER['HTTP_HOST']}" . dirname($_SERVER['REQUEST_URI']) . "/auto_deploy.php?{$query}";
    
    log_message("Starting deployment with URL: {$url}", $config);
    
    // Jalankan request
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 menit timeout
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code == 200) {
        log_message("Deployment completed successfully", $config);
        return true;
    } else {
        log_message("Deployment failed with HTTP code: {$http_code}", $config, 'ERROR');
        log_message("Response: {$response}", $config, 'ERROR');
        return false;
    }
}

// ======= MAIN PROGRAM =========

// Hanya menerima POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.0 405 Method Not Allowed');
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Ambil payload
$content_type = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
if (strpos($content_type, 'application/json') !== false) {
    $payload = file_get_contents('php://input');
    $data = json_decode($payload, true);
} elseif (isset($_POST['payload'])) {
    $payload = $_POST['payload'];
    $data = json_decode($payload, true);
} else {
    header('HTTP/1.0 400 Bad Request');
    echo json_encode(['status' => 'error', 'message' => 'No payload received']);
    exit;
}

// Verifikasi signature jika secret dikonfigurasi
if (!empty($config['github_secret']) && isset($_SERVER['HTTP_X_HUB_SIGNATURE'])) {
    $signature = $_SERVER['HTTP_X_HUB_SIGNATURE'];
    
    if (!verify_signature($payload, $signature, $config['github_secret'])) {
        header('HTTP/1.0 403 Forbidden');
        echo json_encode(['status' => 'error', 'message' => 'Signature verification failed']);
        log_message("Signature verification failed", $config, 'ERROR');
        exit;
    }
}

// Log received webhook
log_message("Received webhook", $config);

// Validasi event
$event = isset($_SERVER['HTTP_X_GITHUB_EVENT']) ? $_SERVER['HTTP_X_GITHUB_EVENT'] : '';

// Hanya proses event push
if ($event !== 'push') {
    header('HTTP/1.0 202 Accepted');
    echo json_encode(['status' => 'info', 'message' => "Ignoring event: {$event}"]);
    log_message("Ignoring event: {$event}", $config);
    exit;
}

// Validasi repository
$repository = isset($data['repository']['full_name']) ? $data['repository']['full_name'] : '';
if (!in_array($repository, $config['allowed_repos'])) {
    header('HTTP/1.0 202 Accepted');
    echo json_encode(['status' => 'info', 'message' => "Ignoring repository: {$repository}"]);
    log_message("Ignoring repository: {$repository}", $config);
    exit;
}

// Validasi branch
$ref = isset($data['ref']) ? $data['ref'] : '';
$branch = str_replace('refs/heads/', '', $ref);

if (!in_array($branch, $config['allowed_branches'])) {
    header('HTTP/1.0 202 Accepted');
    echo json_encode(['status' => 'info', 'message' => "Ignoring branch: {$branch}"]);
    log_message("Ignoring branch: {$branch}", $config);
    exit;
}

// Semua validasi berhasil, jalankan deployment
log_message("Starting deployment for repository: {$repository}, branch: {$branch}", $config);

// Jalankan deployment
$is_full_deployment = true; // Default ke full deployment
$result = run_deployment($config, $is_full_deployment);

// Kirim response
header('Content-Type: application/json');

if ($result) {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Deployment started successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Deployment failed. See logs for details.'
    ]);
}
exit();
if (isset($_GET['test']) && $_GET['test'] === 'true') {
    // HTML output
    header('Content-Type: text/html; charset=utf-8');
    ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Webhook Tester</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #e53e3e;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 10px;
        }
        .container {
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"], 
        input[type="password"] {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .btn {
            display: inline-block;
            background-color: #e53e3e;
            color: white;
            padding: 12px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }
        .btn:hover {
            background-color: #c53030;
        }
        pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 4px;
            overflow: auto;
            white-space: pre-wrap;
            max-height: 300px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>GitHub Webhook Tester</h1>
        <p>Gunakan form ini untuk mensimulasikan webhook GitHub dan menjalankan deployment.</p>
        
        <form id="webhookForm" method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
            <div class="form-group">
                <label for="ftp_user">FTP Username:</label>
                <input type="text" id="ftp_user" name="ftp_user" required placeholder="epiz_xxxxxx">
            </div>
            
            <div class="form-group">
                <label for="ftp_pass">FTP Password:</label>
                <input type="password" id="ftp_pass" name="ftp_pass" required>
            </div>
            
            <input type="hidden" name="simulate_webhook" value="true">
            <button type="submit" class="btn">Jalankan Deployment</button>
        </form>
        
        <?php if (isset($_POST['simulate_webhook'])): ?>
            <h2>Hasil Deployment</h2>
            <?php
                // Simpan kredensial FTP ke config
                $config['ftp_user'] = $_POST['ftp_user'] ?? '';
                $config['ftp_pass'] = $_POST['ftp_pass'] ?? '';
                
                // Validasi FTP credentials
                if (empty($config['ftp_user']) || empty($config['ftp_pass'])) {
                    echo "<p style='color: #e53e3e;'>ERROR: FTP credentials are required</p>";
                } else {
                    // Simulate deployment
                    $result = run_deployment($config, true);
                    
                    if ($result) {
                        echo "<p style='color: #38a169;'>Deployment berhasil dimulai! Silakan cek log untuk detail.</p>";
                    } else {
                        echo "<p style='color: #e53e3e;'>Deployment gagal. Silakan cek log untuk detail.</p>";
                    }
                }
            ?>
        <?php endif; ?>
        
        <h2>Log Aktivitas</h2>
        <pre><?php 
            if (file_exists($config['log_file'])) {
                echo htmlspecialchars(file_get_contents($config['log_file']));
            } else {
                echo "Belum ada log aktivitas.";
            }
        ?></pre>
    </div>
</body>
</html>
    <?php
    exit;
}