# 🚀 START HERE

**Selamat datang!** Anda telah mendapatkan sistem **WhatsApp AI Announcer Bot** yang **lengkap dan siap pakai**.

Baca file ini terlebih dahulu sebelum memulai apapun. ⬇️

---

## ⏱️ 5 MENIT PERTAMA

### Langkah 1: Install Dependencies (2 menit)
```bash
cd wa-announcer-ai
npm install
```

**Tunggu sampai selesai.** Ini menginstall 15+ dependencies.

### Langkah 2: Setup Configuration (1 menit)
```bash
cp .env.example .env
```

Kemudian buka file `.env` dan ubah yang penting:
```bash
# REQUIRED - Set your OpenAI API Key
OPENAI_API_KEY=sk-your-api-key-here

# REQUIRED - Change these for security
JWT_SECRET=change-me-to-random-string
ENCRYPTION_KEY=32-character-encryption-key!!!
```

### Langkah 3: Initialize Database (1 menit)
```bash
npm run setup
```

Ini membuat file database `data/announcer.db` dan schema.

### Langkah 4: Run Application (1 menit)
```bash
npm run dev
```

Tunggu sampai Anda melihat:
```
✅ WhatsApp bot initialized
✅ API server running on http://localhost:3000
```

### Langkah 5: Scan QR Code (Final step!)
1. Buka **WhatsApp di phone Anda**
2. Buka **Settings → Linked Devices** 
3. Klik **Link a Device**
4. **Scan QR code** yang muncul di terminal

**DONE!** Bot sudah siap. Coba kirim pesan ke bot:
```
/buat Kami akan mengadakan rapat penting hari Jum'at jam 10 pagi di ruang meeting
```

---

## 🎯 Apa yang bisa Anda lakukan?

### Langsung (Hari Ini)
✅ Format pengumuman dengan AI  
✅ Kirim ke grup WhatsApp  
✅ Kirim ke personal contact  
✅ Simpan template  
✅ Pantau delivery status  

### Minggu Ini
✅ Bangun dashboard dengan React  
✅ Deploy ke VPS atau Docker  
✅ Setup SSL/HTTPS  
✅ Invite users  

### Bulan Ini
✅ Go live untuk organisasi  
✅ Scale ke ribuan pengguna  
✅ Integrate dengan sistem lain  
✅ Monitor dan optimize  

---

## 📚 Panduan Selanjutnya

### Baca sesuai kebutuhan Anda:

#### 👨‍💻 **Jika Anda Developer**
1. `README.md` - Project overview
2. `docs/INSTALLATION.md` - Setup detail
3. `docs/ARCHITECTURE.md` - System design
4. `docs/API.md` - API reference
5. `web/README.md` - Frontend development

#### 🏢 **Jika Anda Admin/DevOps**
1. `docs/DEPLOYMENT.md` - Production setup
2. `docs/SECURITY.md` - Security checklist
3. `docs/TROUBLESHOOTING.md` - Common issues
4. `.env.example` - Configuration reference

#### 👥 **Jika Anda End User**
1. `docs/USER_GUIDE.md` - How to use
2. `/help` command di WhatsApp
3. `docs/TROUBLESHOOTING.md` - FAQ

---

## 🎮 Command Cheat Sheet

### WhatsApp Commands
```bash
/buat <text>           # Format pengumuman dengan AI
/kirimgrup <nama>      # Kirim ke grup
/kirimpv <nomor>       # Kirim personal
/template list         # Lihat templates
/template simpan       # Simpan template
/template pakai <id>   # Gunakan template
/status                # Status bot
/help                  # Bantuan
```

### NPM Commands
```bash
npm run dev            # Development mode
npm run start          # Production mode
npm run setup          # Initialize database
npm run bot            # Bot only
npm run api            # API only
```

### Docker
```bash
docker-compose up      # Run all services
docker-compose down    # Stop services
```

---

## 🔐 Important: Sebelum Production

Jangan lupa ubah ini di `.env`:

```bash
❌ WRONG:
JWT_SECRET=secret
ENCRYPTION_KEY=key123
ADMIN_PASSWORD=admin

✅ RIGHT:
JWT_SECRET=8f92a1c7e3b4d6f9a2e5c8b1d4f7a0c3e6b9f2a5d8c1e4
ENCRYPTION_KEY=!@#$%^&*()_+abcdefghijklmnopqrstuvwxyz
ADMIN_PASSWORD=X9mK@pL#2qR$vWxYz!8nJb
```

---

## 🚀 Deployment Options

### Option 1: Local Development (Sekarang)
```bash
npm run dev
```
✅ Langsung jalan  
✅ Untuk testing  
❌ Tidak 24/7  

### Option 2: Docker (Recommended - 30 menit)
```bash
docker-compose up -d
```
✅ Easy deployment  
✅ Same everywhere  
✅ Auto restart  

### Option 3: VPS Ubuntu (Professional - 1-2 jam)
Baca: `docs/DEPLOYMENT.md#vps`

✅ 24/7 running  
✅ Professional setup  
✅ Scale ready  

### Option 4: Termux Android (Mobile - 20 menit)
Baca: `docs/DEPLOYMENT.md#termux`

✅ Run di Android  
✅ Simple setup  
❌ Limited resources  

---

## 🆘 Troubleshooting

