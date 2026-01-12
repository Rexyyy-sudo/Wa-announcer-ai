/**
 * Authentication Middleware
 */

import { verifyJWT } from '../services/auth.service.js';
import { verifyAPIKey } from '../services/auth.service.js';
import logger from '../utils/logger.js';

/**
 * JWT Authentication Middleware
 */
export function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token tidak ditemukan'
            });
        }

        const payload = verifyJWT(token);
        req.user = payload;
        next();
    } catch (error) {
        logger.warn('Authentication error:', error.message);
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * API Key Authentication Middleware
 */
export async function authenticateAPIKey(req, res, next) {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: 'API key tidak ditemukan'
            });
        }

        const result = await verifyAPIKey(apiKey);

        if (!result.valid) {
            return res.status(401).json({
                success: false,
                message: result.message || 'Invalid API key'
            });
        }

        req.user = { userId: result.userId };
        req.apiKey = result;
        next();
    } catch (error) {
        logger.warn('API key authentication error:', error.message);
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
}

/**
 * Authorization middleware untuk role check
 */
export function authorize(requiredRole) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'User role tidak ditemukan'
            });
        }

        if (req.user.role !== requiredRole && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: `Akses ditolak. Memerlukan role: ${requiredRole}`
            });
        }

        next();
    };
}

/**
 * Rate limiting middleware (simple memory-based)
 */
const rateLimit = {};

export function rateLimiter(windowMs = 15 * 60 * 1000, maxRequests = 100) {
    return (req, res, next) => {
        const key = req.user?.userId || req.ip;
        const now = Date.now();

        if (!rateLimit[key]) {
            rateLimit[key] = [];
        }

        // Remove old requests outside the window
        rateLimit[key] = rateLimit[key].filter(time => now - time < windowMs);

        if (rateLimit[key].length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Terlalu banyak request. Coba lagi nanti.'
            });
        }

        rateLimit[key].push(now);
        next();
    };
}

/**
 * Validate request body
 */
export function validate(schema) {
    return (req, res, next) => {
        try {
            // Simple validation - check required fields
            if (schema.required) {
                for (const field of schema.required) {
                    if (!req.body[field]) {
                        return res.status(400).json({
                            success: false,
                            message: `Field "${field}" wajib diisi`
                        });
                    }
                }
            }
            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.message
            });
        }
    };
}

/**
 * Error handler middleware
 */
export function errorHandler(err, req, res, next) {
    logger.error('Unhandled error:', err);

    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Terjadi error di server'
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
}

/**
 * Log request middleware
 */
export function requestLogger(req, res, next) {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            user: req.user?.userId || 'anonymous'
        });
    });

    next();
}

export default {
    authenticate,
    authenticateAPIKey,
    authorize,
    rateLimiter,
    validate,
    errorHandler,
    requestLogger
};
