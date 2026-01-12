/**
 * Auth Routes
 */

import express from 'express';
import { register, login, refreshToken, createAPIKey } from '../../services/auth.service.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, phone, organization } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, dan password wajib diisi'
            });
        }

        const result = await register({ username, email, password, phone, organization });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi'
            });
        }

        const result = await login(email, password);

        res.json(result);
    } catch (error) {
        logger.warn('Login attempt failed:', error.message);
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token wajib diisi'
            });
        }

        const result = await refreshToken(token);

        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/api-key
 */
router.post('/api-key', authenticate, async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Nama API key wajib diisi'
            });
        }

        const result = await createAPIKey(req.user.userId, name);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
