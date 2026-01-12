#!/bin/bash

# WhatsApp AI Announcer Bot - Migration Script
# Run: npm run migrate

echo "🔄 Running migrations..."

node << 'EOF'
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');

const migrate = async () => {
    const db = await sqlite.open({
        filename: './data/announcer.db',
        driver: sqlite3.Database
    });

    // Add any migration logic here
    // Example:
    // ALTER TABLE users ADD COLUMN new_field TEXT;

    console.log('✅ Migrations completed');
    await db.close();
};

migrate().catch(err => {
    console.error('❌ Migration error:', err);
    process.exit(1);
});
EOF

echo "Done!"
