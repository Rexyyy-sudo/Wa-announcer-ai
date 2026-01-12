#!/bin/bash

# ============================================================
# WhatsApp AI Announcer Bot - Project Validation Checklist
# ============================================================
# 
# Run this script to verify all components are in place
# Usage: bash scripts/validate.sh
#
# ============================================================

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
    local name=$1
    local path=$2
    
    if [ -f "$path" ] || [ -d "$path" ]; then
        echo -e "${GREEN}✓${NC} $name"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $name (missing)"
        ((FAIL++))
    fi
}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  WhatsApp AI Announcer Bot - Validate  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# === SOURCE CODE ===
echo -e "${YELLOW}[1] Source Code Files${NC}"
check "Entry point" "src/index.js"
check "WhatsApp bot" "src/bot/whatsapp.js"
check "API server" "src/api/server.js"
check "AI service" "src/services/ai.service.js"
check "Database" "src/db/database.js"
check "Database schema" "src/db/schema.sql"
check "Routes" "src/api/routes/"
check "Middleware" "src/middleware/"
check "Utils" "src/utils/"
check "Prompts" "src/prompts/"

# === CONFIGURATION ===
echo -e "\n${YELLOW}[2] Configuration Files${NC}"
check ".env.example" ".env.example"
check "package.json" "package.json"
check ".gitignore" ".gitignore"
check ".dockerignore" ".dockerignore"

# === DOCUMENTATION ===
echo -e "\n${YELLOW}[3] Documentation${NC}"
check "README.md" "README.md"
check "QUICK_START.md" "QUICK_START.md"
check "QUICK_START_EASY.md" "QUICK_START_EASY.md"
check "START_HERE.md" "START_HERE.md"
check "IMPLEMENTATION_COMPLETE.md" "IMPLEMENTATION_COMPLETE.md"
check "Installation guide" "docs/INSTALLATION.md"
check "User guide" "docs/USER_GUIDE.md"
check "API docs" "docs/API.md"
check "Architecture guide" "docs/ARCHITECTURE.md"
check "Security guide" "docs/SECURITY.md"
check "Troubleshooting guide" "docs/TROUBLESHOOTING.md"

# === DEPLOYMENT ===
echo -e "\n${YELLOW}[4] Deployment Files${NC}"
check "Dockerfile" "Dockerfile"
check "docker-compose.yml" "docker-compose.yml"
check "Deploy script" "scripts/deploy.sh"
check "VPS deploy script" "scripts/deploy-vps.sh"
check "Setup script" "scripts/setup.js"
check "Setup wizard" "scripts/setup-wizard.js"
check "Migration script" "scripts/migrate.js"

# === DIRECTORIES ===
echo -e "\n${YELLOW}[5] Required Directories${NC}"
check "src/" "src/"
check "docs/" "docs/"
check "scripts/" "scripts/"
check "web/" "web/"
check "config/" "config/"

# === DEPENDENCIES ===
echo -e "\n${YELLOW}[6] Dependencies Check${NC}"
if grep -q "\"express\"" package.json; then
    echo -e "${GREEN}✓${NC} Express.js"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Express.js (not found)"
    ((FAIL++))
fi

if grep -q "\"whatsapp-web.js\"" package.json; then
    echo -e "${GREEN}✓${NC} whatsapp-web.js"
    ((PASS++))
else
    echo -e "${RED}✗${NC} whatsapp-web.js (not found)"
    ((FAIL++))
fi

if grep -q "\"openai\"" package.json; then
    echo -e "${GREEN}✓${NC} OpenAI"
    ((PASS++))
else
    echo -e "${RED}✗${NC} OpenAI (not found)"
    ((FAIL++))
fi

if grep -q "\"sqlite3\"" package.json; then
    echo -e "${GREEN}✓${NC} SQLite3"
    ((PASS++))
else
    echo -e "${RED}✗${NC} SQLite3 (not found)"
    ((FAIL++))
fi

if grep -q "\"jsonwebtoken\"" package.json; then
    echo -e "${GREEN}✓${NC} JWT"
    ((PASS++))
else
    echo -e "${RED}✗${NC} JWT (not found)"
    ((FAIL++))
fi

if grep -q "\"helmet\"" package.json; then
    echo -e "${GREEN}✓${NC} Helmet (security)"
    ((PASS++))
else
    echo -e "${RED}✗${NC} Helmet (not found)"
    ((FAIL++))
fi

# === SUMMARY ===
echo ""
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Validation Summary           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

TOTAL=$((PASS + FAIL))
PERCENT=$((PASS * 100 / TOTAL))

echo "✓ Passed: $PASS/$TOTAL"
echo "✗ Failed: $FAIL/$TOTAL"
echo "Progress: ${PERCENT}%\n"

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! System is complete.${NC}\n"
    echo "Next steps:"
    echo "  1. npm install"
    echo "  2. cp .env.example .env"
    echo "  3. nano .env (edit configuration)"
    echo "  4. npm run migrate"
    echo "  5. npm start"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Review missing files above.${NC}\n"
    exit 1
fi
