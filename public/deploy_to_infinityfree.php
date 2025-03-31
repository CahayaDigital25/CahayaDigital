<?php
/**
 * Auto Deployment Script for CahayaDigital25
 * 
 * This script automates the deployment from Replit to InfinityFree hosting.
 * It should be run on the InfinityFree server to pull updates from your Replit project.
 */

// Configuration
$config = [
    'source_url'     => 'https://raw.githubusercontent.com/CahayaDigital25/cahayadigital/main/',  // GitHub raw content URL
    'target_dir'     => $_SERVER['DOCUMENT_ROOT'],                                                // Root directory (/htdocs)
    'github_branch'  => 'main',                                                                  // GitHub branch
    'files_to_fetch' => [                                                                        // List of files to update
        'index.html',
        'index.php',
        '404.html',
        '.htaccess',
        'robots.txt',
        'sitemap.xml',
        'admin/panel/login.php',
        'assets/css/main.css',
        'assets/js/main.js'
    ],
    'directories_to_create' => [                                                                 // Directories to ensure exist
        'admin',
        'admin/panel',
        'assets',
        'assets/css',
        'assets/js',
        'assets/images',
        'uploads'
    ],
    'log_file'       => 'deploy_log.txt',                                                        // Log file
    'auth_key'       => 'Onomah1337*$',                                                          // Simple authentication key
];

// Check authentication
if (!isset($_GET['key']) || $_GET['key'] !== $config['auth_key']) {
    header('HTTP/1.1 403 Forbidden');
    exit('Access denied. Authentication required.');
}

// Start deployment process
header('Content-Type: text/plain');
echo "Starting deployment process...\n\n";

// Create log function
function log_message($message, $config) {
    $timestamp = date('[Y-m-d H:i:s]');
    $log_entry = "$timestamp $message\n";
    echo $log_entry;
    file_put_contents($config['log_file'], $log_entry, FILE_APPEND);
}

// Create directories if they don't exist
log_message("Creating required directories...", $config);
foreach ($config['directories_to_create'] as $dir) {
    $full_path = $config['target_dir'] . '/' . $dir;
    if (!file_exists($full_path)) {
        if (mkdir($full_path, 0755, true)) {
            log_message("Created directory: $dir", $config);
        } else {
            log_message("ERROR: Failed to create directory: $dir", $config);
        }
    } else {
        log_message("Directory already exists: $dir", $config);
    }
}

// Download and update files
log_message("Fetching files from source...", $config);
$success_count = 0;
$error_count = 0;

foreach ($config['files_to_fetch'] as $file) {
    $source_url = $config['source_url'] . $file;
    $target_path = $config['target_dir'] . '/' . $file;
    
    // Ensure the target directory exists
    $target_dir = dirname($target_path);
    if (!file_exists($target_dir)) {
        mkdir($target_dir, 0755, true);
    }
    
    // Fetch and save the file
    $content = @file_get_contents($source_url);
    if ($content !== false) {
        if (file_put_contents($target_path, $content)) {
            log_message("Updated: $file", $config);
            $success_count++;
        } else {
            log_message("ERROR: Failed to write file: $file", $config);
            $error_count++;
        }
    } else {
        log_message("ERROR: Failed to fetch file: $file", $config);
        $error_count++;
    }
}

