#!/usr/bin/env node

/**
 * WhatsApp AI Announcer Bot - Interactive Setup Wizard
 * 
 * Usage: node scripts/setup-wizard.js
 * 
 * Membuat setup .env secara interaktif dengan validasi
 */

import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
const ENV_FILE = path.join(PROJECT_ROOT, '.env');
const ENV_EXAMPLE = path.join(PROJECT_ROOT, '.env.example');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    blue: '\x1b[34m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

function header(msg) {
    console.log('\n' + '='.repeat(50));
    log(msg, 'bright');
    console.log('='.repeat(50) + '\n');
}

async function question(prompt) {
    return new Promise(resolve => {
        rl.question(prompt, resolve);
    });
}

async function select(prompt, options) {
    console.log('\n' + prompt + '\n');
    options.forEach((opt, i) => {
        console.log(`  ${i + 1}) ${opt}`);
    });

    let answer;
    while (true) {
        answer = await question(`Select [1-${options.length}]: `);
        if (parseInt(answer) >= 1 && parseInt(answer) <= options.length) {
            return parseInt(answer) - 1;
        }
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhoneNumber(phone) {
    return /^(\+?62|0)[0-9]{9,12}$/.test(phone.replace(/\s/g, ''));
}

async function main() {
    log('\n╔════════════════════════════════════════╗', 'blue');
    log('║ WhatsApp AI Announcer Bot - Setup     ║', 'blue');
    log('╚════════════════════════════════════════╝\n', 'blue');

    // Check if .env exists
    if (fs.existsSync(ENV_FILE)) {
        log('ℹ️  .env file already exists!', 'yellow');
        const overwrite = await question('Overwrite existing .env? (y/n): ');
        if (overwrite.toLowerCase() !== 'y') {
            log('✓ Setup cancelled', 'green');
            rl.close();
            return;
        }
    }

    // === BASIC CONFIGURATION ===
    header('1️⃣ BASIC CONFIGURATION');

    // Node Environment
    const envMode = await select('Environment:',
        ['Development (npm run dev)',
            'Production (npm start)']
    );
    const NODE_ENV = envMode === 0 ? 'development' : 'production';
    log(`✓ Selected: ${NODE_ENV}`, 'green');

    // API Port
    let API_PORT = '3000';
    const customPort = await question('\nAPI Port [3000]: ');
    if (customPort) {
        if (!/^\d{4,5}$/.test(customPort)) {
            log('⚠️  Invalid port, using 3000', 'yellow');
        } else {
            API_PORT = customPort;
        }
    }

    // === WHATSAPP CONFIGURATION ===
    header('2️⃣ WHATSAPP CONFIGURATION');

    const WHATSAPP_SESSION_PATH = './sessions';
    log(`✓ Session path: ${WHATSAPP_SESSION_PATH}`, 'green');

    // === AI PROVIDER ===
    header('3️⃣ AI PROVIDER SELECTION');

    log('Choose AI provider for announcement formatting:');
    const aiProvider = await select('AI Provider:',
        ['OpenAI (GPT-3.5/GPT-4) - Recommended for quality',
            'Ollama (Local LLM) - Free, private, offline',
            'Skip for now (configure later)']
    );

    let OPENAI_API_KEY = '';
    let OPENAI_MODEL = 'gpt-3.5-turbo';
    let OLLAMA_API_URL = 'http://localhost:11434';
    let OLLAMA_MODEL = 'mistral';

    if (aiProvider === 0) {
        // OpenAI setup
        log('\n🔐 OpenAI Configuration:', 'blue');
        log('Get API key from: https://platform.openai.com/api-keys\n', 'yellow');

        OPENAI_API_KEY = await question('OpenAI API Key (sk-...): ');
        if (!OPENAI_API_KEY.startsWith('sk-')) {
            log('⚠️  API key should start with sk-', 'yellow');
        }

        const modelChoice = await select('OpenAI Model:',
            ['gpt-3.5-turbo (Fast, cheap) - Recommended',
                'gpt-4 (Better quality, slower)',
                'gpt-4-turbo-preview (Best quality)',
                'Custom']
        );

        if (modelChoice === 3) {
            OPENAI_MODEL = await question('Model name: ');
        } else {
            const models = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo-preview'];
            OPENAI_MODEL = models[modelChoice];
        }

        log(`✓ Using ${OPENAI_MODEL}`, 'green');

    } else if (aiProvider === 1) {
        // Ollama setup
        log('\n🦙 Ollama Configuration (Local LLM)', 'blue');
        log('Setup: docker run -d -p 11434:11434 ollama/ollama', 'yellow');
        log('Then pull a model: ollama pull mistral\n', 'yellow');

        const ollamaUrl = await question('Ollama API URL [http://localhost:11434]: ');
        if (ollamaUrl) OLLAMA_API_URL = ollamaUrl;

        const ollamaModel = await question('Model name [mistral]: ');
        if (ollamaModel) OLLAMA_MODEL = ollamaModel;

        log(`✓ Ollama configured`, 'green');
    }

    const AI_PROVIDER = aiProvider === 0 ? 'openai' : aiProvider === 1 ? 'ollama' : 'openai';

    // === DATABASE ===
    header('4️⃣ DATABASE');

    const DB_PATH = './data/announcer.db';
    log(`✓ Using SQLite3 at ${DB_PATH}`, 'green');

    // === SECURITY ===
    header('5️⃣ SECURITY CONFIGURATION');

    // Generate random keys
    function generateRandomKey(length = 32) {
        return Array.from({ length }, () =>
            Math.random().toString(16)[2]).join('').slice(0, length);
    }

    const JWT_SECRET = generateRandomKey(32);
    const ENCRYPTION_KEY = generateRandomKey(32);
    log(`✓ JWT Secret generated (${JWT_SECRET.length} chars)`, 'green');
    log(`✓ Encryption Key generated (${ENCRYPTION_KEY.length} chars)`, 'green');

    // CORS Origins
    let ALLOW_ORIGINS = 'http://localhost:3000,http://localhost:3001';
    const customOrigins = await question('\nAllowed CORS Origins [localhost]: ');
    if (customOrigins) {
        ALLOW_ORIGINS = customOrigins;
    }

    // === ADMIN SETUP ===
    header('6️⃣ ADMIN SETUP');

    let ADMIN_EMAIL = '';
    while (!validateEmail(ADMIN_EMAIL)) {
        ADMIN_EMAIL = await question('Admin Email: ');
        if (!validateEmail(ADMIN_EMAIL)) {
            log('⚠️  Invalid email format', 'yellow');
        }
    }
    log(`✓ Admin email: ${ADMIN_EMAIL}`, 'green');

    const ADMIN_PASSWORD = generateRandomKey(16);
    log(`✓ Default admin password generated: ${ADMIN_PASSWORD}`, 'yellow');
    log(`   ⚠️  Change this in production!`, 'red');

    // === ORGANIZATION ===
    header('7️⃣ ORGANIZATION INFO');

    const ORG_NAME = await question('Organization Name (optional): ');
    const ORG_PHONE = await question('Organization Phone (optional): ');
    const ORG_EMAIL = await question('Organization Email (optional): ');

    // === LOGGING ===
    header('8️⃣ LOGGING');

    const logLevelChoice = await select('Log Level:',
        ['info (Default)',
            'debug (Verbose)',
            'warn (Minimal)',
            'error (Errors only)']
    );

    const LOG_LEVELS = ['info', 'debug', 'warn', 'error'];
    const LOG_LEVEL = LOG_LEVELS[logLevelChoice];
    log(`✓ Log level: ${LOG_LEVEL}`, 'green');

    // === GENERATE .env ===
    header('📝 GENERATING .env FILE');

    const envContent = `# ================================================
# WhatsApp AI Announcer Bot - Configuration
# Generated: ${new Date().toISOString()}
# ================================================

# Environment
NODE_ENV=${NODE_ENV}
API_PORT=${API_PORT}
API_HOST=0.0.0.0

# WhatsApp
WHATSAPP_SESSION_PATH=${WHATSAPP_SESSION_PATH}
WHATSAPP_HEADLESS=true

# AI Provider: 'openai' atau 'ollama'
AI_PROVIDER=${AI_PROVIDER}

# OpenAI Configuration
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_MODEL=${OPENAI_MODEL}

# Ollama Configuration (Local LLM)
OLLAMA_API_URL=${OLLAMA_API_URL}
OLLAMA_MODEL=${OLLAMA_MODEL}

# Database
DB_PATH=${DB_PATH}
DB_BACKUP_INTERVAL=3600000

# JWT & API Key
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=7d
API_KEY_LENGTH=32

# Encryption
ENCRYPTION_KEY=${ENCRYPTION_KEY}
ALLOW_ORIGINS=${ALLOW_ORIGINS}

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Admin
ADMIN_EMAIL=${ADMIN_EMAIL}
ADMIN_PASSWORD=${ADMIN_PASSWORD}
ADMIN_USERNAME=admin

# Organization
ORG_NAME=${ORG_NAME || 'My Organization'}
ORG_PHONE=${ORG_PHONE || ''}
ORG_EMAIL=${ORG_EMAIL || ''}
ORG_TIMEZONE=Asia/Jakarta

# Logging
LOG_LEVEL=${LOG_LEVEL}
LOG_PATH=./logs

# Features
ENABLE_ANALYTICS=true
ENABLE_AUDIT_LOG=true
CACHE_ENABLED=true
CACHE_TTL=300
`;

    try {
        fs.writeFileSync(ENV_FILE, envContent);
        log(`\n✓ .env file created successfully!`, 'green');
        log(`Location: ${ENV_FILE}`, 'green');
    } catch (error) {
        log(`\n✗ Error creating .env file: ${error.message}`, 'red');
        rl.close();
        process.exit(1);
    }

    // === SUMMARY ===
    header('✅ SETUP COMPLETE!');

    log('Configuration Summary:', 'bright');
    console.log(`
  Environment: ${NODE_ENV}
  API Port: ${API_PORT}
  AI Provider: ${AI_PROVIDER}
  Database: ${DB_PATH}
  Admin Email: ${ADMIN_EMAIL}
  Log Level: ${LOG_LEVEL}
    `);

    log('⚠️  Important:');
    log('  1. Change admin password before production', 'yellow');
    log('  2. Update ENCRYPTION_KEY in .env', 'yellow');
    log('  3. Add your domain to ALLOW_ORIGINS', 'yellow');
    log('  4. Setup HTTPS/SSL in production', 'yellow');

    log('\n📚 Next Steps:', 'bright');
    log('  1. Initialize database: npm run migrate', 'yellow');
    log('  2. Start bot: npm start (production) or npm run dev (dev)', 'yellow');
    log('  3. Scan QR code with WhatsApp', 'yellow');
    log('  4. Read documentation: docs/USER_GUIDE.md', 'yellow');

    log('\n📖 Documentations:', 'bright');
    log('  - User Guide: docs/USER_GUIDE.md', 'yellow');
    log('  - Installation: docs/INSTALLATION.md', 'yellow');
    log('  - API Docs: docs/API.md', 'yellow');
    log('  - Security: docs/SECURITY.md', 'yellow');

    log('\n✨ Happy announcing! 📢\n', 'bright');

    rl.close();
}

main().catch(error => {
    log(`\n✗ Setup error: ${error.message}`, 'red');
    rl.close();
    process.exit(1);
});
