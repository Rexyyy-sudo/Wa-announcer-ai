/**
 * Webhook Routes untuk integrasi eksternal
 */

import express from 'express';
import { formatAnnouncement } from '../../services/ai.service.js';
import SendService from '../../services/send.service.js';
import { Announcements } from '../../db/database.js';
import { generateId } from '../../utils/helpers.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * POST /api/webhook/send
 * Send announcement dari eksternal API
 */
router.post('/send', async (req, res, next) => {
    try {
        const { text, targetType, targetId, targetName } = req.body;

        if (!text || !targetType || !targetId) {
            return res.status(400).json({
                success: false,
                message: 'text, targetType, dan targetId wajib diisi'
            });
        }

        // Format announcement
        const formatResult = await formatAnnouncement(text);

        if (!formatResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Format error',
                error: formatResult.error
            });
        }

        // Save to database
        const announcementId = generateId();
        await Announcements.create({
            id: announcementId,
            userId: req.user.userId,
            originalInput: text,
            formattedContent: formatResult.content,
            aiProvider: formatResult.provider,
            formattingTimeMs: formatResult.timeTaken
        });

        // Send
        let sendResult;

        if (targetType === 'group') {
            sendResult = await SendService.sendToGroup(targetId, formatResult.content);
        } else if (targetType === 'personal') {
            sendResult = await SendService.sendToPersonal(targetId, formatResult.content);
        } else {
            return res.status(400).json({
                success: false,
                message: `Target type ${targetType} tidak didukung`
            });
        }

        res.json({
            success: sendResult.success,
            announcementId,
            message: sendResult.success ? 'Pengumuman terkirim' : sendResult.error,
            ...sendResult
        });
    } catch (error) {
        logger.error('Webhook send error:', error);
        next(error);
    }
});

/**
 * POST /api/webhook/broadcast
 * Send broadcast ke multiple targets
 */
router.post('/broadcast', async (req, res, next) => {
    try {
        const { text, recipients } = req.body;

        if (!text || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'text dan recipients (array) wajib diisi'
            });
        }

        // Format announcement
        const formatResult = await formatAnnouncement(text);

        if (!formatResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Format error',
                error: formatResult.error
            });
        }

        // Save to database
        const announcementId = generateId();
        await Announcements.create({
            id: announcementId,
            userId: req.user.userId,
            originalInput: text,
            formattedContent: formatResult.content,
            aiProvider: formatResult.provider,
            formattingTimeMs: formatResult.timeTaken
        });

        // Send broadcast
        const announcement = { ...{}, id: announcementId, formatted_content: formatResult.content };
        const broadcastResult = await SendService.sendBroadcast(announcement, recipients);

        res.json({
            success: broadcastResult.success,
            announcementId,
            ...broadcastResult
        });
    } catch (error) {
        logger.error('Webhook broadcast error:', error);
        next(error);
    }
});

export default router;