// Download full ZIP archive if requested
if (isset($_GET['full']) && $_GET['full'] === 'true') {
    log_message("Attempting to download full archive...", $config);
    
    $zip_url = "https://github.com/CahayaDigital25/cahayadigital/archive/refs/heads/{$config['github_branch']}.zip";
    $zip_path = $config['target_dir'] . '/temp_archive.zip';
    
    // Download the ZIP file
    $zip_content = @file_get_contents($zip_url);
    if ($zip_content !== false && file_put_contents($zip_path, $zip_content)) {
        log_message("Downloaded archive successfully", $config);
        
        // Extract the ZIP file
        $zip = new ZipArchive;
        if ($zip->open($zip_path) === TRUE) {
            $extract_path = $config['target_dir'] . '/temp_extract';
            
            // Create extraction directory
            if (!file_exists($extract_path)) {
                mkdir($extract_path, 0755, true);
            }
            
            // Extract files
            $zip->extractTo($extract_path);
            $zip->close();
            
            // Move files from extracted directory to target directory
            $source_dir = $extract_path . "/cahayadigital-{$config['github_branch']}/";
            if (file_exists($source_dir)) {
                // Copy files recursively
                function copy_directory($src, $dst) {
                    $dir = opendir($src);
                    @mkdir($dst);
                    while (($file = readdir($dir)) !== false) {
                        if ($file != '.' && $file != '..') {
                            if (is_dir($src . '/' . $file)) {
                                copy_directory($src . '/' . $file, $dst . '/' . $file);
                            } else {
                                copy($src . '/' . $file, $dst . '/' . $file);
                            }
                        }
                    }
                    closedir($dir);
                }
                
                copy_directory($source_dir, $config['target_dir']);
                log_message("Extracted and copied files from archive", $config);
            } else {
                log_message("ERROR: Extracted directory not found", $config);
            }
            
            // Clean up
            log_message("Cleaning up temporary files...", $config);
            @unlink($zip_path);
            function delete_directory($dir) {
                if (!file_exists($dir)) return;
                if (!is_dir($dir)) return;
                $files = array_diff(scandir($dir), ['.', '..']);
                foreach ($files as $file) {
                    if (is_dir("$dir/$file")) {
                        delete_directory("$dir/$file");
                    } else {
                        @unlink("$dir/$file");
                    }
                }
                return @rmdir($dir);
            }
            delete_directory($extract_path);
            
        } else {
            log_message("ERROR: Failed to open archive", $config);
        }
    } else {
        log_message("ERROR: Failed to download archive", $config);
    }
}

// Set proper permissions
log_message("Setting correct file permissions...", $config);
function chmod_r($path) {
    $dir = new DirectoryIterator($path);
    foreach ($dir as $item) {
        if ($item->isDot()) continue;
        
        if ($item->isDir()) {
            chmod($item->getPathname(), 0755);
            chmod_r($item->getPathname());
        } else {
            chmod($item->getPathname(), 0644);
        }
    }
}
chmod_r($config['target_dir']);

// Deploy completion report
log_message("\nDeployment completed!", $config);
log_message("Files successfully updated: $success_count", $config);
if ($error_count > 0) {
    log_message("Files with errors: $error_count", $config);
}
log_message("Deployment timestamp: " . date('Y-m-d H:i:s'), $config);
log_message("Target directory: " . $config['target_dir'], $config);
?>

<html>
<head>
    <title>CahayaDigital25 Auto-Deployment</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            color: #333;
        }
        h1 {
            color: #e53e3e;
            border-bottom: 2px solid #e5e5e5;
            padding-bottom: 10px;
        }
        .success {
            color: #38a169;
            font-weight: bold;
        }
        .error {
            color: #e53e3e;
            font-weight: bold;
        }
        pre {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow: auto;
        }
        .info {
            background-color: #ebf8ff;
            border-left: 4px solid #4299e1;
            padding: 10px 15px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <h1>CahayaDigital25 Auto-Deployment</h1>
    
    <?php if ($error_count == 0): ?>
        <div class="success">Deployment completed successfully!</div>
    <?php else: ?>
        <div class="error">Deployment completed with <?php echo $error_count; ?> errors.</div>
    <?php endif; ?>
    
    <div class="info">
        <p>Deployment timestamp: <?php echo date('Y-m-d H:i:s'); ?></p>
        <p>Target directory: <?php echo htmlspecialchars($config['target_dir']); ?></p>
        <p>Files updated: <?php echo $success_count; ?></p>
    </div>
    
    <h2>Deployment Log:</h2>
    <pre><?php echo htmlspecialchars(file_get_contents($config['log_file'])); ?></pre>
</body>
</html>