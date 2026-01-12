/**
 * Bot Routes
 */

import express from 'express';
import { getWhatsAppClient, getBotStatus } from '../../bot/whatsapp.js';
import { checkProviderAvailability } from '../../services/ai.service.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * GET /api/bot/status
 */
router.get('/status', async (req, res, next) => {
    try {
        const botStatus = getBotStatus();
        const aiProvider = await checkProviderAvailability();

        let whatsappStatus = {
            ready: false,
            chats: 0,
            groups: 0,
            contacts: 0
        };

        try {
            const client = getWhatsAppClient();
            if (client && botStatus.ready) {
                const chats = await client.getChats();
                whatsappStatus = {
                    ready: true,
                    chats: chats.length,
                    groups: chats.filter(c => c.isGroup).length,
                    contacts: chats.filter(c => !c.isGroup).length
                };
            }
        } catch (error) {
            logger.warn('Get chats error:', error.message);
        }

        res.json({
            success: true,
            bot: botStatus,
            whatsapp: whatsappStatus,
            ai: aiProvider,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/bot/qr
 */
router.get('/qr', (req, res, next) => {
    try {
        const botStatus = getBotStatus();

        if (botStatus.ready) {
            return res.json({
                success: false,
                message: 'Bot sudah siap, tidak ada QR code',
                ready: true
            });
        }

        if (!botStatus.qrCode) {
            return res.json({
                success: false,
                message: 'QR code belum digenerate'
            });
        }

        res.json({
            success: true,
            qrCode: botStatus.qrCode,
            message: 'Scan QR code dengan WhatsApp'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/bot/groups
 */
router.get('/groups', async (req, res, next) => {
    try {
        const client = getWhatsAppClient();
        const chats = await client.getChats();
        const groups = chats.filter(c => c.isGroup).map(g => ({
            id: g.id._serialized,
            name: g.name,
            membersCount: g.participants?.length || 0,
            isArchived: g.isArchived
        }));

        res.json({
            success: true,
            count: groups.length,
            groups
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/bot/contacts
 */
router.get('/contacts', async (req, res, next) => {
    try {
        const client = getWhatsAppClient();
        const contacts = await client.getContacts();
        const list = contacts
            .filter(c => !c.isGroup)
            .map(c => ({
                id: c.id._serialized,
                name: c.name || c.pushname || 'Unknown',
                phone: c.number,
                isBlocked: c.isBlocked
            }))
            .slice(0, 100); // Limit to 100

        res.json({
            success: true,
            count: list.length,
            contacts: list
        });
    } catch (error) {
        next(error);
    }
});

export default router;
