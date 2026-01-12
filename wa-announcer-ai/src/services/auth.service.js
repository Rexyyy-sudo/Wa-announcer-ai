/**
 * Authentication & JWT Service
 */

import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword, generateToken } from '../utils/crypto.js';
import { Users, ApiKeys } from '../db/database.js';
import logger from '../utils/logger.js';
import { generateId } from '../utils/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_change_this';
const JWT_EXPIRES_IN = '7d';

/**
 * Register user
 */
export async function register(userData) {
    try {
        const { username, email, password, phone, organization } = userData;

        // Validate
        if (!username || !email || !password) {
            throw new Error('Username, email, dan password wajib diisi');
        }

        // Check if user exists
        const existing = await Users.findByEmail(email);
        if (existing) {
            throw new Error('Email sudah terdaftar');
        }

        // Hash password
        const passwordHash = hashPassword(password);

        // Create user
        const userId = generateId();
        await Users.create({
            id: userId,
            username,
            email,
            passwordHash,
            phone,
            organization,
            role: 'user'
        });

        logger.info(`User registered: ${email}`);

        return {
            success: true,
            userId,
            message: 'Registrasi berhasil'
        };
    } catch (error) {
        logger.error('Registration error:', error);
        throw error;
    }
}

/**
 * Login user
 */
export async function login(email, password) {
    try {
        // Find user
        const user = await Users.findByEmail(email);

        if (!user) {
            throw new Error('Email atau password salah');
        }

        // Verify password
        if (!verifyPassword(password, user.password_hash)) {
            throw new Error('Email atau password salah');
        }

        // Update last login
        await Users.updateLastLogin(user.id);

        // Generate JWT
        const token = generateJWT({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        logger.info(`User logged in: ${email}`);

        return {
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                organization: user.organization
            }
        };
    } catch (error) {
        logger.error('Login error:', error);
        throw error;
    }
}

/**
 * Generate JWT token
 */
export function generateJWT(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyJWT(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid atau expired token');
    }
}

/**
 * Create API key
 */
export async function createAPIKey(userId, name) {
    try {
        const apiKey = generateToken(32);
        const keyId = generateId();
        const expiresAt = new Date();
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);

        await ApiKeys.create({
            id: keyId,
            userId,
            key: apiKey,
            name,
            expiresAt: expiresAt.toISOString()
        });

        logger.info(`API key created for user ${userId}`);

        return {
            success: true,
            keyId,
            apiKey,
            name,
            expiresAt
        };
    } catch (error) {
        logger.error('Create API key error:', error);
        throw error;
    }
}

/**
 * Verify API key
 */
export async function verifyAPIKey(apiKey) {
    try {
        const key = await ApiKeys.findByKey(apiKey);

        if (!key) {
            throw new Error('Invalid API key');
        }

        // Check expiration
        if (key.expires_at && new Date(key.expires_at) < new Date()) {
            throw new Error('API key expired');
        }

        // Update last used
        await ApiKeys.updateLastUsed(key.id);

        return {
            valid: true,
            userId: key.user_id,
            keyId: key.id,
            keyName: key.name
        };
    } catch (error) {
        logger.error('Verify API key error:', error);
        throw error;
    }
}

/**
 * Refresh JWT token
 */
export async function refreshToken(oldToken) {
    try {
        const payload = verifyJWT(oldToken);

        const newToken = generateJWT({
            userId: payload.userId,
            email: payload.email,
            role: payload.role
        });

        return {
            success: true,
            token: newToken
        };
    } catch (error) {
        throw error;
    }
}

export default {
    register,
    login,
    generateJWT,
    verifyJWT,
    createAPIKey,
    verifyAPIKey,
    refreshToken
};
