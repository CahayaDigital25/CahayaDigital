# Perbaikan Error 403 di InfinityFree

Jika Anda mendapatkan error 403 (Forbidden) saat mengakses situs di InfinityFree, berikut adalah beberapa perbaikan yang telah diterapkan dan langkah-langkah yang perlu Anda ikuti:

## Perbaikan yang Telah Dilakukan

1. **Menambahkan file index.php**
   - File ini akan memastikan server dapat menampilkan konten walaupun index.html tidak dapat diakses.
   - PHP dijalankan terlebih dahulu oleh InfinityFree.

2. **Mengupdate file .htaccess**
   - Konfigurasi telah diperbarui untuk memastikan semua file dapat diakses.
   - Menambahkan direktif untuk mengizinkan semua file diakses.
   - Menetapkan DirectoryIndex yang tepat.

3. **Menambahkan folder admin/panel dengan login.php**
   - File login.php dengan kredensial yang ditentukan telah ditambahkan.
   - Jalur akses: `/admin/panel/login.php`

## Langkah-langkah Upload ke InfinityFree

1. **Pastikan domain sudah terdaftar**
   - Login ke panel InfinityFree
   - Verifikasi domain `cahayadigital25.rf.gd` telah terdaftar

2. **Unggah file**
   - Gunakan FileManager dari panel InfinityFree atau
   - Gunakan FTP client seperti FileZilla untuk mengunggah semua file

3. **Periksa izin file (permissions)**
   - Pastikan semua file memiliki izin 644
   - Pastikan semua folder memiliki izin 755
   - Di FileManager, klik kanan -> Change Permissions

4. **Verifikasi Pengaturan PHP**
   - Periksa versi PHP (disarankan PHP 7.4 atau lebih tinggi)
   - Pastikan ekstensi yang diperlukan diaktifkan

## Jika Masih Mendapatkan Error 403

1. **Coba akses file index.php secara langsung**
   - Buka `http://cahayadigital25.rf.gd/index.php`

2. **Periksa file .htaccess**
   - Jika terjadi masalah, coba ganti file .htaccess dengan versi minimalis:
   ```
   DirectoryIndex index.php index.html
   
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.php$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.php [L]
   </IfModule>
   ```

3. **Periksa log error**
   - Akses log error melalui panel InfinityFree
   - Cari penyebab spesifik error 403

4. **Hubungi dukungan InfinityFree**
   - Jika semua langkah di atas gagal, hubungi dukungan InfinityFree
   - Berikan detail error dan langkah yang telah Anda coba

## Perlindungan Direktori

Jika ingin melindungi direktori admin dengan password, tambahkan file `.htaccess` khusus di folder `/admin`:

```
AuthType Basic
AuthName "Restricted Area"
AuthUserFile /path/to/.htpasswd
Require valid-user
```

Dan buat file `.htpasswd` dengan kredensial yang sesuai.