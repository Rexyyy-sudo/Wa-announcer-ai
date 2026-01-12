# 🚀 Deployment Guide

## 📋 Deployment Targets

1. **VPS (Production)** - Recommended
2. **Termux (Android)** - Mobile alternative
3. **Docker** - Containerized
4. **Local Development** - Testing

---

## 🌐 VPS Deployment (Ubuntu 20.04+)

### Step 1: Server Preparation

```bash
# SSH into server
ssh user@your.server.ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### Step 2: Install Node.js

```bash
# Add Node.js repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

### Step 3: Clone Project

```bash
# Create app directory
mkdir -p /var/www/apps
cd /var/www/apps

# Clone repository
git clone https://github.com/yourusername/wa-announcer-ai.git
cd wa-announcer-ai

# Or copy via SCP
scp -r ./wa-announcer-ai user@server:/var/www/apps/
```

### Step 4: Setup Application

```bash
# Install dependencies
npm install

# Create .env
cp .env.example .env

# Edit .env with nano
sudo nano .env
```

Edit dengan values yang sesuai:
```env
# Production settings
NODE_ENV=production
API_PORT=3000
API_HOST=127.0.0.1

# Database
DB_PATH=/var/www/apps/wa-announcer-ai/data/announcer.db

# AI Provider
OPENAI_API_KEY=sk-xxxxxxxxxxxx
AI_PROVIDER=openai

# Security (ganti dengan nilai random)
JWT_SECRET=$(openssl rand -hex 16)
ENCRYPTION_KEY=01234567890123456789012345678901
API_KEY=$(openssl rand -hex 16)

# Domain
ALLOW_ORIGINS=https://yourdomain.com
```

### Step 5: Initialize Database

```bash
npm run setup
```

### Step 6: Test Application

```bash
# Test start
npm start

# Should show:
# ✅ Database ready
# ✅ WhatsApp Bot initialized
# ✅ API Server started
```

Press Ctrl+C untuk stop.

### Step 7: Setup PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "wa-announcer",
    script: "./src/index.js",
    instances: 1,
    watch: false,
    max_memory_restart: "512M",
    env: {
      NODE_ENV: "production"
    }
  }]
};
EOF

# Start dengan PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# Setup auto-restart on boot
pm2 startup
pm2 save
```

**Output:**
```
[PM] Saving PM2 appearance in /home/user/.pm2/conf.js ...
[PM] Successfully saved in /etc/init.d/pm2-init.sh
[PM] -bash: pm2: command not found
```

Fix:
```bash
sudo env PATH=$PATH:/usr/bin /usr/local/lib/node_modules/pm2/bin/pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))
```

### Step 8: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/wa-announcer
```

Paste:
```nginx
upstream wa_announcer {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates (setup dengan Let's Encrypt nanti)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logging
    access_log /var/log/nginx/wa-announcer_access.log;
    error_log /var/log/nginx/wa-announcer_error.log;

    # Max body size
    client_max_body_size 10M;

    # Proxy to Node.js
    location / {
        proxy_pass http://wa_announcer;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/wa-announcer /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart
sudo systemctl restart nginx
```

### Step 9: Setup SSL Certificate

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate (auto-update Nginx config)
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renew
sudo certbot renew --dry-run

# Certificate path:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

Update Nginx config dengan certificate paths.

### Step 10: Test Everything

```bash
# Check PM2 status
pm2 status

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Check app
curl -I https://yourdomain.com/api/health

# Should return 200 OK
```

### Step 11: Setup Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Block other ports
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Status
sudo ufw status
```

### Step 12: Setup Monitoring & Backups

```bash
# Create backup script
sudo nano /usr/local/bin/wa-backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/wa-announcer"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
sqlite3 /var/www/apps/wa-announcer-ai/data/announcer.db \
  ".backup $BACKUP_DIR/db_$DATE.db"

# Backup sessions
tar czf $BACKUP_DIR/sessions_$DATE.tar.gz \
  /var/www/apps/wa-announcer-ai/sessions/

# Keep last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

Setup cron job:
```bash
sudo crontab -e

# Add line:
0 2 * * * /usr/local/bin/wa-backup.sh
```

---

## 📱 Termux Deployment (Android)

### Step 1: Install Termux

1. Download & install Termux dari F-Droid atau Play Store
2. Buka Termux

### Step 2: Setup Environment

