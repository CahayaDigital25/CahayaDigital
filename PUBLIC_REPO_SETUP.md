# Cara Deploy ke GitHub Pages

Berikut adalah langkah-langkah untuk deploy website CahayaDigital25 ke GitHub Pages:

## Langkah 1: Persiapan Repository

1. Pastikan Anda memiliki akses ke repositori GitHub: https://github.com/CahayaDigital25/cahayadigital
2. Clone repositori tersebut ke komputer lokal Anda (opsional)
   ```
   git clone https://github.com/CahayaDigital25/cahayadigital.git
   ```

## Langkah 2: Upload File Deployment

### Metode A: Upload Melalui Web Interface GitHub

1. Unduh file `cahayadigital25-github-pages.zip` dari Replit
2. Buka browser dan navigasi ke https://github.com/CahayaDigital25/cahayadigital
3. Klik tombol "Add file" dan pilih "Upload files"
4. Ekstrak file zip yang sudah diunduh dan upload semua file ke repositori
5. Tambahkan pesan commit seperti "Initial deployment files"
6. Klik tombol "Commit changes"

### Metode B: Upload Melalui Git Command Line (Jika Anda Familiar dengan Git)

1. Unduh dan ekstrak `cahayadigital25-github-pages.zip` ke folder repositori lokal
2. Jalankan perintah berikut:
   ```
   git add .
   git commit -m "Initial deployment files"
   git push origin main
   ```

## Langkah 3: Aktifkan GitHub Pages

1. Buka repositori https://github.com/CahayaDigital25/cahayadigital di browser
2. Klik tab "Settings"
3. Di sidebar kiri, klik "Pages"
4. Di "Source", pilih "Deploy from a branch"
5. Di "Branch", pilih "main" dan folder "/" (root)
6. Klik tombol "Save"
7. Di bagian "Custom domain", masukkan `cahayadigital25.rf.gd`
8. Klik "Save"
9. Centang opsi "Enforce HTTPS" jika tersedia

## Langkah 4: Konfigurasi DNS di InfinityFree

1. Login ke panel InfinityFree
2. Pilih domain `cahayadigital25.rf.gd`
3. Buka pengaturan DNS
4. Tambahkan record A yang mengarah ke IP GitHub Pages:
   - 185.199.108.153
   - 185.199.109.153
   - 185.199.110.153
   - 185.199.111.153
5. Tambahkan record CNAME dengan nama `www` yang mengarah ke `cahayadigital25.github.io`

## Langkah 5: Verifikasi Deployment

1. Buka tab "Actions" di repositori GitHub untuk melihat status deployment
2. Tunggu hingga workflow selesai (tanda centang hijau)
3. Akses situs melalui `cahayadigital25.rf.gd` di browser
4. Pastikan semua konten ditampilkan dengan benar

## Penting:

- Perubahan DNS mungkin memerlukan waktu hingga 24 jam untuk tersebar
- Jika ada masalah dengan deployment, periksa tab "Actions" di GitHub untuk melihat log error
- File CNAME sudah otomatis ditambahkan untuk domain kustom

## Support

Jika Anda mengalami masalah selama proses deployment, silakan buka issue di repositori GitHub.