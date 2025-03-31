# Panduan Perbaikan SSL Error pada InfinityFree

Dokumen ini berisi panduan mengatasi error SSL (ERR_SSL_PROTOCOL_ERROR) saat mengakses website CahayaDigital25 di hosting InfinityFree.

## Permasalahan
Saat mengakses website dengan protokol HTTPS, muncul error:
```
Situs ini tidak dapat menyediakan sambungan aman
cahayadigital25.rf.gd mengirimkan tanggapan yang tidak valid.
ERR_SSL_PROTOCOL_ERROR
```

## Penyebab Error
1. InfinityFree menyediakan SSL gratis tetapi memerlukan konfigurasi khusus
2. File `.htaccess` mungkin memaksa penggunaan HTTPS padahal sertifikat belum aktif
3. DNS mungkin belum terpropagasi sepenuhnya

## Solusi

### 1. Perbaikan file .htaccess
File `.htaccess` telah diperbarui untuk tidak memaksa redirect ke HTTPS sampai SSL dikonfigurasi dengan benar. Berikut bagian yang telah dimodifikasi:

```apache
# HTTPS redirect - DISABLED until SSL is properly configured
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

Baris-baris ini dikomentari untuk mencegah pemaksaan HTTPS.

### 2. Perbaikan file index.php
File `index.php` telah diperbarui dengan menambahkan deteksi SSL error dan redirect ke HTTP jika diperlukan:

```php
// Check for SSL errors and redirect to HTTP if needed
if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' && 
    isset($_SERVER['HTTP_USER_AGENT']) && 
    strpos($_SERVER['HTTP_USER_AGENT'], 'ERR_SSL_PROTOCOL_ERROR') !== false) {
    
    // Redirect to HTTP version to fix SSL error
    $redirect_url = 'http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    header("Location: $redirect_url", true, 301);
    exit;
}
```

### 3. Langkah-langkah Penerapan

#### Metode Otomatis
1. Upload file `deploy_to_infinityfree.php` ke root domain
2. Akses script via browser dengan URL: `https://cahayadigital25.rf.gd/deploy_to_infinityfree.php?key=Onomah1337*$&full=true`
3. Script akan otomatis mengupdate file berdasarkan versi terbaru di GitHub

#### Metode Manual
1. Download file `cahayadigital25-infinityfree-ssl-fix.zip`
2. Extract file tersebut
3. Upload file `index.php` dan `.htaccess` ke folder root domain di InfinityFree
4. Periksa apakah error SSL sudah teratasi

### 4. Mengaktifkan SSL di InfinityFree

#### Langkah-langkah Aktifkan SSL
1. Login ke control panel InfinityFree
2. Pilih domain `cahayadigital25.rf.gd`
3. Buka menu `SSL Certificate`
4. Pilih `Request SSL Certificate`
5. Tunggu beberapa menit hingga sertifikat diaktifkan

#### Konfigurasi SSL Setelah Aktif
Setelah SSL aktif, edit kembali file `.htaccess` untuk mengaktifkan redirect HTTPS:

1. Hapus tanda komentar `#` pada baris:
```apache
# RewriteCond %{HTTPS} off
# RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

2. Menjadi:
```apache
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

## Cara Akses Website Selama Perbaikan
Selama proses perbaikan SSL, gunakan protokol HTTP untuk mengakses website:

```
http://cahayadigital25.rf.gd
```

## Troubleshooting Tambahan

### Error 500 Internal Server Error
Jika muncul error 500:
1. Periksa error log di control panel InfinityFree
2. Pastikan izin file sudah benar (644 untuk file, 755 untuk folder)
3. Coba gunakan `.htaccess.minimal` jika masih terjadi error

### Cache Browser
Clear cache browser jika masih mengalami masalah, atau gunakan mode incognito untuk testing.

### Kontak Support
Jika semua solusi di atas tidak berhasil, hubungi support InfinityFree melalui:
- Support Ticket: https://app.infinityfree.net/tickets
- Forum: https://forum.infinityfree.net/