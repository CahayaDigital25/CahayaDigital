# CahayaDigital25 - Portal Berita Indonesia

![CahayaDigital25 Logo](public/logo.png)

## Tentang Proyek

CahayaDigital25 adalah platform berita digital modern Indonesia yang menyajikan konten yang responsif dan menarik dengan kemampuan manajemen konten tingkat lanjut. Proyek ini dirancang untuk memberikan pengalaman membaca berita yang optimal baik pada perangkat mobile maupun desktop.

## Demo

Situs ini dapat diakses melalui: `cahayadigital25.rf.gd`

## Teknologi yang Digunakan

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Drizzle
- **Hosting**: InfinityFree / GitHub Pages

## Fitur Utama

- Tampilan responsif yang optimal di berbagai perangkat
- Kategori berita yang beragam (Politik, Ekonomi, Teknologi, dll)
- Fitur breaking news untuk berita penting
- Artikel unggulan dan pilihan editor
- Panel admin lengkap untuk manajemen konten
- Sistem pengelolaan pengguna (admin dan moderator)
- Fitur upload gambar untuk artikel dan profil penulis
- Kustomisasi pengaturan situs

## Cara Deployment

### Metode Tanpa Akun Premium Replit

Ada dua metode utama untuk men-deploy proyek ini:

1. **Menggunakan GitHub Pages**:
   - Fork repositori ini ke akun GitHub Anda
   - Aktifkan GitHub Pages
   - Konfigurasikan domain kustom

2. **Menggunakan InfinityFree**:
   - Daftar akun di InfinityFree
   - Buat domain baru dengan nama `cahayadigital25.rf.gd`
   - Unggah file dari folder `public` ke hosting

Petunjuk lengkap dapat ditemukan di file `public/deploy-instructions.html`.

## Akses Admin Panel

Panel admin dapat diakses di: `/admin/panel/login.php`

Kredensial default:
- Username: Onomah1337*$
- Password: Onomah1337*$

## Menjalankan Proyek di Lokal

1. Clone repositori
   ```
   git clone [URL_REPOSITORI]
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Jalankan development server
   ```
   npm run dev
   ```

4. Buka browser dan akses `http://localhost:5000`

## Struktur Database

Proyek ini menggunakan PostgreSQL dengan Drizzle ORM untuk mengelola database. Skema database meliputi:

- Tabel `users` untuk pengguna dan admin
- Tabel `articles` untuk konten berita
- Tabel `settings` untuk pengaturan situs
- Tabel `subscribers` untuk pengelolaan pelanggan newsletter

## Kontribusi

Jika Anda ingin berkontribusi pada proyek ini, silakan buat pull request atau buka issue untuk diskusi.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).