# 📖 Installation & Setup Guide

## 🖥️ Requirements

### Minimum
- Node.js >= 18.0.0
- npm atau yarn
- Chrome/Chromium (for whatsapp-web.js)
- 200MB disk space

### Recommended
- Node.js >= 20.0.0
- 1GB RAM
- Stable internet connection
- Linux/MacOS/Windows

---

## 🚀 Quick Start (5 minutes)

### 1. Clone/Download Project

```bash
cd /path/to/your/project
git clone <repo> wa-announcer-ai
cd wa-announcer-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Wajib diubah:
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your_random_secret_key_min_32_char
ENCRYPTION_KEY=your_32_character_encryption_key_
API_KEY=your_secure_api_key_change_this

# Optional:
WHATSAPP_PHONE=62812345678
API_PORT=3000
NODE_ENV=production
```

### 4. Initialize Database

```bash
npm run setup
```

### 5. Start Application

```bash
npm run dev
```

**Expected Output:**
```
🚀 Initializing WA Announcer AI Bot...
📊 Initializing database...
✅ Database ready
💬 Initializing WhatsApp Bot...
✅ WhatsApp Bot initialized (waiting for QR scan)
🌐 Starting API Server...
✅ API Server started

📱 WhatsApp: Scan QR code di terminal
🌐 API: http://localhost:3000
📊 DB: ./data/announcer.db
```

### 6. Scan QR Code

1. Buka WhatsApp di phone Anda
2. Ke Settings → Linked Devices → Link a Device
3. Scan QR code dari terminal/console
4. Tunggu bot ready

---

## 📋 Detailed Setup

### A. Node.js Installation

#### Windows
1. Download dari https://nodejs.org/ (LTS version)
2. Install dan follow wizardnya
3. Verify: `node --version` & `npm --version`

#### MacOS
```bash
# Using Homebrew
brew install node
node --version
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

---

### B. Project Setup

#### Clone Repository
```bash
git clone https://github.com/yourusername/wa-announcer-ai.git
cd wa-announcer-ai
```

#### Install Dependencies
```bash
npm install
```

**Expected Time**: 3-5 minutes (first time)

---

### C. Environment Configuration

#### Create .env file
```bash
cp .env.example .env
```

#### Edit .env
```ini
# ============ WHATSAPP ============
WHATSAPP_PHONE=62812345678
WHATSAPP_SESSION_PATH=./sessions
WHATSAPP_QR_PATH=./qr.png

# ============ API ============
API_PORT=3000
API_HOST=0.0.0.0
NODE_ENV=production
JWT_SECRET=use_openssl_rand_-hex_16_to_generate
API_KEY=use_openssl_rand_-hex_16_to_generate

# ============ DATABASE ============
DB_PATH=./data/announcer.db

# ============ AI/LLM ============
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo

# For local LLM (Ollama):
# AI_PROVIDER=ollama
# OLLAMA_API_URL=http://localhost:11434
# OLLAMA_MODEL=mistral

# ============ SECURITY ============
ENCRYPTION_KEY=your_32_character_encryption_key_
ALLOW_ORIGINS=http://localhost:3001,https://yourdomain.com
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# ============ LOGGING ============
LOG_LEVEL=info
LOG_PATH=./logs

# ============ ADMIN ============
ADMIN_PASSWORD=changeme
ADMIN_EMAIL=admin@example.com
```

#### Generate Secure Keys
```bash
# OpenSSL (Linux/Mac)
openssl rand -hex 16  # For JWT_SECRET
openssl rand -hex 16  # For API_KEY
openssl rand -hex 16  # For ENCRYPTION_KEY

# Or use Python
python3 -c "import secrets; print(secrets.token_hex(16))"
```

---

### D. Database Setup

#### Initialize Schema
```bash
npm run setup
```

This akan:
- Create `./data/` directory
- Create `announcer.db` SQLite file
- Run SQL schema
- Create tables dan indexes

#### Verify Database
```bash
# Check database size
ls -lh data/announcer.db

# Or using sqlite3 CLI
sqlite3 data/announcer.db ".tables"
```

---

### E. First Run

#### Start Bot
```bash
npm run dev
```

#### Initial Steps
1. Terminal akan show QR code
2. Scan QR dengan WhatsApp
3. Tunggu "✅ Bot ready" message
4. Buka browser ke `http://localhost:3000/api/health`
5. Should return: `{"success": true, "message": "API Server is running"}`

---

## 🔌 AI Provider Setup

### Option 1: OpenAI (Recommended for Production)

#### 1. Create OpenAI Account
- Go to https://platform.openai.com
- Sign up atau login
- Create API key

