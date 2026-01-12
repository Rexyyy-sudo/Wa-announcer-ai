/**
 * Main Application Entry Point
 */

import dotenv from 'dotenv';
import logger from './utils/logger.js';
import { initDatabase, loadSchema } from './db/database.js';
import { initWhatsApp } from './bot/whatsapp.js';
import { startServer } from './api/server.js';

// Load environment
dotenv.config();

/**
 * Initialize application
 */
async function initialize() {
    try {
        logger.info('🚀 Initializing WA Announcer AI Bot...');

        // 1. Database
        logger.info('📊 Initializing database...');
        const dbPath = process.env.DB_PATH || './data/announcer.db';
        await initDatabase(dbPath);
        await loadSchema();
        logger.info('✅ Database ready');

        // 2. WhatsApp Bot
        logger.info('💬 Initializing WhatsApp Bot...');
        await initWhatsApp();
        logger.info('✅ WhatsApp Bot initialized (waiting for QR scan)');

        // 3. API Server
        logger.info('🌐 Starting API Server...');
        await startServer();
        logger.info('✅ API Server started');

        logger.info('✅ Application fully initialized!');
        logger.info('');
        logger.info('📱 WhatsApp: Scan QR code di terminal');
        logger.info(`🌐 API: http://localhost:${process.env.API_PORT || 3000}`);
        logger.info(`📊 DB: ${dbPath}`);
        logger.info('');

    } catch (error) {
        logger.error('❌ Initialization error:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Shutting down...');
    process.exit(0);
});

// Start application
initialize();
