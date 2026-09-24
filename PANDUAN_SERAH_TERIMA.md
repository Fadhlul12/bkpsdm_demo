# 📄 DOKUMEN PANDUAN SERAH TERIMA SISTEM
## SIPADU / SIKAP — BKPSDM KOTA DUMAI
**Sistem Informasi Kepegawaian dan Administrasi Pegawai**
*Badan Kepegawaian dan Pengembangan Sumber Daya Manusia (BKPSDM) Kota Dumai*

---

## 📋 1. Ringkasan Sistem & Teknologi (Tech Stack)

Sistem **SIPADU / SIKAP BKPSDM Kota Dumai** dirancang sebagai portal layanan kepegawaian publik dan internal yang cepat, responsif, aman, dan mudah dipelihara.

| Komponen | Teknologi yang Digunakan | Keterangan |
|---|---|---|
| **Backend Engine** | Node.js (Express.js) | Ringan, performa tinggi, dan mudah di-deploy |
| **Frontend UI** | HTML5, Vanilla CSS3, JavaScript ES6+ | Tanpa dependensi berat, loading super cepat (< 1 detik) |
| **Database** | JSON Flat-File Database (`data/db.json`) | Tidak memerlukan instalasi MySQL/PostgreSQL tambahan |
| **Keamanan Passwords** | Bcrypt Hashing (Salt 10 Rounds) | Sandi tersimpan terenkripsi aman di server |
| **File Storage** | Local Disk Storage (`/uploads/`) | Menyimpan gambar slider, foto kegiatan, dan dokumen PDF |
| **Upload Engine** | Multer Middleware | Dilengkapi pembatasan tipe file & batas ukuran maksimal 5MB |

---

## 📁 2. Struktur File & Folder Proyek

```text
sipadu-bkpsdm-dumai/
├── server.js                   # Entry point server utama Express.js & REST API
├── package.json                # Pengaturan dependensi & script npm
├── favicon.ico                 # Logo ikon tab browser
├── logo-bkpsdm.jpg             # Logo resmi BKPSDM Kota Dumai
│
├── data/
│   └── db.json                 # Database utama (Pengumuman, Kegiatan, Layanan, Staf, Kredensial)
│
├── uploads/                    # Folder penyimpanan file media & dokumen PDF pengumuman
│   ├── logo-bkpsdm.jpg         # Asset logo bawaan
│   └── gedung-bkpsdm.jpg       # Asset foto gedung utama bawaan
│
├── admin.html                  # Dashboard Pengelolaan Konten (Admin Web & Admin Staf)
├── index.html                  # Halaman Beranda Utama
├── pengumuman.html             # Halaman Daftar Pengumuman Resmi
├── pengumuman-detail.html      # Halaman Detail Pengumuman & Download PDF
├── kegiatan.html               # Halaman Berita & Dokumentasi Kegiatan
├── layanan.html                # Halaman Informasi Layanan Mandiri Kepegawaian
├── aplikasi.html               # Halaman Portal Aplikasi ASN (SIASN, Simpeg, E-Kinerja, dll.)
├── profil.html                 # Halaman Visi Misi, Struktur Organisasi & Kepala Badan
├── staf.html                   # Halaman Direktori Staf & Pejabat BKPSDM
├── alur.html                   # Halaman Alur Prosedur Pelayanan
└── kontak.html                 # Halaman Alamat Kantor, Jam Kerja, & Form Pesan
```

---

## ⚙️ 3. Persyaratan Sistem & Langkah Instalasi (Deployment)

### A. Persyaratan Server (Prerequisites)
* **Node.js**: Versi `18.0.0` atau lebih baru
* **NPM**: Versi `9.0.0` atau lebih baru
* **OS**: Linux (Ubuntu/Debian), Windows Server, atau Cloud Platform (Railway, VPS, Docker, Heroku)

### B. Langkah Menjalankan Server di Server Lokal / VPS IT BKPSDM

1. **Ekstrak File Proyek**:
   Pindahkan seluruh isi folder proyek ke direktori server Anda.

