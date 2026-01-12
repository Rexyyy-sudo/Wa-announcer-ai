/**
 * Announcement Routes
 */

import express from 'express';
import { formatAnnouncement, validateAnnouncement, extractAnnouncementData } from '../../services/ai.service.js';
import { Announcements, AnnouncementHistory } from '../../db/database.js';
import SendService from '../../services/send.service.js';
import { generateId } from '../../utils/helpers.js';
import logger from '../../utils/logger.js';

const router = express.Router();

/**
 * POST /api/announcements/format
 * Format pengumuman baru
 */
router.post('/format', async (req, res, next) => {
    try {
        const { text, provider } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text pengumuman wajib diisi'
            });
        }

        const result = await formatAnnouncement(text, provider);

        // Save to database
        const announcementId = generateId();
        await Announcements.create({
            id: announcementId,
            userId: req.user.userId,
            originalInput: text,
            formattedContent: result.content,
            aiProvider: result.provider,
            formattingTimeMs: result.timeTaken
        });

        res.json({
            success: true,
            announcementId,
            formattedContent: result.content,
            provider: result.provider,
            timeTaken: result.timeTaken
        });
    } catch (error) {
        logger.error('Format error:', error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * POST /api/announcements/validate
 * Validate pengumuman
 */
router.post('/validate', async (req, res, next) => {
    try {
        const { content, provider } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Content wajib diisi'
            });
        }

        const result = await validateAnnouncement(content, provider);

        res.json({
            success: true,
            valid: result.valid,
            feedback: result.feedback,
            provider: result.provider
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/announcements
 * List pengumuman user
 */
router.get('/', async (req, res, next) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const announcements = await Announcements.listByUser(
            req.user.userId,
            parseInt(limit),
            parseInt(offset)
        );

        res.json({
            success: true,
            count: announcements.length,
            announcements
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/announcements/:id
 * Get pengumuman detail
 */
router.get('/:id', async (req, res, next) => {
    try {
        const announcement = await Announcements.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Pengumuman tidak ditemukan'
            });
        }

        if (announcement.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak'
            });
        }

        // Get send history
        const history = await AnnouncementHistory.listByAnnouncement(announcement.id);

        res.json({
            success: true,
            announcement,
            history,
            stats: {
                total: history.length,
                sent: history.filter(h => h.status === 'sent').length,
                failed: history.filter(h => h.status === 'failed').length,
                pending: history.filter(h => h.status === 'pending').length
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/announcements/:id/send
 * Kirim pengumuman
 */
router.post('/:id/send', async (req, res, next) => {
    try {
        const { targetType, targetId, targetName } = req.body;

        if (!targetType || !targetId) {
            return res.status(400).json({
                success: false,
                message: 'Target type dan target ID wajib diisi'
            });
        }

        const announcement = await Announcements.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Pengumuman tidak ditemukan'
            });
        }

        if (announcement.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak'
            });
        }

        let sendResult;

        if (targetType === 'group') {
            sendResult = await SendService.sendToGroup(targetId, announcement.formatted_content);
        } else if (targetType === 'personal') {
            sendResult = await SendService.sendToPersonal(targetId, announcement.formatted_content);
        } else {
            return res.status(400).json({
                success: false,
                message: `Target type ${targetType} tidak didukung`
            });
        }

        if (sendResult.success) {
            // Record to history
            const historyId = generateId();
            await AnnouncementHistory.create({
                id: historyId,
                announcementId: req.params.id,
                targetType,
                targetId,
                targetName: targetName || 'Unknown'
            });

            await AnnouncementHistory.updateStatus(historyId, 'sent');

            // Update announcement status
            await Announcements.updateStatus(req.params.id, 'sent');
        }

        res.json({
            success: sendResult.success,
            message: sendResult.success ? 'Pengumuman terkirim' : sendResult.error,
            ...sendResult
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/announcements/:id
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const announcement = await Announcements.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: 'Pengumuman tidak ditemukan'
            });
        }

        if (announcement.user_id !== req.user.userId) {
            return res.status(403).json({
                success: false,
                message: 'Akses ditolak'
            });
        }

        await Announcements.delete(req.params.id);

        res.json({
            success: true,
            message: 'Pengumuman dihapus'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
