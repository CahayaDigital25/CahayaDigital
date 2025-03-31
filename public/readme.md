# CahayaDigital25 - Portal Berita Indonesia

## Informasi Deployment Otomatis

Untuk memasang proyek CahayaDigital25 ke domain cahayadigital25.rf.gd, Anda dapat menggunakan salah satu dari dua metode berikut:

### Metode 1: Menggunakan GitHub Pages

1. Fork repositori ini ke akun GitHub Anda
2. Aktifkan GitHub Pages pada repositori Anda
3. Tambahkan file CNAME yang berisi `cahayadigital25.rf.gd`
4. Konfigurasikan DNS pada layanan hosting InfinityFree untuk mengarah ke alamat IP GitHub Pages

### Metode 2: Menggunakan InfinityFree

1. Daftar akun di [InfinityFree](https://infinityfree.net)
2. Buat domain baru dengan nama `cahayadigital25.rf.gd`
3. Unggah semua file di folder `public` ke hosting InfinityFree
4. Konfigurasikan database MySQL jika diperlukan

## Petunjuk Lebih Lanjut

Untuk petunjuk lengkap, buka file `deploy-instructions.html` yang terdapat dalam proyek ini.

## Akses Admin Panel

Admin panel dapat diakses di rute: `/admin/panel/login.php`

Anda dapat menggunakan kredensial berikut untuk login:
- Username: Onomah1337*$
- Password: Onomah1337*$

## Daftar Fitur

- Portal berita digital responsif
- Panel admin lengkap untuk pengelolaan konten
- Unggah dan kelola gambar artikel
- Pengelolaan pengguna (admin dan moderator)
- Pengaturan situs kustom
- Dukungan untuk breaking news, artikel unggulan, dan pilihan editor

## Pengembangan

Proyek ini dikembangkan menggunakan:
- React untuk frontend
- Express untuk backend
- PostgreSQL untuk database
- Drizzle ORM untuk manajemen database
- Tailwind CSS untuk styling