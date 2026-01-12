# 🚀 QUICK START - Jalankan Bot dalam 5 Menit!

Panduan cepat untuk yang ingin langsung mencoba tanpa rumit-rumit teknis.

## ⚡ Untuk Pengguna Awam (Non-Technical)

Jika bot sudah disetup oleh admin/developer, Anda tinggal:

### 1. Chat dengan Bot
Cari bot di WhatsApp Anda dan kirim:
```
/help
```

### 2. Mulai Format Pengumuman
```
/buat ada acara besok jam 10 pagi
```

### 3. Kirim ke Grup
```
/kirimgrup Nama Grup
```

**DONE!** Pengumuman sudah profesional dan terkirim! ✅

---

## 💻 Untuk Developer/Admin

### Prerequisites (harus ada)
- Node.js v18+ (download dari nodejs.org)
- OpenAI API Key (dari openai.com) atau Ollama local
- Git (untuk clone repo)

### LANGKAH-LANGKAH (5 menit):

#### Step 1: Setup Folder
```bash
# Clone repository
git clone https://github.com/your-repo/wa-announcer-ai.git
cd wa-announcer-ai

# Atau download ZIP dan extract
```

#### Step 2: Install Dependencies
```bash
npm install
```

*Tunggu sekitar 2-3 menit...* ⏳

#### Step 3: Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit file .env dengan text editor
# MINIMAL UBAH:
# OPENAI_API_KEY=sk-xxxx-your-key-here
```

#### Step 4: Initialize Database
```bash
npm run migrate
```

#### Step 5: Run Bot
```bash
npm start
```

**Tunggu sampai muncul:**
```
✅ WhatsApp Bot Ready!
🌐 API: http://localhost:3000
```

#### Step 6: Scan QR Code
- Lihat QR code di terminal
- Buka WhatsApp > Settings > Linked Devices
- Scan QR code tersebut
- **Done!** Bot siap digunakan

---

## 🧪 Test Bot Anda

### Via WhatsApp Direct Chat
1. Chat bot pribadi di WhatsApp
2. Kirim: `/help`
3. Bot akan membalas dengan list perintah

### Via API (Browser/Postman)
```bash
# Test health check
curl http://localhost:3000/api/health
```

### Test Format Announcement
```bash
# Via WhatsApp chat
/buat ada acara minggu depan jam 10 pagi di kantor
```

---

## 🌍 Deploy ke VPS (Auto Script)

Jika ingin deploy ke VPS Linux (Ubuntu 20.04+):

```bash
# Download deploy script
wget https://raw.githubusercontent.com/your-repo/wa-announcer-ai/main/scripts/deploy.sh

# Run deployment
sudo bash deploy.sh vps

# Itu saja! Script akan:
# ✅ Install Node.js
# ✅ Install PM2
# ✅ Setup Nginx reverse proxy
# ✅ Configure SSL/HTTPS
# ✅ Auto-start on reboot
```

---

## 🐳 Deploy via Docker (Auto)

```bash
# Build image
docker build -t wa-announcer-ai:latest .

# Run container
docker run -d \
  --name wa-announcer \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/.env:/app/.env \
  wa-announcer-ai:latest

# Check logs
docker logs -f wa-announcer
```

---

## 📚 Dokumentasi Lengkap

Untuk info lebih detail, lihat:
- [Installation Guide](./docs/INSTALLATION.md) - Instalasi detail
- [User Guide](./docs/USER_GUIDE.md) - Panduan pengguna
- [API Documentation](./docs/API.md) - API endpoints
- [Architecture](./docs/ARCHITECTURE.md) - Cara kerja sistem
- [Security](./docs/SECURITY.md) - Best practices keamanan

---

## 🆘 Masalah Umum

### Q: WhatsApp tidak connect?
```bash
# Hapus session lama
rm -rf ./sessions

# Restart bot
npm start

# Scan QR ulang
```

### Q: Bot tidak merespons?
```bash
# Cek apakah running
ps aux | grep node

# Lihat error
npm run dev  # Run dengan verbose
```

### Q: Port 3000 sudah terpakai?
```bash
# Gunakan port lain
API_PORT=3001 npm start
```

### Q: OpenAI API error?
```bash
# Cek API key
echo $OPENAI_API_KEY

# Pastikan format: sk-xxxxx...
# Update .env jika salah

npm start  # Try again
```

---

## 🎯 Apa Selanjutnya?

1. **Setup Web Dashboard**: Di `/web` folder
2. **Add Custom Prompts**: Edit `/src/prompts`
3. **Custom Formatting**: Edit `/src/services/ai.service.js`
4. **Add Database**: Edit `/src/db/database.js`
5. **Security Hardening**: Lihat `/docs/SECURITY.md`

---

## 📞 Butuh Bantuan?

- 📖 Baca dokumentasi di `/docs`
- 🐛 Report bug di GitHub issues
- 💬 Tanya di discussion
- 📧 Email admin@example.com

---

**Selamat! Bot Anda sudah siap digunakan!** 🎉

**Versi**: 1.0.0  
**Updated**: Januari 2026
