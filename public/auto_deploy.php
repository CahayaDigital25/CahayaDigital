<?php
<?php
/**
 * CahayaDigital25 - Auto Deploy System
 * Version 2.1
 */

// Basic authentication
if (!isset($_GET['key']) || $_GET['key'] !== 'Onomah1337*$') {
    header('HTTP/1.1 403 Forbidden');
    die('Access denied');
}

// Target directory configuration
$target_dir = $_SERVER['DOCUMENT_ROOT'] . '/htdocs';
$source_dir = './public';

// Copy files recursively
function copyDirectory($src, $dst) {
    $dir = opendir($src);
    @mkdir($dst);
    while(($file = readdir($dir)) !== false) {
        if ($file != '.' && $file != '..') {
            if (is_dir($src . '/' . $file)) {
                copyDirectory($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
}

// Execute deployment
copyDirectory($source_dir, $target_dir);
echo "Deployment completed successfully!";

// ======= KONFIGURASI =========
$config = [
    // Konfigurasi sumber (source)
    'github_username'     => 'CahayaDigital25',
    'github_repo'         => 'cahayadigital',
    'github_branch'       => 'main',
    
    // Konfigurasi FTP (InfinityFree)
    'ftp_host'            => 'ftpupload.net',             // Host FTP InfinityFree
    'ftp_user'            => '',                          // Username FTP InfinityFree Anda
    'ftp_pass'            => '',                          // Password FTP InfinityFree Anda
    'ftp_dir'             => '/htdocs',                   // Direktori htdocs
    
    // Konfigurasi keamanan
    'auth_key'            => 'Onomah1337*$',              // Kunci autentikasi untuk akses API
    'allowed_ips'         => ['*'],                       // IPs yang diizinkan, * berarti semua
    
    // Konfigurasi umum
    'temp_dir'            => './temp_deploy',             // Direktori sementara
    'log_file'            => './deploy_logs.txt',         // File log
    'max_execution_time'  => 300,                         // Waktu eksekusi maksimum (detik)
    
    // Daftar file yang akan disinkronkan
    'files_to_sync'       => [
        'index.php',
        'index.html',
        'admin/panel/login.php',
        'assets/css/main.css',
        'assets/js/main.js',
        '.htaccess',
        'robots.txt',
        'sitemap.xml',
    ],
    
    // Daftar direktori yang akan dibuat jika belum ada
    'dirs_to_create'      => [
        'admin',
        'admin/panel',
        'assets',
        'assets/css',
        'assets/js',
        'assets/images',
        'uploads'
    ],
    
    // Izin file dan folder
    'file_permissions'    => 0644,
    'dir_permissions'     => 0755,
];

// Set waktu eksekusi maksimum
ini_set('max_execution_time', $config['max_execution_time']);
set_time_limit($config['max_execution_time']);

// ======= FUNGSI HELPER =========

/**
 * Log pesan ke file dan tampilkan di output
 */
function log_message($message, $config, $type = 'INFO') {
    $timestamp = date('[Y-m-d H:i:s]');
    $log_entry = "$timestamp [$type] $message\n";
    
    // Log ke file
    file_put_contents($config['log_file'], $log_entry, FILE_APPEND);
    
    // Output ke browser
    if (php_sapi_name() !== 'cli') {
        echo $log_entry . "<br>";
        ob_flush();
        flush();
    } else {
        echo $log_entry;
    }
}

/**
 * Buat direktori rekursif jika belum ada
 */
function create_directory($dir, $config, $ftp_conn = null) {
    if ($ftp_conn) {
        // FTP mode
        $parts = explode('/', $dir);
        $path = '';
        
        foreach ($parts as $part) {
            if (!$part) continue;
            $path .= '/' . $part;
            
            // Coba buat direktori, jika gagal mungkin sudah ada
            @ftp_mkdir($ftp_conn, $path);
            @ftp_chmod($ftp_conn, $config['dir_permissions'], $path);
        }
    } else {
        // Local mode
        if (!file_exists($dir)) {
            if (mkdir($dir, $config['dir_permissions'], true)) {
                log_message("Direktori dibuat: $dir", $config);
            } else {
                log_message("GAGAL membuat direktori: $dir", $config, 'ERROR');
            }
        }
    }
}

/**
 * Hapus direktori rekursif
 */
function remove_directory($dir) {
    if (!file_exists($dir) || !is_dir($dir)) return;
    
    $objects = scandir($dir);
    foreach ($objects as $object) {
        if ($object == "." || $object == "..") continue;
        
        $path = $dir . "/" . $object;
        if (is_dir($path)) {
            remove_directory($path);
        } else {
            unlink($path);
        }
    }
    
    rmdir($dir);
}

/**
 * Unduh file dari URL
 */
function download_file($url, $save_path) {
    $content = @file_get_contents($url);
    if ($content === false) {
        return false;
    }
    
    return file_put_contents($save_path, $content);
}

/**
 * Verifikasi akses
 */
function verify_access($config) {
    // Verifikasi kunci autentikasi
    if (!isset($_GET['key']) || $_GET['key'] !== $config['auth_key']) {
        http_response_code(403);
        die("Akses ditolak: Kunci autentikasi tidak valid.");
    }
    
    // Verifikasi IP jika diperlukan
    if (!in_array('*', $config['allowed_ips'])) {
        $client_ip = $_SERVER['REMOTE_ADDR'];
        if (!in_array($client_ip, $config['allowed_ips'])) {
            http_response_code(403);
            die("Akses ditolak: IP Anda tidak diizinkan.");
        }
    }
    
    return true;
}

// ======= HANDLERS =========

/**
 * Download file dari GitHub
 */
function download_from_github($config) {
    $base_url = "https://raw.githubusercontent.com/{$config['github_username']}/{$config['github_repo']}/{$config['github_branch']}/";
    $temp_dir = $config['temp_dir'];
    
    // Buat direktori temp jika belum ada
    create_directory($temp_dir, $config);
    
    $success_count = 0;
    $error_count = 0;
    
    // Download file satu per satu
    foreach ($config['files_to_sync'] as $file) {
        $source_url = $base_url . $file;
        $target_path = $temp_dir . '/' . $file;
        
        // Buat direktori target jika belum ada
        $target_dir = dirname($target_path);
        create_directory($target_dir, $config);
        
        log_message("Mengunduh: $file", $config);
        
        if (download_file($source_url, $target_path)) {
            $success_count++;
            log_message("Berhasil mengunduh: $file", $config);
            
            // Set izin file
            chmod($target_path, $config['file_permissions']);
        } else {
            $error_count++;
            log_message("GAGAL mengunduh: $file", $config, 'ERROR');
        }
    }
    
    log_message("Selesai mengunduh file. Berhasil: $success_count, Gagal: $error_count", $config);
    
    return [
        'success' => $success_count,
        'error' => $error_count
    ];
}

/**
 * Download full repository sebagai ZIP
 */
function download_full_repo($config) {
    $zip_url = "https://github.com/{$config['github_username']}/{$config['github_repo']}/archive/refs/heads/{$config['github_branch']}.zip";
    $zip_path = $config['temp_dir'] . '/repo.zip';
    $extract_path = $config['temp_dir'] . '/extracted';
    
    // Buat direktori temp jika belum ada
    create_directory($config['temp_dir'], $config);
    create_directory($extract_path, $config);
    
    log_message("Mengunduh repository lengkap...", $config);
    
    if (download_file($zip_url, $zip_path)) {
        log_message("Berhasil mengunduh repository. Mengekstrak file...", $config);
        
        $zip = new ZipArchive;
        if ($zip->open($zip_path) === TRUE) {
            $zip->extractTo($extract_path);
            $zip->close();
            
            log_message("Ekstraksi berhasil", $config);
            
            // Copy file ke direktori temp
            $source_dir = $extract_path . "/{$config['github_repo']}-{$config['github_branch']}/";
            
            if (file_exists($source_dir)) {
                log_message("Menyalin file ke direktori deployment...", $config);
                
                // Salin semua file recursively
                function copy_dir_recursive($src, $dst, $config) {
                    $dir = opendir($src);
                    @mkdir($dst);
                    
                    while (($file = readdir($dir)) !== false) {
                        if ($file != '.' && $file != '..') {
                            if (is_dir($src . '/' . $file)) {
                                copy_dir_recursive($src . '/' . $file, $dst . '/' . $file, $config);
                            } else {
                                copy($src . '/' . $file, $dst . '/' . $file);
                                chmod($dst . '/' . $file, $config['file_permissions']);
                            }
                        }
                    }
                    
                    closedir($dir);
                }
                
                copy_dir_recursive($source_dir, $config['temp_dir'], $config);
                log_message("File berhasil disalin", $config);
                
                return true;
            } else {
                log_message("Direktori hasil ekstraksi tidak ditemukan", $config, 'ERROR');
                return false;
            }
        } else {
            log_message("GAGAL membuka file ZIP", $config, 'ERROR');
            return false;
        }
    } else {
        log_message("GAGAL mengunduh repository", $config, 'ERROR');
        return false;
    }
}

/**
 * Upload ke FTP
 */
function upload_to_ftp($config) {
    // Connect ke FTP
    log_message("Menghubungkan ke FTP server...", $config);
    
    $ftp_conn = ftp_connect($config['ftp_host']);
    if (!$ftp_conn) {
        log_message("GAGAL terhubung ke FTP server", $config, 'ERROR');
        return false;
    }
    
    // Login
    if (!ftp_login($ftp_conn, $config['ftp_user'], $config['ftp_pass'])) {
        log_message("GAGAL login ke FTP server", $config, 'ERROR');
        ftp_close($ftp_conn);
        return false;
    }
    
    // Enable passive mode
    ftp_pasv($ftp_conn, true);
    
    log_message("Terhubung dengan FTP server", $config);
    
    // Buat direktori yang diperlukan
    foreach ($config['dirs_to_create'] as $dir) {
        $remote_dir = $config['ftp_dir'] . '/' . $dir;
        log_message("Membuat direktori: $remote_dir", $config);
        create_directory($remote_dir, $config, $ftp_conn);
    }
    
    // Upload file
    $success_count = 0;
    $error_count = 0;
    
    function ftp_upload_recursive($ftp_conn, $local_dir, $remote_dir, $config) {
        global $success_count, $error_count;
        
        $files = scandir($local_dir);
        foreach ($files as $file) {
            if ($file == '.' || $file == '..') continue;
            
            $local_path = $local_dir . '/' . $file;
            $remote_path = $remote_dir . '/' . $file;
            
            if (is_dir($local_path)) {
                // Buat direktori di remote jika belum ada
                @ftp_mkdir($ftp_conn, $remote_path);
                @ftp_chmod($ftp_conn, $config['dir_permissions'], $remote_path);
                
                // Rekursif untuk sub-direktori
                ftp_upload_recursive($ftp_conn, $local_path, $remote_path, $config);
            } else {
                // Upload file
                log_message("Mengupload: $remote_path", $config);
                
                if (ftp_put($ftp_conn, $remote_path, $local_path, FTP_BINARY)) {
                    $success_count++;
                    log_message("Berhasil upload: $remote_path", $config);
                    @ftp_chmod($ftp_conn, $config['file_permissions'], $remote_path);
                } else {
                    $error_count++;
                    log_message("GAGAL upload: $remote_path", $config, 'ERROR');
                }
            }
        }
    }
    
    // Upload from temp directory
    ftp_upload_recursive($ftp_conn, $config['temp_dir'], $config['ftp_dir'], $config);
    
    // Close FTP connection
    ftp_close($ftp_conn);
    
    log_message("Upload selesai. Berhasil: $success_count, Gagal: $error_count", $config);
    
    return [
        'success' => $success_count,
        'error' => $error_count
    ];
}

// ======= MAIN PROGRAM =========

// Tentukan mode (CLI atau web)
$is_cli = php_sapi_name() === 'cli';
$is_api = isset($_GET['api']) && $_GET['api'] === 'true';

// HTML output untuk web mode
if (!$is_cli && !$is_api) {
    // Header HTML
    header('Content-Type: text/html; charset=utf-8');
    ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CahayaDigital25 - Auto Deployment</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #e53e3e;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 10px;
        }
        h2 {
            color: #4a5568;
            margin-top: 30px;
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
            word-wrap: break-word;
            max-height: 400px;
            overflow-y: auto;
        }
        .logs {
            background-color: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 4px;
            font-family: monospace;
            max-height: 400px;
            overflow-y: auto;
        }
        .tab {
            overflow: hidden;
            border: 1px solid #ccc;
            background-color: #f1f1f1;
            border-radius: 4px 4px 0 0;
        }
        .tab button {
            background-color: inherit;
            float: left;
            border: none;
            outline: none;
            cursor: pointer;
            padding: 14px 16px;
            transition: 0.3s;
            font-size: 16px;
        }
        .tab button:hover {
            background-color: #ddd;
        }
        .tab button.active {
            background-color: #e53e3e;
            color: white;
        }
        .tabcontent {
            display: none;
            padding: 20px;
            border: 1px solid #ccc;
            border-top: none;
            border-radius: 0 0 4px 4px;
            animation: fadeEffect 1s;
        }
        @keyframes fadeEffect {
            from {opacity: 0;}
            to {opacity: 1;}
        }
        .success {
            color: #38a169;
            font-weight: bold;
        }
        .error {
            color: #e53e3e;
            font-weight: bold;
        }
        #liveLog {
            background-color: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 4px;
            font-family: monospace;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>CahayaDigital25 - Auto Deployment System</h1>
        
        <div class="tab">
            <button class="tablinks active" onclick="openTab(event, 'manualDeploy')">Manual Deploy</button>
            <button class="tablinks" onclick="openTab(event, 'apiDeploy')">API Deploy</button>
            <button class="tablinks" onclick="openTab(event, 'logs')">Deployment Logs</button>
            <button class="tablinks" onclick="openTab(event, 'help')">Bantuan</button>
        </div>
        
        <div id="manualDeploy" class="tabcontent" style="display: block;">
            <h2>Manual Deployment</h2>
            <p>Upload file dari GitHub/Replit ke InfinityFree secara manual dengan memasukkan kredensial FTP.</p>
            
            <form id="deployForm" method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                <div class="form-group">
                    <label for="ftp_user">FTP Username:</label>
                    <input type="text" id="ftp_user" name="ftp_user" required placeholder="epiz_xxxxxx">
                </div>
                
                <div class="form-group">
                    <label for="ftp_pass">FTP Password:</label>
                    <input type="password" id="ftp_pass" name="ftp_pass" required>
                </div>
                
                <div class="form-group">
                    <label for="full_deploy">Jenis Deployment:</label>
                    <select id="full_deploy" name="full_deploy" class="form-control">
                        <option value="1">Full Deployment (Semua File)</option>
                        <option value="0">Partial Deployment (Hanya File Utama)</option>
                    </select>
                </div>
                
                <input type="hidden" name="auth_key" value="<?php echo htmlspecialchars($config['auth_key']); ?>">
                <input type="hidden" name="action" value="deploy">
                
                <button type="submit" class="btn">Mulai Deployment</button>
            </form>
            
            <div id="liveLog"></div>
        </div>
        
        <div id="apiDeploy" class="tabcontent">
            <h2>API Deployment</h2>
            <p>Gunakan URL API berikut untuk otomatisasi deployment (untuk cron job atau webhook):</p>
            
            <pre>
URL: <?php echo htmlspecialchars("https://{$_SERVER['HTTP_HOST']}{$_SERVER['PHP_SELF']}?api=true&key={$config['auth_key']}&ftp_user=epiz_xxxxx&ftp_pass=YOUR_PASSWORD&full=true"); ?>

Parameter:
- api=true (wajib)
- key=<?php echo htmlspecialchars($config['auth_key']); ?> (wajib)
- ftp_user=YOUR_FTP_USERNAME (wajib)
- ftp_pass=YOUR_FTP_PASSWORD (wajib)
- full=true|false (opsional, default: false)
</pre>
            
            <p class="warning">⚠️ Pastikan untuk mengamankan kredensial FTP dan hanya membagikan URL API ke pihak yang tepercaya.</p>
        </div>
        
        <div id="logs" class="tabcontent">
            <h2>Deployment Logs</h2>
            <p>Log aktivitas deployment terakhir:</p>
            
            <div class="logs">
<?php
    if (file_exists($config['log_file'])) {
        echo nl2br(htmlspecialchars(file_get_contents($config['log_file'])));
    } else {
        echo "Belum ada log deployment.";
    }
?>
            </div>
        </div>
        
        <div id="help" class="tabcontent">
            <h2>Bantuan</h2>
            <h3>Cara Menggunakan Auto Deployment</h3>
            <ol>
                <li>Masukkan kredensial FTP yang didapatkan dari control panel InfinityFree</li>
                <li>Pilih jenis deployment (Full atau Partial)</li>
                <li>Klik tombol "Mulai Deployment"</li>
                <li>Tunggu hingga proses selesai (akan ditampilkan di log)</li>
            </ol>
            
            <h3>Troubleshooting</h3>
            <ul>
                <li><strong>Error FTP:</strong> Pastikan username dan password FTP sudah benar</li>
                <li><strong>Timeout:</strong> Jika deployment timeout, coba gunakan Partial Deployment terlebih dahulu</li>
                <li><strong>File tidak ter-update:</strong> Coba clear cache browser atau jalankan Full Deployment</li>
            </ul>
            
            <h3>Otomatisasi</h3>
            <p>Untuk mengotomatisasi deployment, Anda dapat menggunakan:</p>
            <ul>
                <li>Webhooks (GitHub/GitLab) yang memanggil URL API</li>
                <li>Cron job di server yang memanggil URL API secara terjadwal</li>
                <li>Deployment script di Continuous Integration (CI) platform</li>
            </ul>
        </div>
    </div>
    
    <script>
        function openTab(evt, tabName) {
            var i, tabcontent, tablinks;
            
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }
            
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            
            document.getElementById(tabName).style.display = "block";
            evt.currentTarget.className += " active";
        }
        
        // Live log update via AJAX
        function startLogUpdater() {
            const deployForm = document.getElementById('deployForm');
            const liveLog = document.getElementById('liveLog');
            
            if (deployForm) {
                deployForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    // Display waiting message
                    liveLog.innerHTML = '<p>Memulai proses deployment, mohon tunggu...</p>';
                    
                    // Submit form via AJAX
                    const formData = new FormData(deployForm);
                    formData.append('ajax', 'true');
                    
                    fetch(deployForm.action, {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.text())
                    .then(data => {
                        liveLog.innerHTML = data;
                    })
                    .catch(error => {
                        liveLog.innerHTML += '<p class="error">Error: ' + error.message + '</p>';
                    });
                });
            }
        }
        
        // Start log updater on page load
        document.addEventListener('DOMContentLoaded', startLogUpdater);
    </script>
</body>
</html>
    <?php
    exit;
}

// API mode header
if ($is_api) {
    header('Content-Type: application/json; charset=utf-8');
}

// Main logic untuk CLI atau API request
if ($is_cli || ($is_api && verify_access($config))) {
    // Get FTP credentials
    if ($is_cli) {
        // Get from CLI arguments
        $config['ftp_user'] = $argv[1] ?? '';
        $config['ftp_pass'] = $argv[2] ?? '';
        $full_deploy = isset($argv[3]) && $argv[3] === 'full';
    } else {
        // Get from API parameters
        $config['ftp_user'] = $_GET['ftp_user'] ?? '';
        $config['ftp_pass'] = $_GET['ftp_pass'] ?? '';
        $full_deploy = isset($_GET['full']) && $_GET['full'] === 'true';
    }
    
    // Validate FTP credentials
    if (empty($config['ftp_user']) || empty($config['ftp_pass'])) {
        $error_msg = "ERROR: FTP credentials are required";
        
        if ($is_api) {
            echo json_encode(['success' => false, 'message' => $error_msg]);
        } else {
            echo $error_msg . "\n";
        }
        
        exit(1);
    }
    
    // Start deployment process
    log_message("============= MEMULAI DEPLOYMENT =============", $config);
    log_message("Mode: " . ($full_deploy ? "Full Deployment" : "Partial Deployment"), $config);
    
    // Bersihkan direktori temp
    if (file_exists($config['temp_dir'])) {
        log_message("Membersihkan direktori temp...", $config);
        remove_directory($config['temp_dir']);
    }
    
    // Download file dari GitHub
    $download_success = false;
    
    if ($full_deploy) {
        log_message("Mengunduh repository lengkap...", $config);
        $download_success = download_full_repo($config);
    } else {
        log_message("Mengunduh file yang dipilih...", $config);
        $download_result = download_from_github($config);
        $download_success = $download_result['success'] > 0;
    }
    
    if ($download_success) {
        // Upload ke FTP
        log_message("Memulai upload ke FTP...", $config);
        $upload_result = upload_to_ftp($config);
        
        if ($upload_result) {
            log_message("============= DEPLOYMENT SELESAI =============", $config);
            log_message("File berhasil diupload: " . $upload_result['success'], $config);
            
            if ($upload_result['error'] > 0) {
                log_message("File gagal diupload: " . $upload_result['error'], $config, 'WARNING');
            }
            
            // Return result for API
            if ($is_api) {
                echo json_encode([
                    'success' => true,
                    'message' => "Deployment selesai",
                    'uploaded' => $upload_result['success'],
                    'failed' => $upload_result['error']
                ]);
            }
        } else {
            log_message("============= DEPLOYMENT GAGAL =============", $config);
            log_message("Gagal upload ke FTP", $config, 'ERROR');
            
            // Return error for API
            if ($is_api) {
                echo json_encode(['success' => false, 'message' => "Gagal upload ke FTP"]);
            }
            
            exit(1);
        }
    } else {
        log_message("============= DEPLOYMENT GAGAL =============", $config);
        log_message("Gagal mengunduh file dari GitHub", $config, 'ERROR');
        
        // Return error for API
        if ($is_api) {
            echo json_encode(['success' => false, 'message' => "Gagal mengunduh file dari GitHub"]);
        }
        
        exit(1);
    }
    
    // Bersihkan direktori temp
    log_message("Membersihkan direktori temp...", $config);
    remove_directory($config['temp_dir']);
    
    exit(0);
}

// Form submission handler
if (isset($_POST['action']) && $_POST['action'] === 'deploy') {
    // Validate auth key
    if (!isset($_POST['auth_key']) || $_POST['auth_key'] !== $config['auth_key']) {
        die("Unauthorized: Invalid authentication key.");
    }
    
    // Get FTP credentials
    $config['ftp_user'] = $_POST['ftp_user'] ?? '';
    $config['ftp_pass'] = $_POST['ftp_pass'] ?? '';
    $full_deploy = isset($_POST['full_deploy']) && $_POST['full_deploy'] === '1';
    
    // AJAX response
    $is_ajax = isset($_POST['ajax']) && $_POST['ajax'] === 'true';
    if ($is_ajax) {
        ob_start();
    }
    
    // Validate FTP credentials
    if (empty($config['ftp_user']) || empty($config['ftp_pass'])) {
        if ($is_ajax) {
            echo "<p class='error'>ERROR: Kredensial FTP diperlukan</p>";
            echo ob_get_clean();
            exit;
        } else {
            die("ERROR: Kredensial FTP diperlukan");
        }
    }
    
    // Start deployment process
    echo "<p><strong>MEMULAI DEPLOYMENT</strong></p>";
    echo "<p>Mode: " . ($full_deploy ? "Full Deployment" : "Partial Deployment") . "</p>";
    
    // Bersihkan direktori temp
    if (file_exists($config['temp_dir'])) {
        echo "<p>Membersihkan direktori temp...</p>";
        remove_directory($config['temp_dir']);
    }
    
    // Download file dari GitHub
    $download_success = false;
    
    if ($full_deploy) {
        echo "<p>Mengunduh repository lengkap...</p>";
        $download_success = download_full_repo($config);
    } else {
        echo "<p>Mengunduh file yang dipilih...</p>";
        $download_result = download_from_github($config);
        $download_success = $download_result['success'] > 0;
    }
    
    if ($download_success) {
        // Upload ke FTP
        echo "<p>Memulai upload ke FTP...</p>";
        $upload_result = upload_to_ftp($config);
        
        if ($upload_result) {
            echo "<p class='success'><strong>DEPLOYMENT SELESAI</strong></p>";
            echo "<p>File berhasil diupload: " . $upload_result['success'] . "</p>";
            
            if ($upload_result['error'] > 0) {
                echo "<p class='error'>File gagal diupload: " . $upload_result['error'] . "</p>";
            }
        } else {
            echo "<p class='error'><strong>DEPLOYMENT GAGAL</strong></p>";
            echo "<p class='error'>Gagal upload ke FTP</p>";
        }
    } else {
        echo "<p class='error'><strong>DEPLOYMENT GAGAL</strong></p>";
        echo "<p class='error'>Gagal mengunduh file dari GitHub</p>";
    }
    
    // Bersihkan direktori temp
    echo "<p>Membersihkan direktori temp...</p>";
    remove_directory($config['temp_dir']);
    
    // Output log link
    echo "<p><a href='?tab=logs'>Lihat log lengkap</a></p>";
    
    if ($is_ajax) {
        echo ob_get_clean();
        exit;
    }
    
    // Redirect back to page
    echo "<script>setTimeout(function() { window.location.href = '?tab=logs'; }, 3000);</script>";
    exit;
}