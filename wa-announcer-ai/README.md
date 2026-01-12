# 📢 WhatsApp AI Announcement Bot

Sistem bot WhatsApp AI profesional untuk mengelola pengumuman di organisasi, sekolah, masjid, dan komunitas.

## 🎯 Fitur Utama

✅ **AI-Powered Formatter**: Ubah pengumuman mentah jadi profesional & rapi  
✅ **Multi-Platform Send**: Grup, DM, Broadcast  
✅ **Template Management**: Simpan & pakai ulang template  
✅ **Web Dashboard**: Panel kontrol intuitif  
✅ **REST API**: Integrasi mudah dengan sistem lain  
✅ **Enterprise Security**: JWT, encryption, rate limiting  
✅ **Easy Deployment**: Termux, VPS, Docker-ready  

## 📋 Tech Stack

- **Backend**: Node.js + Express.js
- **WhatsApp Client**: whatsapp-web.js (Baileys alternative)
- **AI/LLM**: OpenAI GPT-3.5 atau Ollama (lokal)
- **Database**: SQLite3
- **Frontend**: React + Vite (included)
- **Security**: JWT, bcrypt, helmet, CORS
- **Logging**: Pino

## 🚀 Quick Start

### Prerequisite
- Node.js >= 18.0
- npm atau yarn
- Chrome/Chromium untuk whatsapp-web.js

### Installation

```bash
# Clone/download project
cd wa-announcer-ai

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan konfigurasi Anda

# Setup database
npm run setup

# Run bot
npm run dev
```

### First Time Setup
1. Bot akan menampilkan QR Code
2. Scan QR dengan WhatsApp
3. Bot siap menerima pesan

## 📖 Dokumentasi Lengkap

