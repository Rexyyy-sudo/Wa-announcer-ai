/**
 * Database Service untuk SQLite3
 * Handle semua operasi database dengan connection pooling
 */

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

/**
 * Initialize database connection
 */
export async function initDatabase(dbPath = './data/announcer.db') {
    try {
        // Ensure data directory exists
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Enable foreign keys
        await db.exec('PRAGMA foreign_keys = ON');

        // Set journal mode to WAL for better concurrency
        await db.exec('PRAGMA journal_mode = WAL');

        // Set timeout untuk busy database
        await db.exec('PRAGMA busy_timeout = 5000');

        logger.info(`Database initialized at ${dbPath}`);
        return db;
    } catch (error) {
        logger.error('Database initialization error:', error);
        throw error;
    }
}

/**
 * Load dan jalankan schema SQL
 */
export async function loadSchema() {
    try {
        if (!db) throw new Error('Database not initialized');

        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        // Split by semicolon dan execute setiap statement
        const statements = schema.split(';').filter(s => s.trim());

        for (const statement of statements) {
            await db.exec(statement);
        }

        logger.info('Database schema loaded successfully');
    } catch (error) {
        logger.error('Schema loading error:', error);
        throw error;
    }
}

/**
 * Get database instance
 */
export function getDatabase() {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase first.');
    }
    return db;
}

/**
 * Close database connection
 */
export async function closeDatabase() {
    if (db) {
        await db.close();
        db = null;
        logger.info('Database connection closed');
    }
}

// ============ USER OPERATIONS ============

export const Users = {
    async create(userData) {
        const db = getDatabase();
        const { id, username, email, passwordHash, role = 'user', phone = null, organization = null } = userData;

        return db.run(
            `INSERT INTO users (id, username, email, password_hash, role, phone_number, organization)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, username, email, passwordHash, role, phone, organization]
        );
    },

    async findById(id) {
        const db = getDatabase();
        return db.get('SELECT * FROM users WHERE id = ?', [id]);
    },

    async findByEmail(email) {
        const db = getDatabase();
        return db.get('SELECT * FROM users WHERE email = ?', [email]);
    },

    async findByUsername(username) {
        const db = getDatabase();
        return db.get('SELECT * FROM users WHERE username = ?', [username]);
    },

    async update(id, updates) {
        const db = getDatabase();
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map(k => `${k} = ?`).join(', ');

        return db.run(
            `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [...values, id]
        );
    },

    async updateLastLogin(userId) {
        return this.update(userId, { last_login: new Date().toISOString() });
    },

    async list(limit = 50, offset = 0) {
        const db = getDatabase();
        return db.all(
            'SELECT id, username, email, role, organization, is_active, created_at FROM users LIMIT ? OFFSET ?',
            [limit, offset]
        );
    },

    async delete(id) {
        const db = getDatabase();
        return db.run('DELETE FROM users WHERE id = ?', [id]);
    }
};

// ============ TEMPLATE OPERATIONS ============

export const Templates = {
    async create(templateData) {
        const db = getDatabase();
        const { id, userId, name, description, content, category } = templateData;

        return db.run(
            `INSERT INTO templates (id, user_id, name, description, content, category)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, name, description, content, category]
        );
    },

    async findById(id) {
        const db = getDatabase();
        return db.get('SELECT * FROM templates WHERE id = ?', [id]);
    },

    async findByUserAndName(userId, name) {
        const db = getDatabase();
        return db.get(
            'SELECT * FROM templates WHERE user_id = ? AND name = ?',
            [userId, name]
        );
    },

    async listByUser(userId, limit = 100) {
        const db = getDatabase();
        return db.all(
            `SELECT * FROM templates WHERE user_id = ? 
       ORDER BY is_favorite DESC, updated_at DESC LIMIT ?`,
            [userId, limit]
        );
    },

    async update(id, updates) {
        const db = getDatabase();
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map(k => `${k} = ?`).join(', ');

        return db.run(
            `UPDATE templates SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [...values, id]
        );
    },

    async incrementUsage(id) {
        const db = getDatabase();
        return db.run(
            'UPDATE templates SET usage_count = usage_count + 1 WHERE id = ?',
            [id]
        );
    },

    async delete(id) {
        const db = getDatabase();
        return db.run('DELETE FROM templates WHERE id = ?', [id]);
    },

    async deleteByUser(userId) {
        const db = getDatabase();
        return db.run('DELETE FROM templates WHERE user_id = ?', [userId]);
    }
};

// ============ ANNOUNCEMENT OPERATIONS ============

