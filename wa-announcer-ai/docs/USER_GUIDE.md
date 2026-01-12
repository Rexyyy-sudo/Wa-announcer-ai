# 📋 User Guide - Panduan Penggunaan Sederhana

Panduan ini dibuat untuk pengguna awam (non-technical).

---

## 🚀 Memulai

### Langkah 1: Akses Dashboard

1. Buka browser (Chrome, Firefox, Safari)
2. Ketik: `https://yourdomain.com` (atau `http://localhost:3000` untuk testing)
3. Anda akan melihat halaman login

### Langkah 2: Login

1. Masukkan **Email** dan **Password**
2. Klik **Login**

Jika belum punya akun:
1. Klik **Register** atau **Daftar**
2. Isi nama, email, password
3. Klik **Register**

### Langkah 3: Scan WhatsApp QR Code

Pertama kali setup:
1. Buka halaman **Bot Status** di dashboard
2. Klik **Scan QR Code**
3. Buka WhatsApp di HP Anda
4. Ke **Settings** → **Linked Devices** → **Link a Device**
5. Scan QR yang muncul di layar
6. Tunggu sampai status menjadi "Ready ✅"

---

## 📢 Membuat Pengumuman

### Cara Cepat

1. Di dashboard, klik **Create Announcement** atau **Buat Pengumuman**
2. Ketik pengumuman dalam bahasa natural (bisa sembarangan):
   ```
   Ada rapat besok jam 10 pagi di kantor, semua staff harus datang, 
   dipimpin pak Andi
   ```
3. Klik **Format dengan AI** atau **Generate**
4. Bot AI akan otomatis mengubah jadi pengumuman profesional
5. Review hasilnya
6. Klik **Send** untuk mengirim

### Contoh Input & Output

**Input:**
```
ada gathering team minggu depan jam 3 sore di coffee shop senayan, 
semua boleh bawa keluarga, bayar sendiri
```

**Output Otomatis:**
```
📢 *PENGUMUMAN*

Assalamu'alaikum warahmatullahi wabarakatuh.

Disampaikan kepada seluruh tim, bahwa akan dilaksanakan:

📝 Kegiatan: Team Gathering
📅 Hari/Tanggal: Minggu, 19 Januari 2026
⏰ Waktu: 15:00 WIB
📍 Tempat: Coffee Shop Senayan
🎤 Pemateri/PJ: Coordinator

Peserta boleh membawa keluarga dengan biaya mandiri.

Demikian pengumuman ini disampaikan.
Atas perhatian dan kehadirannya diucapkan terima kasih.

Wassalamu'alaikum warahmatullahi wabarakatuh.
```

---

## 📤 Mengirim Pengumuman

### Ke Grup WhatsApp

1. Setelah format selesai, klik **Send to Group**
2. Pilih grup dari list
3. Klik **Send**
4. Pengumuman terkirim ke semua member grup

### Ke Personal (DM)

1. Klik **Send to Personal**
2. Pilih kontak atau masukkan nomor HP
3. Klik **Send**

### Ke Banyak Orang (Broadcast)

1. Klik **Send Broadcast**
2. Pilih multiple kontak atau upload list
3. Klik **Send to All**

---

## 📝 Template - Simpan & Pakai Ulang

### Simpan Template

Jika ada pengumuman yang sering pakai (seperti rapat rutin):

1. Buat & format pengumuman
2. Klik **Save as Template**
3. Beri nama: "Rapat Rutin Minggu"
4. Klik **Save**

### Gunakan Template

Lain kali butuh pengumuman serupa:

1. Klik **Templates**
2. Pilih template yang disimpan
3. Edit jika perlu
4. Klik **Send**

---

## 🤖 Command via WhatsApp (Chat Langsung)

Bot bisa juga dioperasikan langsung dari WhatsApp. Kirim pesan ke bot dengan format:

### /buat (Format Pengumuman)
```
/buat ada acara camping minggu depan jam 8 pagi
```
Bot akan format & kirim preview ke Anda.

### /kirimgrup (Kirim ke Grup)
```
/kirimgrup Komunitas Camping
```
Bot cari grup dengan nama itu dan kirim.