### Problem: Bot tidak mengenal command?
**Solution:**
- Pastikan format command: `/buat text`
- Gunakan `/help` untuk lihat command
- Check logs: `tail -f logs/app-*.log`

### Problem: OpenAI error?
**Solution:**
- Check API key di `.env`
- Pastikan balance OpenAI > $0
- Coba dengan Ollama instead: `AI_PROVIDER=ollama`

### Problem: Database error?
**Solution:**
- Delete `data/announcer.db`
- Run `npm run setup` lagi
- Check permission folder `data/`

### Problem: Port 3000 already in use?
**Solution:**
```bash
# Change port in .env
PORT=3001
npm run dev
```

### Lebih banyak issues?
Lihat: `docs/TROUBLESHOOTING.md`

---

## 📞 Support Resources

| Need | Where |
|------|-------|
| Setup | `docs/INSTALLATION.md` |
| API Reference | `docs/API.md` |
| System Design | `docs/ARCHITECTURE.md` |
| Deployment | `docs/DEPLOYMENT.md` |
| Security | `docs/SECURITY.md` |
| Troubleshooting | `docs/TROUBLESHOOTING.md` |
| User Manual | `docs/USER_GUIDE.md` |
| File Index | `FILE_STRUCTURE.md` |

---

## 📋 Checklist Awal

- [ ] Read this file (you are here ✅)
- [ ] Run `npm install`
- [ ] Create `.env` dari `.env.example`
- [ ] Set `OPENAI_API_KEY` di `.env`
- [ ] Run `npm run setup`
- [ ] Run `npm run dev`
- [ ] Scan QR code dengan WhatsApp
- [ ] Test command `/help`
- [ ] Read `README.md` untuk overview

---

## 🎯 Apa Selanjutnya?

### 5 Minutes
✅ Setup & run locally

### 1 Hour
- [ ] Test all commands
- [ ] Create first template
- [ ] Send test announcement
- [ ] Read `README.md`

### 1 Day
- [ ] Understand architecture (`docs/ARCHITECTURE.md`)
- [ ] Review API endpoints (`docs/API.md`)
- [ ] Plan deployment

### 1 Week
- [ ] Build React dashboard (`web/README.md`)
- [ ] Deploy to production
- [ ] Setup domain & SSL
- [ ] Invite team members

### 1 Month
- [ ] Go live
- [ ] Monitor performance
- [ ] Gather feedback
- [ ] Plan new features

---

## 📖 File Baca Selanjutnya

### Langsung setelah setup ini:
1. **`README.md`** - Project overview (10 min read)
2. **`QUICK_START.md`** - Extended setup guide (15 min read)

### Saat mau deploy:
3. **`docs/DEPLOYMENT.md`** - Choose deployment method
4. **`docs/SECURITY.md`** - Security checklist

### Saat ada masalah:
5. **`docs/TROUBLESHOOTING.md`** - Common issues & solutions

### Referensi:
6. **`docs/API.md`** - All API endpoints
7. **`FILE_STRUCTURE.md`** - File organization

---

## 💡 Tips

1. **Backup database secara berkala**
   ```bash
   cp data/announcer.db data/announcer.db.backup
   ```

2. **Enable debug mode jika ada error**
   ```bash
   LOG_LEVEL=debug npm run dev
   ```

3. **Check logs jika ada issue**
   ```bash
   tail -f logs/app-*.log
   ```

4. **Test API dengan curl**
   ```bash
   curl http://localhost:3000/api/health
   ```

5. **Use Postman untuk API testing**
   - Import endpoints dari `docs/API.md`
   - Set JWT token di headers

---

## ⚠️ Important Notes

### Before Production
- [ ] Change all secrets in `.env`
- [ ] Setup SSL certificate
- [ ] Configure firewall
- [ ] Enable backups
- [ ] Setup monitoring

### Security
- [ ] Never commit `.env` to git
- [ ] Use strong passwords
- [ ] Update dependencies regularly
- [ ] Review audit logs

### Performance
- [ ] Use PM2 for process management
- [ ] Setup Nginx reverse proxy
- [ ] Enable caching
- [ ] Monitor database size

---

## 🎉 FINAL CHECKLIST

Done with setup? Verify:

```bash
# Check if services are running
curl http://localhost:3000/api/health

# Check database
ls -la data/announcer.db

# Check logs
ls -la logs/

# Test bot command
# Send: /help to bot on WhatsApp
```

All working? **You're ready to go!** 🚀

---

## 🚀 Quick Start Command

**Copy & paste this to get started:**

```bash
cd wa-announcer-ai && \
npm install && \
cp .env.example .env && \
echo "Edit .env and set OPENAI_API_KEY" && \
npm run setup && \
npm run dev
```

Then scan QR code with WhatsApp! ✅

---

## 🤔 Masih Bingung?

- **Error saat npm install?** → Lihat `docs/INSTALLATION.md`
- **API tidak respond?** → Check `docs/TROUBLESHOOTING.md`
- **Mau deploy?** → Follow `docs/DEPLOYMENT.md`
- **Mau develop?** → Read `docs/ARCHITECTURE.md`
- **Mau security?** → Check `docs/SECURITY.md`

---

**Next Step**: Open `README.md` and read the project overview! 📖

**Time**: 5 minutes left!

**Good luck!** 🙌

---

*Generated: 2024*  
*Status: Production Ready ✅*  
*Version: 1.0.0*