export const Announcements = {
    async create(announcementData) {
        const db = getDatabase();
        const {
            id, userId, originalInput, formattedContent, activityName,
            eventDate, eventTime, location, coordinator, targetAudience, aiProvider, formattingTimeMs
        } = announcementData;

        return db.run(
            `INSERT INTO announcements 
       (id, user_id, original_input, formatted_content, activity_name, event_date, event_time, 
        location, coordinator, target_audience, ai_provider, formatting_time_ms)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, originalInput, formattedContent, activityName, eventDate, eventTime,
                location, coordinator, targetAudience, aiProvider, formattingTimeMs]
        );
    },

    async findById(id) {
        const db = getDatabase();
        return db.get('SELECT * FROM announcements WHERE id = ?', [id]);
    },

    async listByUser(userId, limit = 50, offset = 0) {
        const db = getDatabase();
        return db.all(
            'SELECT * FROM announcements WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );
    },

    async update(id, updates) {
        const db = getDatabase();
        const keys = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = keys.map(k => `${k} = ?`).join(', ');

        return db.run(
            `UPDATE announcements SET ${setClause} WHERE id = ?`,
            [...values, id]
        );
    },

    async updateStatus(id, status) {
        return this.update(id, { status, sent_at: new Date().toISOString() });
    },

    async delete(id) {
        const db = getDatabase();
        return db.run('DELETE FROM announcements WHERE id = ?', [id]);
    }
};

// ============ ANNOUNCEMENT HISTORY ============

export const AnnouncementHistory = {
    async create(historyData) {
        const db = getDatabase();
        const { id, announcementId, targetType, targetId, targetName } = historyData;

        return db.run(
            `INSERT INTO announcement_history (id, announcement_id, target_type, target_id, target_name)
       VALUES (?, ?, ?, ?, ?)`,
            [id, announcementId, targetType, targetId, targetName]
        );
    },

    async updateStatus(id, status, errorMessage = null) {
        const db = getDatabase();
        return db.run(
            `UPDATE announcement_history SET status = ?, error_message = ?, sent_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [status, errorMessage, id]
        );
    },

    async listByAnnouncement(announcementId) {
        const db = getDatabase();
        return db.all(
            'SELECT * FROM announcement_history WHERE announcement_id = ?',
            [announcementId]
        );
    }
};

// ============ API KEY OPERATIONS ============

export const ApiKeys = {
    async create(keyData) {
        const db = getDatabase();
        const { id, userId, key, name, expiresAt } = keyData;

        return db.run(
            `INSERT INTO api_keys (id, user_id, key, name, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
            [id, userId, key, name, expiresAt]
        );
    },

    async findByKey(key) {
        const db = getDatabase();
        return db.get('SELECT * FROM api_keys WHERE key = ? AND is_active = 1', [key]);
    },

    async listByUser(userId) {
        const db = getDatabase();
        return db.all(
            'SELECT id, user_id, name, is_active, last_used, created_at FROM api_keys WHERE user_id = ?',
            [userId]
        );
    },

    async updateLastUsed(id) {
        const db = getDatabase();
        return db.run(
            'UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
    },

    async revoke(id) {
        const db = getDatabase();
        return db.run(
            'UPDATE api_keys SET is_active = 0 WHERE id = ?',
            [id]
        );
    }
};

// ============ AUDIT LOG OPERATIONS ============

export const AuditLog = {
    async log(logData) {
        const db = getDatabase();
        const { id, userId, action, resourceType, resourceId, changes, ipAddress } = logData;

        return db.run(
            `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, changes, ip_address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, action, resourceType, resourceId, JSON.stringify(changes), ipAddress]
        );
    },

    async listByUser(userId, limit = 100) {
        const db = getDatabase();
        return db.all(
            'SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
            [userId, limit]
        );
    }
};

// ============ WHATSAPP GROUPS ============

export const Groups = {
    async createOrUpdate(groupData) {
        const db = getDatabase();
        const { id, name, membersCount } = groupData;

        const existing = await this.findById(id);
        if (existing) {
            return db.run(
                'UPDATE whatsapp_groups SET name = ?, members_count = ?, synced_at = CURRENT_TIMESTAMP WHERE id = ?',
                [name, membersCount, id]
            );
        }

        return db.run(
            'INSERT INTO whatsapp_groups (id, name, members_count) VALUES (?, ?, ?)',
            [id, name, membersCount]
        );
    },

    async findById(id) {
        const db = getDatabase();
        return db.get('SELECT * FROM whatsapp_groups WHERE id = ?', [id]);
    },

    async list() {
        const db = getDatabase();
        return db.all('SELECT * FROM whatsapp_groups WHERE is_active = 1 ORDER BY name');
    }
};

// ============ WHATSAPP CONTACTS ============

export const Contacts = {
    async createOrUpdate(contactData) {
        const db = getDatabase();
        const { id, phoneNumber, name, isGroup } = contactData;

        const existing = await this.findById(id);
        if (existing) {
            return db.run(
                'UPDATE whatsapp_contacts SET name = ?, is_group = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [name, isGroup ? 1 : 0, id]
            );
        }

        return db.run(
            'INSERT INTO whatsapp_contacts (id, phone_number, name, is_group) VALUES (?, ?, ?, ?)',
            [id, phoneNumber, name, isGroup ? 1 : 0]
        );
    },

    async findById(id) {
        const db = getDatabase();
        return db.get('SELECT * FROM whatsapp_contacts WHERE id = ?', [id]);
    },

    async list(isGroup = null) {
        const db = getDatabase();
        if (isGroup !== null) {
            return db.all(
                'SELECT * FROM whatsapp_contacts WHERE is_group = ? AND is_blocked = 0 ORDER BY name',
                [isGroup ? 1 : 0]
            );
        }
        return db.all('SELECT * FROM whatsapp_contacts WHERE is_blocked = 0 ORDER BY name');
    },

    async listGroups() {
        return this.list(true);
    },

    async listPersonal() {
        return this.list(false);
    }
};
