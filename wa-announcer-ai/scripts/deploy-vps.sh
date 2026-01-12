#!/bin/bash

# ============================================================
# WhatsApp AI Announcer Bot - Deployment Script untuk VPS
# ============================================================
# 
# Untuk Linux/Ubuntu 20.04+
# Run: sudo bash deploy-vps.sh
#
# ============================================================

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Config
APP_DIR="/opt/wa-announcer-ai"
APP_USER="wa-announcer"
APP_GROUP="wa-announcer"
NODE_VERSION="18"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   WhatsApp AI Announcer Bot - Deploy   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}✗ Requires root. Run: sudo bash deploy-vps.sh${NC}"
    exit 1
fi

# 1. Update sistem
echo -e "${YELLOW}[1/10] Updating system...${NC}"
apt-get update && apt-get upgrade -y > /dev/null 2>&1
echo -e "${GREEN}✓ System updated${NC}"

# 2. Install Node.js
echo -e "${YELLOW}[2/10] Installing Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - > /dev/null 2>&1
    apt-get install -y nodejs > /dev/null 2>&1
    echo -e "${GREEN}✓ Node.js installed: $(node --version)${NC}"
else
    echo -e "${GREEN}✓ Node.js already: $(node --version)${NC}"
fi

# 3. Create app user
echo -e "${YELLOW}[3/10] Creating application user...${NC}"
if ! id "$APP_USER" &>/dev/null 2>&1; then
    useradd -r -s /bin/bash -d $APP_DIR $APP_USER
    echo -e "${GREEN}✓ User created${NC}"
else
    echo -e "${GREEN}✓ User exists${NC}"
fi

# 4. Clone repository
echo -e "${YELLOW}[4/10] Cloning repository...${NC}"
if [ ! -d "$APP_DIR" ]; then
    mkdir -p /opt
    cd /opt
    git clone https://github.com/yourusername/wa-announcer-ai.git > /dev/null 2>&1
    echo -e "${GREEN}✓ Repository cloned${NC}"
else
    echo -e "${GREEN}✓ App directory exists${NC}"
fi

# 5. Install dependencies
echo -e "${YELLOW}[5/10] Installing dependencies...${NC}"
cd $APP_DIR
npm install --production > /dev/null 2>&1
echo -e "${GREEN}✓ Dependencies installed${NC}"

# 6. Setup environment
echo -e "${YELLOW}[6/10] Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ .env created - EDIT REQUIRED:${NC}"
    echo -e "${YELLOW}   nano $APP_DIR/.env${NC}"
else
    echo -e "${GREEN}✓ .env exists${NC}"
fi

# 7. Setup database
echo -e "${YELLOW}[7/10] Initializing database...${NC}"
npm run migrate > /dev/null 2>&1
echo -e "${GREEN}✓ Database ready${NC}"

# 8. Install PM2
echo -e "${YELLOW}[8/10] Installing PM2...${NC}"
npm install -g pm2 > /dev/null 2>&1
echo -e "${GREEN}✓ PM2 installed${NC}"

# 9. Start with PM2
echo -e "${YELLOW}[9/10] Starting application...${NC}"
pm2 delete wa-announcer 2>/dev/null || true
cd $APP_DIR
pm2 start src/index.js --name "wa-announcer" --env production
pm2 startup systemd -u $APP_USER --hp $APP_DIR > /dev/null 2>&1
pm2 save > /dev/null 2>&1
echo -e "${GREEN}✓ Application started${NC}"

# 10. Setup Nginx
echo -e "${YELLOW}[10/10] Configuring Nginx...${NC}"
apt-get install -y nginx > /dev/null 2>&1

# Create Nginx config
cat > /etc/nginx/sites-available/wa-announcer << 'EOF'
upstream wa_announcer {
    server 127.0.0.1:3000;
}

server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 10M;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

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
        proxy_buffering off;
    }

    location /api {
        proxy_pass http://wa_announcer;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://wa_announcer/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/wa-announcer /etc/nginx/sites-enabled/wa-announcer
rm -f /etc/nginx/sites-enabled/default

# Test & reload
nginx -t > /dev/null 2>&1 && systemctl restart nginx
echo -e "${GREEN}✓ Nginx configured${NC}"

# Setup SSL (optional)
echo ""
read -p "Setup SSL/HTTPS with Let's Encrypt? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
    read -p "Enter domain (e.g., announcer.example.com): " DOMAIN
    if [ ! -z "$DOMAIN" ]; then
        certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@$DOMAIN
        echo -e "${GREEN}✓ SSL configured${NC}"
    fi
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   ✓ Deployment Complete!              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""
echo "📝 Next Steps:"
echo ""
echo -e "${YELLOW}1. Edit configuration:${NC}"
echo "   nano $APP_DIR/.env"
echo ""
echo -e "${YELLOW}2. Restart application:${NC}"
echo "   pm2 restart wa-announcer"
echo ""
echo -e "${YELLOW}3. View logs:${NC}"
echo "   pm2 logs wa-announcer"
echo ""
echo -e "${YELLOW}4. Monitor:${NC}"
echo "   pm2 monit"
echo ""
echo -e "${YELLOW}5. Access application:${NC}"
echo "   http://your-server-ip"
echo "   (or your domain if SSL configured)"
echo ""
echo "📚 Documentation:"
echo "   https://github.com/yourusername/wa-announcer-ai"
echo ""