```bash
# Update packages
pkg update && pkg upgrade

# Install Node.js
pkg install nodejs npm

# Install git (optional)
pkg install git

# Verify
node --version
npm --version
```

### Step 3: Clone Project

```bash
# Create directory
mkdir -p ~/wa-bot
cd ~/wa-bot

# Option A: Clone from git
git clone https://github.com/yourusername/wa-announcer-ai.git
cd wa-announcer-ai

# Option B: Download ZIP and extract
# (Use file manager atau curl)
```

### Step 4: Setup Application

```bash
# Install dependencies
npm install

# Create .env
cp .env.example .env

# Edit .env
nano .env
```

Key settings untuk Termux:
```env
API_PORT=3000
API_HOST=0.0.0.0
DB_PATH=/data/data/com.termux/files/home/wa-bot/wa-announcer-ai/data/announcer.db
NODE_ENV=production
OPENAI_API_KEY=sk-xxxx
```

### Step 5: Initialize Database

```bash
npm run setup
```

### Step 6: Run Application

```bash
npm start
```

Atau dengan Termux:Boot untuk auto-start:

```bash
# Install Termux:Boot
# (dari Play Store)

# Create boot script
mkdir -p ~/.termux/boot
nano ~/.termux/boot/start-bot.sh
```

Content:
```bash
#!/data/data/com.termux/files/usr/bin/bash
cd ~/wa-bot/wa-announcer-ai
npm start
```

Give permission:
```bash
chmod +x ~/.termux/boot/start-bot.sh
```

### Step 7: Keep Running in Background

```bash
# Option 1: Termux:Boot (auto)
# Install Termux:Boot app

# Option 2: Systemd (if available)
# Or run in new pane with tmux

tmux new-session -d -s wa-bot "npm start"
tmux attach -t wa-bot
```

### Access from External Device

```bash
# Get Termux IP
ifconfig  # Look for inet address

# Access from external device
curl http://192.168.x.x:3000/api/health
```

---

## 🐳 Docker Deployment

### Dockerfile

Create `Dockerfile` di root project:

```dockerfile
FROM node:18-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
  sqlite3 \
  && rm -rf /var/lib/apt/lists/*

# Copy files
COPY package*.json ./
COPY . .

# Install dependencies
RUN npm ci --only=production

# Create data directory
RUN mkdir -p data sessions logs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["node", "src/index.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  wa-announcer:
    build: .
    container_name: wa-announcer
    ports:
      - "3000:3000"
    volumes:
      - ./sessions:/app/sessions
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - API_PORT=3000
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    restart: unless-stopped
    networks:
      - wa-network

  nginx:
    image: nginx:alpine
    container_name: wa-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/letsencrypt:ro
    depends_on:
      - wa-announcer
    networks:
      - wa-network

networks:
  wa-network:
    driver: bridge
```

### Build & Run

```bash
# Create .env
cp .env.example .env
nano .env

# Build image
docker build -t wa-announcer:latest .

# Run with compose
docker-compose up -d

# View logs
docker-compose logs -f wa-announcer

# Stop
docker-compose down
```

---

## ✅ Post-Deployment Checklist

- [ ] Application running (`pm2 status` atau `docker ps`)
- [ ] Database initialized
- [ ] Nginx/reverse proxy working
- [ ] SSL certificate installed
- [ ] QR code scanned & WhatsApp ready
- [ ] API responding (`curl /api/health`)
- [ ] Firewall configured
- [ ] Backups scheduled
- [ ] Monitoring setup
- [ ] Domain DNS pointing to server
- [ ] Logs rotating
- [ ] Performance acceptable

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
# PM2
pm2 status
pm2 logs wa-announcer

# Docker
docker ps
docker logs wa-announcer -f

# Nginx
sudo systemctl status nginx
tail -f /var/log/nginx/wa-announcer_access.log
```

### Update Application

```bash
# Pull latest
git pull origin main

# Install deps
npm install

# Restart
pm2 restart wa-announcer
# atau
docker-compose restart wa-announcer
```

### Troubleshooting

```bash
# Check port
lsof -i :3000

# Check logs
tail -f logs/app-*.log

# Check database
sqlite3 data/announcer.db "SELECT COUNT(*) FROM users;"

# Check disk space
df -h

# Check memory
free -h
```

---

**Deployment complete! Monitor logs dan test thoroughly sebelum production traffic.**