- [Instalasi Detail](docs/INSTALLATION.md)
- [Arsitektur Sistem](docs/ARCHITECTURE.md)
- [API Documentation](docs/API.md)
- [AI Prompt System](docs/PROMPTS.md)
- [Security Guide](docs/SECURITY.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## 💬 Perintah Bot

```
/buat <teks pengumuman>        → Format & tampilkan preview
/kirimgrup <id grup>           → Kirim ke grup
/kirimpv <nomor wa>            → Kirim ke personal
/kirimbroadcast <list>         → Kirim ke multiple
/template simpan <nama>        → Simpan template
/template pakai <nama>         → Gunakan template
/template list                 → Lihat semua template
/status                        → Status bot
/help                          → Bantuan
```

## 🔐 Security Highlights

- 🔒 JWT Token Authentication
- 🔐 AES Encryption untuk credentials
- ⚠️ Rate Limiting (100 req/15 min)
- 🛡️ Helmet headers security
- ✅ CORS whitelist
- 🚪 Admin panel dengan password hash

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│         WhatsApp User Messages              │
└────────────────┬────────────────────────────┘
                 │
         ┌───────▼────────┐
         │  Baileys/WWeb  │ ◄─── Scan QR Code
         └───────┬────────┘
                 │
    ┌────────────▼───────────┐
    │  Message Handler       │
    │  (Command Parser)      │
    └────────────┬───────────┘
                 │
         ┌───────▼────────────┬─────────────┐
         │                    │             │
    ┌────▼──┐          ┌──────▼──┐   ┌─────▼──┐
    │  /buat │          │ /kirim* │   │/template│
    └────┬──┘          └──────┬──┘   └─────┬──┘
         │                    │            │
    ┌────▼──────────────────────────────┐ │
    │  AI Formatter Service             │ │
    │  (OpenAI/Ollama)                  │ │
    └────┬──────────────────────────────┘ │
         │                                 │
    ┌────▼──────────────────────────────┐ │
    │  Format Template Validation       │ │
    │  (Professional Check)             │ │
    └────┬──────────────────────────────┘ │
         │                                 │
    ┌────▼──────────────────────────────┐ │
    │  Send Service                     │ │
    │  (Grup/DM/Broadcast)              │ │
    └────┬──────────────────────────────┘ │
         │      ◄──────────────────────────┘
    ┌────▼──────────────────────────────┐
    │  Database (SQLite)                │
    │  - Templates                      │
    │  - History                        │
    │  - Users                          │
    └───────────────────────────────────┘

    ┌──────────────────────────────────┐
    │  REST API (Express)              │
    │  POST /api/announce              │
    │  GET  /api/templates             │
    │  POST /api/templates             │
    │  POST /api/send                  │
    │  GET  /api/history               │
    └──────────────────────────────────┘

    ┌──────────────────────────────────┐
    │  Web Dashboard (React)           │
    │  - Announce creator              │
    │  - Template manager              │
    │  - Send control                  │
    │  - Analytics                     │
    └──────────────────────────────────┘
```

## 📝 Format Pengumuman Otomatis

Input:
```
ada acara camping minggu depan, tgl 15 januari, jam 8 pagi, di gunung bromo, dipandu pak budi
```

AI Output:
```
📢 *PENGUMUMAN*

Assalamu'alaikum warahmatullahi wabarakatuh.

Disampaikan kepada seluruh anggota, bahwa akan dilaksanakan:

📝 Kegiatan: Camping
📅 Hari/Tanggal: Minggu, 15 Januari 2026
⏰ Waktu: 08:00 WIB
📍 Tempat: Gunung Bromo
🎤 Pemateri/PJ: Bapak Budi

Demikian pengumuman ini disampaikan.
Atas perhatian dan kehadirannya diucapkan terima kasih.

Wassalamu'alaikum warahmatullahi wabarakatuh.
```

## 🎛️ Web Dashboard Features

- ✏️ Editor pengumuman real-time
- 👁️ Preview profesional
- 📌 Template library
- 📤 Send ke grup/DM/broadcast
- 📊 History & analytics
- 👥 User management
- 🔑 Token & API key management
- 🌙 Dark mode

## 🌐 API Endpoints

```
POST   /api/auth/login              - Login & get JWT
GET    /api/announcements            - List pengumuman
POST   /api/announcements/format      - Format teks baru
POST   /api/announcements/send        - Kirim pengumuman
GET    /api/templates                 - List templates
POST   /api/templates                 - Simpan template
DELETE /api/templates/:id             - Hapus template
GET    /api/groups                    - List grup WhatsApp
GET    /api/contacts                  - List kontak
GET    /api/analytics                 - Stats & analytics
POST   /api/broadcast                 - Create broadcast
GET    /api/bot/status                - Status bot
```

## 🛠️ Installation Guides

### Termux (Android)
```bash
apt update && apt upgrade
apt install nodejs npm git
git clone <your-repo>
cd wa-announcer-ai
npm install
npm run dev
```

[Detailed Termux Guide](docs/DEPLOYMENT.md#termux)

### VPS (Linux)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git
git clone <your-repo>
cd wa-announcer-ai
npm install
npm run start  # or use PM2/systemd
```

[Detailed VPS Guide](docs/DEPLOYMENT.md#vps)

### Docker
```bash
docker build -t wa-announcer .
docker run -d -p 3000:3001 wa-announcer
```

## 📞 Support & Contributing

- 🐛 Report bugs: Issues tab
- 💡 Suggest features: Discussions
- 🤝 Contribute: Pull requests welcome

## 📜 License

MIT License - Free for personal & organizational use

## ⚠️ Disclaimer

Bot ini dibuat untuk memfasilitasi komunikasi internal organisasi. Pengguna bertanggung jawab atas:
- Konten pengumuman
- Kepatuhan terhadap T&C WhatsApp
- Enkripsi & keamanan data
- Privasi penerima pengumuman

WhatsApp Inc. berhak menutup akun yang melanggar T&C. Gunakan dengan bijak dan etis.

---

**Made with ❤️ for organizations that care about communication.**