### /kirimpv (Kirim Personal)
```
/kirimpv 6287654321
```
Kirim ke nomor tertentu.

### /template (Template Management)
```
/template list        → Lihat semua template
/template pakai Rapat → Pakai template "Rapat"
/template simpan Baru → Simpan yang sekarang jadi template
```

### /status
```
/status
```
Lihat status bot, berapa grup & kontak.

### /help
```
/help
```
Lihat semua perintah yang tersedia.

---

## 📊 Melihat Riwayat

### Announcement History

1. Klik **Announcements** di menu
2. Lihat list semua pengumuman yang pernah dibuat
3. Klik salah satu untuk detail:
   - Original text
   - Formatted result
   - Siapa saja yang menerima
   - Status (sent/failed)

---

## ⚙️ Setting & Konfigurasi

### Ganti Password

1. Klik **Settings** → **Account**
2. Klik **Change Password**
3. Masukkan password lama
4. Masukkan password baru (2x)
5. Klik **Update**

### Manage API Key

Jika ada aplikasi lain yang ingin terhubung dengan bot:

1. Klik **Settings** → **API Keys**
2. Klik **Create New Key**
3. Beri nama: "Mobile App Integration"
4. Klik **Generate**
5. Copy key & berikan ke developer

**Jangan share key dengan orang lain!**

### Groups & Contacts

Sinkronisasi kontak WhatsApp:

1. Klik **Settings** → **Sync WhatsApp**
2. Bot akan auto sync semua grup & kontak
3. Lihat hasilnya di **Bot Status**

---

## 🛟 Tips & Trik

### ✅ Best Practices

1. **Jangan pakai typo**: AI lebih akurat kalau input benar
2. **Detail lebih baik**: Semakin lengkap info, semakin bagus hasilnya
3. **Cek preview**: Selalu review sebelum send
4. **Template untuk rutin**: Pakai template untuk pengumuman yg sering
5. **Backup data**: Backup database secara berkala

### ❌ Jangan Lakukan

1. Jangan share API key dengan sembarangan
2. Jangan kirim pengumuman pribadi ke grup umum
3. Jangan pake bot untuk spam
4. Jangan ubah data di database langsung
5. Jangan lupa ganti password default

### 🎯 Contoh Penggunaan Nyata

#### Masjid - Jadwal Sholat
```
Input: "jadwal sholat senin-kamis jam 6 pagi untuk subuh jam 12 siang dzuhur jam 4 sore ashar 6 sore maghrib 7 malam isya"

Output: Pengumuman profesional dengan waktu terstruktur
```

#### Sekolah - Pengumuman Ujian
```
Input: "ujian akhir semester minggu depan senin-jumat di gedung utama, 
bawa kartu ujian dan pensil hitam"

Output: Pengumuman yang jelas & resmi
```

#### Komunitas - Acara Gathering
```
Input: "gathering members akhir bulan di cafe dekat kantor jam 3 sore 
bayar sendiri tapi ada snack gratis"

Output: Pengumuman menarik dengan detail acara
```

---

## 🐛 Jika Ada Masalah

### Bot tidak merespons

1. Cek internet connection
2. Pastikan bot status "Ready ✅"
3. Tunggu 30 detik, coba lagi
4. Jika masih error, restart bot

### Pesan tidak terkirim

1. Pastikan nomor/grup exist
2. Check WhatsApp masih connect
3. Cek message limit (maks 4000 karakter)
4. Lihat riwayat untuk error message

### Lupa password

1. Klik **Login** → **Forgot Password**
2. Masukkan email
3. Check email untuk reset link
4. Buat password baru

### Lain-lain

Hubungi admin atau baca dokumentasi lengkap di folder `docs/`

---

## 📖 Dokumentasi Teknis

Untuk user technical/developer, lihat:
- `docs/API.md` - API endpoints
- `docs/ARCHITECTURE.md` - System design
- `docs/INSTALLATION.md` - Setup detail
- `docs/SECURITY.md` - Security guide

---

**Semoga panduan ini membantu! Selamat menggunakan WhatsApp Announcer Bot!** 🎉
