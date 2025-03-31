
<?php
/**
 * CahayaDigital25 Main Index File
 */

// Check if request is for a static file
$request_path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file_path = __DIR__ . $request_path;

if (file_exists($file_path) && is_file($file_path)) {
    $extension = pathinfo($file_path, PATHINFO_EXTENSION);
    switch ($extension) {
        case 'css':
            header('Content-Type: text/css');
            break;
        case 'js':
            header('Content-Type: application/javascript');
            break;
        case 'png':
            header('Content-Type: image/png');
            break;
        case 'jpg':
        case 'jpeg':
            header('Content-Type: image/jpeg');
            break;
    }
    readfile($file_path);
    exit;
}

// Serve index.html for root path
if ($request_path === '/' && file_exists(__DIR__ . '/index.html')) {
    readfile(__DIR__ . '/index.html');
    exit;
}

// Default response
if (file_exists(__DIR__ . '/index.html')) {
    readfile(__DIR__ . '/index.html');
} else {
    echo "<h1>Welcome to CahayaDigital25</h1>";
}
?>
