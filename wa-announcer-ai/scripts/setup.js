#!/bin/bash

# WhatsApp AI Announcer Bot - Setup Script
# Run: npm run setup

set - e

echo "🚀 WhatsApp AI Announcer Bot - Setup"
echo "===================================="

# Check Node.js
echo "Checking Node.js..."
if !command - v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check npm
echo "Checking npm..."
if !command - v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✅ npm $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create directories
echo ""
echo "📁 Creating directories..."
mkdir - p data sessions logs

# Database setup
echo ""
echo "📊 Setting up database..."
node - e "
const db = require('sqlite3');
const sqlite = require('sqlite');
const fs = require('fs');
const path = require('path');

const initDb = async () => {
    const dbPath = './data/announcer.db';
    const database = await sqlite.open({
        filename: dbPath,
        driver: db.Database
    });

    const schema = fs.readFileSync('./src/db/schema.sql', 'utf-8');
    const statements = schema.split(';').filter(s => s.trim());

    for (const stmt of statements) {
        await database.exec(stmt);
    }

    await database.close();
    console.log('✅ Database initialized');
};

initDb().catch(err => {
    console.error('❌ Database error:', err);
    process.exit(1);
});
"

# Create.env if not exists
echo ""
if [! -f.env]; then
    echo "📝 Creating .env file..."
cp.env.example.env
    echo "⚠️  Please edit .env with your configuration"
    echo "   - Set OPENAI_API_KEY"
    echo "   - Change JWT_SECRET"
    echo "   - Change ENCRYPTION_KEY"
    echo "   - Change API_KEY"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your configuration"
echo "2. Run: npm run dev"
echo "3. Scan QR code with WhatsApp"
echo ""
echo "For help, read: docs/INSTALLATION.md"