2. **Install Dependensi**:
   Buka terminal/command prompt di folder proyek, lalu jalankan:
   ```bash
   npm install
   ```

3. **Menjalankan Server (Mode Produksi / Lokal)**:
   ```bash
   # Menjalankan server pada port default (Port 3000)
   npm start
   ```
   *Server akan otomatis berjalan di URL: `http://localhost:3000`*

4. **Menjalankan di Background Server (Optional via PM2)**:
   Agar server tetap berjalan meskipun terminal ditutup:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "sipadu-bkpsdm"
   pm2 save
   ```

---

## 🔐 4. Autentikasi & Pengelolaan Akun Admin

### A. URL Akses Dashboard Admin
Dashboard pengelolaan konten dapat diakses melalui browser di alamat:
👉 **`http://domain-bkpsdm.go.id/admin.html`** *(atau `http://localhost:3000/admin.html`)*

### B. Hak Akses & Kredensial Default

| Peran (Role) | Username Default | Password Default | Hak Akses |
|---|---|---|---|
| **Admin Web (Super Admin)** | `adminweb` | `sipadu2026` | Mengelola seluruh konten web (Pengumuman, Kegiatan, Layanan, Slider, Aplikasi, Staf, & Kontak) |
| **Admin Staf** | `adminstaf` | `staf2026` | Khusus mengelola data Direktori Staf & Pejabat |

> ⚠️ **SANGAT PENTING**: 
> Setelah serah terima dilakukan, **segera login ke Dashboard Admin** dan ubah username & password default melalui menu **"Keamanan & Sandi"**. Password baru akan otomatis dienkripsi menggunakan metode **Bcrypt Hashing**.

---

## 🎨 5. Panduan Pengelolaan Konten

### A. Banner Slider Utama (Hero Banner)
* **Pengaturan Rasio Foto**: Disarankan mengunggah gambar dengan **Rasio 16 : 5** (Contoh resolusi ideal: **`1920 × 600 px`** atau **`1600 × 500 px`**).
* Sistem di Dashboard Admin sudah dilengkapi dengan **Deteksi Rasio Otomatis** yang akan menampilkan penanda hijau jika resolusi foto sudah pas.

### B. Pengumuman & Dokumen PDF
* Admin dapat menyisipkan file PDF lampiran (Surat Edaran, Hasil Seleksi CPNS/PPPK).
* **Batasan File**: Maksimal **5 MB** per file. Format yang diizinkan: `.pdf`, `.jpg`, `.jpeg`, `.png`, `.webp`.

### C. Direktori Staf & Pejabat
* Foto profil staf disarankan berukuran rasio **1:1 (Pasfoto Square)**, misalnya `400 × 400 px`.

---

## 💾 6. Panduan Pemeliharaan Data (Backup & Restore)

Untuk memastikan data tidak hilang, Tim IT BKPSDM disarankan melakukan backup berkala pada 2 komponen berikut:

1. **Backup File Database (`data/db.json`)**:
   Seluruh data teks (pengumuman, kegiatan, akun admin, pesan masuk, statistik) tersimpan di file `data/db.json`. Cukup salin file ini ke tempat penyimpanan cadangan secara berkala.
2. **Backup Folder Media (`uploads/`)**:
   Folder `/uploads/` menyimpan seluruh file fisik foto & dokumen PDF yang diunggah.

---

## 📞 7. Layanan Dukungan Teknis

Jika tim IT BKPSDM memerlukan bantuan atau konsultasi lebih lanjut terkait integrasi server:
* **Pengembang**: Fadhlul Wafin / Tim Pengembang SIPADU
* **Repositori Git**: `https://github.com/Fadhlul12/bkpsdm_demo.git`
* **Dokumentasi Teknis**: Terlampir dalam paket rilis proyek.

---
*Dokumen ini dibuat secara resmi untuk mendampingi Serah Terima Sistem Informasi Kepegawaian dan Administrasi Pegawai (SIPADU) BKPSDM Kota Dumai.*
