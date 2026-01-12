#!/bin/bash

# ============================================================
# 🚀 WhatsApp AI Announcer Bot - Auto Deploy Script
# ============================================================
# 
# Usage:
#   sudo bash deploy.sh <environment>
#
# Environments:
#   local     - Development machine
#   vps       - Linux VPS (Ubuntu 20.04+)
#   termux    - Termux/Android
#   docker    - Docker container
#
# Example:
#   sudo bash deploy.sh vps
#
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-local}
APP_NAME="wa-announcer-ai"
APP_DIR="/opt/${APP_NAME}"
NODE_VERSION="18"
SERVICE_NAME="${APP_NAME}"

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1 ${BLUE}║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${YELLOW}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if running as root for VPS deployment
if [ "$ENVIRONMENT" = "vps" ] && [ "$EUID" -ne 0 ]; then
    print_error "VPS deployment requires root privileges"
    echo "Run: sudo bash deploy.sh vps"
    exit 1
fi

# ============================================================
# MAIN DEPLOYMENT
# ============================================================

print_header "WhatsApp AI Announcer Bot - Auto Deploy"
echo "Environment: ${BLUE}${ENVIRONMENT}${NC}"
echo ""

# ============================================================
# VPS DEPLOYMENT
# ============================================================

if [ "$ENVIRONMENT" = "vps" ]; then
    print_header "VPS Deployment (Ubuntu 20.04+)"

    # Step 1: System Update
    print_step "Updating system packages..."
    apt-get update && apt-get upgrade -y
    print_success "System updated"

    # Step 2: Install Node.js
    print_step "Installing Node.js ${NODE_VERSION}..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
        print_success "Node.js installed"
    else
        print_success "Node.js already installed: $(node --version)"
    fi

    # Step 3: Install PM2
    print_step "Installing PM2..."
    npm install -g pm2 > /dev/null 2>&1 || true
    pm2 -v > /dev/null && print_success "PM2 installed" || print_error "PM2 installation failed"

    # Step 4: Clone Repository
    print_step "Cloning repository..."
    if [ ! -d "$APP_DIR" ]; then
        mkdir -p /opt
        cd /opt
        git clone https://github.com/yourusername/wa-announcer-ai.git || print_error "Failed to clone repository"
        print_success "Repository cloned"
    else
        print_success "Repository already exists"
    fi

    # Step 5: Install Dependencies
    print_step "Installing npm dependencies..."
    cd "$APP_DIR"
    npm install --production
    print_success "Dependencies installed"

    # Step 6: Setup Environment
    print_step "Setting up environment..."
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success ".env created (edit with: nano $APP_DIR/.env)"
    else
        print_success ".env already exists"
    fi

    # Step 7: Initialize Database
    print_step "Initializing database..."
    npm run migrate
    print_success "Database initialized"

    # Step 8: Setup PM2 Ecosystem
    print_step "Setting up PM2 ecosystem..."
    pm2 delete "$APP_NAME" 2>/dev/null || true
    pm2 start src/index.js --name "$APP_NAME" --env production
    pm2 startup
    pm2 save
    print_success "PM2 ecosystem configured"

    # Step 9: Setup Nginx
    print_step "Setting up Nginx..."
    apt-get install -y nginx
    
    # Create Nginx config
    cat > /etc/nginx/sites-available/${APP_NAME} << 'EOF'
