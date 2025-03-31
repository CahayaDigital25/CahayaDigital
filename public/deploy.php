<?php
// Pengaturan FTP untuk InfinityFree
$ftp_server = "ftpupload.net";
$ftp_username = "epiz_34567890"; // Anda perlu mengganti ini dengan username FTP yang valid
$ftp_password = "PASSWORD_ANDA"; // Anda perlu mengganti ini dengan password FTP yang valid
$ftp_directory = "/htdocs"; // Directory pada server InfinityFree

// Folder lokal yang akan diupload (path relatif)
$local_directory = "../public";

// Koneksi ke server FTP
$conn_id = ftp_connect($ftp_server);

if ($conn_id) {
    // Login dengan username dan password
    $login_result = ftp_login($conn_id, $ftp_username, $ftp_password);
    
    if ($login_result) {
        echo "Berhasil login ke FTP server!<br>";
        echo "Memulai proses upload...<br>";
        
        // Aktifkan mode pasif
        ftp_pasv($conn_id, true);
        
        // Fungsi rekursif untuk mengunggah file dan direktori
        function uploadDirectory($conn_id, $local_dir, $remote_dir) {
            // Buka direktori lokal
            $dir_handle = opendir($local_dir);
            
            // Buat direktori remote jika belum ada
            if (!@ftp_chdir($conn_id, $remote_dir)) {
                ftp_mkdir($conn_id, $remote_dir);
                ftp_chdir($conn_id, $remote_dir);
            }
            
            // Loop semua file dan direktori
            while ($file = readdir($dir_handle)) {
                if ($file != "." && $file != "..") {
                    $local_file = $local_dir . "/" . $file;
                    $remote_file = $file;
                    
                    // Jika direktori, rekursif upload direktori tersebut
                    if (is_dir($local_file)) {
                        uploadDirectory($conn_id, $local_file, $remote_file);
                        ftp_chdir($conn_id, ".."); // Kembali ke parent directory
                    } else {
                        // Upload file
                        if (ftp_put($conn_id, $remote_file, $local_file, FTP_BINARY)) {
                            echo "Berhasil mengunggah $remote_file<br>";
                        } else {
                            echo "Gagal mengunggah $remote_file<br>";
                        }
                    }
                }
            }
            
            closedir($dir_handle);
        }
        
        // Pindah ke direktori target di server FTP
        if (ftp_chdir($conn_id, $ftp_directory)) {
            echo "Berhasil pindah ke direktori $ftp_directory<br>";
            
            // Mulai proses upload
            uploadDirectory($conn_id, $local_directory, ".");
            
            echo "Proses upload selesai!";
        } else {
            echo "Gagal pindah ke direktori $ftp_directory";
        }
    } else {
        echo "Gagal login ke FTP server!";
    }
    
    // Tutup koneksi FTP
    ftp_close($conn_id);
} else {
    echo "Gagal terhubung ke server FTP!";
}
?>

<!-- Instruksi untuk pengguna -->
<div style="margin-top: 30px; padding: 15px; border: 1px solid #ccc; border-radius: 5px; background-color: #f8f8f8;">
    <h2>Petunjuk Penggunaan:</h2>
    <ol>
        <li>Daftar akun hosting gratis di <a href="https://www.infinityfree.net/" target="_blank">InfinityFree</a>.</li>
        <li>Buat situs baru dengan domain cahayadigital25.rf.gd.</li>
        <li>Dapatkan kredensial FTP dari panel kontrol.</li>
        <li>Edit file ini dengan memasukkan username dan password FTP yang benar.</li>
        <li>Setelah itu, akses file ini melalui browser untuk mengunggah semua file ke server hosting.</li>
    </ol>
    <p><strong>Catatan:</strong> Skrip ini hanya contoh sederhana dan sebaiknya tidak disimpan di repositori publik dengan kredensial FTP yang asli.</p>
</div>