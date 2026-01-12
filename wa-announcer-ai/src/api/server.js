/**
 * Express API Server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
import {
    authenticate,
    authenticateAPIKey,
    rateLimiter,
    requestLogger,
    errorHandler
} from '../middleware/auth.middleware.js';

// Load env
dotenv.config();

const app = express();

// ============ MIDDLEWARES ============

// Security
app.use(helmet());

// CORS
const allowedOrigins = (process.env.ALLOW_ORIGINS || 'http://localhost:3001').split(',');
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter(15 * 60 * 1000, 100));

// ============ ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API Server is running',
        timestamp: new Date().toISOString()
    });
});

// Auth routes
import authRoutes from './routes/auth.routes.js';
app.use('/api/auth', authRoutes);

// Protected routes (JWT)
import announcementRoutes from './routes/announcements.routes.js';
import templateRoutes from './routes/templates.routes.js';
import botRoutes from './routes/bot.routes.js';

app.use('/api/announcements', authenticate, announcementRoutes);
app.use('/api/templates', authenticate, templateRoutes);
app.use('/api/bot', authenticate, botRoutes);

// API Key protected routes
import webhookRoutes from './routes/webhook.routes.js';
app.use('/api/webhook', authenticateAPIKey, webhookRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint tidak ditemukan'
    });
});

// Error handler
app.use(errorHandler);

// ============ START SERVER ============

const PORT = process.env.API_PORT || 3000;
const HOST = process.env.API_HOST || '0.0.0.0';

export async function startServer() {
    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, HOST, () => {
            logger.info(`🚀 API Server running on http://${HOST}:${PORT}`);
            resolve(server);
        });

        server.on('error', reject);
    });
}

export default app;