upstream wa_announcer {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;
    server_name _;

    client_max_body_size 10M;

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
    }

    # API endpoints
    location /api {
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

    # Socket.io support
    location /socket.io {
        proxy_pass http://wa_announcer/socket.io;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

    # Enable site
    ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/${APP_NAME}
    rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx
    nginx -t && print_success "Nginx configured" || print_error "Nginx configuration error"

    # Restart Nginx
    systemctl restart nginx
    print_success "Nginx started"

    # Step 10: Setup SSL/HTTPS (Optional)
    read -p "Setup SSL/HTTPS with Let's Encrypt? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "Installing Certbot..."
        apt-get install -y certbot python3-certbot-nginx > /dev/null
        
        read -p "Enter your domain (e.g., announcer.example.com): " DOMAIN
        if [ ! -z "$DOMAIN" ]; then
            certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@example.com
            print_success "SSL certificate installed"
        fi
    fi

    # Step 11: Create log rotation
    print_step "Setting up log rotation..."
    mkdir -p "$APP_DIR/logs"
    cat > /etc/logrotate.d/${APP_NAME} << EOF
$APP_DIR/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 nobody nobody
    sharedscripts
    postrotate
        pm2 reload ${APP_NAME} > /dev/null 2>&1 || true
    endscript
}
EOF
    print_success "Log rotation configured"

    print_header "✅ VPS Deployment Complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit configuration:"
    echo "   nano $APP_DIR/.env"
    echo ""
    echo "2. View logs:"
    echo "   pm2 logs $APP_NAME"
    echo ""
    echo "3. Monitor:"
    echo "   pm2 monit"
    echo ""
    echo "4. Access bot:"
    echo "   http://localhost:3000 (or your domain)"
    echo ""

# ============================================================
# LOCAL DEVELOPMENT DEPLOYMENT
# ============================================================

elif [ "$ENVIRONMENT" = "local" ]; then
    print_header "Local Development Setup"

    print_step "Checking Node.js..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js not found. Please install from nodejs.org"
        exit 1
    fi
    print_success "Node.js $(node --version) found"

    print_step "Installing dependencies..."
    npm install
    print_success "Dependencies installed"

    print_step "Creating .env file..."
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success ".env created"
        echo "⚠️  Edit .env with your API keys before running!"
    fi

    print_step "Initializing database..."
    npm run migrate
    print_success "Database initialized"

    print_header "✅ Local Setup Complete!"
    echo ""
    echo "To start development:"
    echo "  npm run dev"
    echo ""
    echo "Or run specific components:"
    echo "  npm run api      # API server only"
    echo "  npm run bot      # Bot only"
    echo ""

# ============================================================
# TERMUX/ANDROID DEPLOYMENT
# ============================================================

elif [ "$ENVIRONMENT" = "termux" ]; then
    print_header "Termux/Android Setup"

    print_step "Updating Termux packages..."
    apt update && apt upgrade -y

    print_step "Installing required packages..."
    apt install -y nodejs git python python-sqlite

    print_step "Cloning repository..."
    cd $HOME
    if [ ! -d "$APP_NAME" ]; then
        git clone https://github.com/yourusername/wa-announcer-ai.git
        print_success "Repository cloned"
    fi

    print_step "Installing dependencies..."
    cd $APP_NAME
    npm install --production
    print_success "Dependencies installed"

    print_step "Setting up environment..."
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success ".env created"
    fi

    print_step "Initializing database..."
    npm run migrate
    print_success "Database initialized"

    print_header "✅ Termux Setup Complete!"
    echo ""
    echo "To run bot in background:"
    echo "  apt install tmux"
    echo "  tmux new-session -d -s wa-bot 'cd \$HOME/$APP_NAME && npm start'"
    echo ""
    echo "To view bot:"
    echo "  tmux attach -t wa-bot"
    echo ""
    echo "To detach:"
    echo "  Ctrl+B, D"
    echo ""

# ============================================================
# DOCKER DEPLOYMENT
# ============================================================

elif [ "$ENVIRONMENT" = "docker" ]; then
    print_header "Docker Setup"

    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker first."
        exit 1
    fi

    print_step "Building Docker image..."
    docker build -t wa-announcer-ai:latest .
    print_success "Image built"

    print_step "Creating container..."
    docker run -d \
        --name wa-announcer \
        -p 3000:3000 \
        -v $(pwd)/data:/app/data \
        -v $(pwd)/sessions:/app/sessions \
        -v $(pwd)/.env:/app/.env \
        --restart unless-stopped \
        wa-announcer-ai:latest

    print_success "Container started"

    print_header "✅ Docker Deployment Complete!"
    echo ""
    echo "View logs:"
    echo "  docker logs -f wa-announcer"
    echo ""
    echo "Access bot:"
    echo "  http://localhost:3000"
    echo ""

else
    print_error "Unknown environment: $ENVIRONMENT"
    echo "Usage: bash deploy.sh <vps|local|termux|docker>"
    exit 1
fi

print_success "Deployment finished!"