#### 2. Add to .env
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxx
OPENAI_MODEL=gpt-3.5-turbo
```

#### 3. Verify
```bash
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer sk-xxxx" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"test"}]}'
```

---

### Option 2: Ollama (Local LLM - Free)

#### 1. Install Ollama
- Download dari https://ollama.ai
- Atau via package manager:

**Ubuntu/Debian**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve
```

**Docker**
```bash
docker run -d -p 11434:11434 ollama/ollama
```

#### 2. Download Model
```bash
ollama pull mistral
# atau
ollama pull neural-chat
```

#### 3. Update .env
```env
AI_PROVIDER=ollama
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral
```

#### 4. Verify
```bash
curl -X POST http://localhost:11434/api/generate \
  -d '{"model":"mistral","prompt":"test","stream":false}'
```

---

## 🚀 Running Application

### Development Mode
```bash
npm run dev
```
- Auto-restart on file changes
- Detailed logging
- Source maps

### Production Mode
```bash
npm start
```

### Run Only Bot (No API)
```bash
npm run bot
```

### Run Only API (No Bot)
```bash
npm run api
```

---

## 🐳 Docker Setup

### 1. Build Image
```bash
docker build -t wa-announcer:latest .
```

### 2. Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -v ./sessions:/app/sessions \
  -v ./data:/app/data \
  -v ./logs:/app/logs \
  --env-file .env \
  --name wa-announcer \
  wa-announcer:latest
```

### 3. View Logs
```bash
docker logs -f wa-announcer
```

### 4. Stop Container
```bash
docker stop wa-announcer
docker rm wa-announcer
```

---

## 📱 Termux Setup (Android)

### 1. Install Termux
- Download APK dari F-Droid atau Play Store
- Buka Termux

### 2. Update Package Manager
```bash
pkg update && pkg upgrade
```

### 3. Install Node.js
```bash
pkg install nodejs npm
node --version
```

### 4. Clone Project
```bash
git clone <repo> wa-announcer-ai
cd wa-announcer-ai
```

### 5. Install Dependencies
```bash
npm install
```

### 6. Setup .env
```bash
cp .env.example .env
nano .env  # Edit dengan nano editor
```

### 7. Run Bot
```bash
npm run dev
```

### 8. Keep Running (Using Termux:Boot)
- Install "Termux:Boot" from Play Store
- Create script di `~/.termux/boot/`
- Auto-start on device boot

---

## 🔧 Production Deployment

### A. VPS Setup (Ubuntu 20.04+)

#### 1. Server Preparation
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### 2. Clone & Setup
```bash
cd /home/user
git clone <repo> wa-announcer-ai
cd wa-announcer-ai
npm install
cp .env.example .env
nano .env  # Configure properly
npm run setup
```

#### 3. Start with PM2
```bash
pm2 start src/index.js --name "wa-announcer"
pm2 save
pm2 startup
```

#### 4. Setup Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/wa-announcer
```

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/wa-announcer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. SSL Certificate (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d yourdomain.com
```

---

### B. Systemd Service (Ubuntu)

Create `/etc/systemd/system/wa-announcer.service`:
```ini
[Unit]
Description=WhatsApp AI Announcer Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/wa-announcer-ai
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"
EnvironmentFile=/home/ubuntu/wa-announcer-ai/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable wa-announcer
sudo systemctl start wa-announcer
sudo systemctl status wa-announcer
```

---

## ✅ Verification Checklist

- [ ] Node.js installed (`node --version`)
- [ ] npm packages installed (`npm list`)
- [ ] `.env` file created dan configured
- [ ] OpenAI key tested (if using OpenAI)
- [ ] Ollama running (if using Ollama)
- [ ] Database created (`ls -la data/`)
- [ ] Bot QR scanned dan ready
- [ ] API server running (`curl http://localhost:3000/api/health`)
- [ ] WhatsApp message received test

---

## 🐛 Troubleshooting

### Bot tidak bisa initialize
```bash
# Clear session
rm -rf sessions/
# Restart
npm run dev
```

### Port 3000 already in use
```bash
# Change port in .env
API_PORT=3001

# Or kill process
lsof -i :3000
kill -9 <PID>
```

### OpenAI API error
```bash
# Check API key
echo $OPENAI_API_KEY

# Verify key is valid
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models
```

### Database error
```bash
# Remove database
rm data/announcer.db

# Re-initialize
npm run setup
```

---

## 📚 Next Steps

1. Read [API Documentation](./API.md)
2. Check [Architecture](./ARCHITECTURE.md)
3. Setup Web Dashboard (React)
4. Configure domain & SSL
5. Setup monitoring & backups

---

**Support**: Check logs in `./logs/` directory
