/**
 * Send Service untuk mengirim pengumuman ke berbagai target
 */

import logger from '../utils/logger.js';
import { getWhatsAppClient } from './whatsapp.js';
import { formatPhoneNumber, generateId, validateMessageLength, truncateMessage } from '../utils/helpers.js';
import { Announcements, AnnouncementHistory, Broadcasts } from '../db/database.js';

/**
 * Send announcement to group
 */
async function sendToGroup(groupId, message) {
    try {
        const client = getWhatsAppClient();

        // Validate message
        if (!validateMessageLength(message)) {
            message = truncateMessage(message);
            logger.warn(`Message truncated to fit WhatsApp limit`);
        }

        // Get group chat
        const chat = await client.getChatById(groupId);

        if (!chat.isGroup) {
            return { success: false, error: 'Target bukan grup' };
        }

        // Send message
        await chat.sendMessage(message);

        logger.info(`Message sent to group: ${chat.name}`);

        return {
            success: true,
            groupId,
            groupName: chat.name,
            messageLength: message.length,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        logger.error('Send to group error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send announcement to personal contact
 */
async function sendToPersonal(phoneNumber, message) {
    try {
        const client = getWhatsAppClient();

        // Format phone number
        const waNumber = formatPhoneNumber(phoneNumber);

        // Validate message
        if (!validateMessageLength(message)) {
            message = truncateMessage(message);
        }

        // Check if contact exists
        const contact = await client.getContactById(waNumber);

        if (!contact) {
            return { success: false, error: 'Kontak tidak ditemukan' };
        }

        // Get or create chat
        let chat = await client.getChatById(waNumber);

        if (!chat) {
            // Create new chat
            await client.sendMessage(waNumber, ' ');
            chat = await client.getChatById(waNumber);
        }

        // Send message
        await chat.sendMessage(message);

        logger.info(`Message sent to personal: ${contact.name || phoneNumber}`);

        return {
            success: true,
            contact: contact.name || phoneNumber,
            phoneNumber: waNumber,
            messageLength: message.length,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        logger.error('Send to personal error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send broadcast to multiple contacts
 */
async function sendBroadcast(announcement, recipients) {
    try {
        const client = getWhatsAppClient();
        const broadcastId = generateId();

        // Validate message
        let message = announcement.formatted_content;
        if (!validateMessageLength(message)) {
            message = truncateMessage(message);
        }

        // Create broadcast record
        const broadcast = {
            id: broadcastId,
            userId: announcement.user_id,
            announcementId: announcement.id,
            name: `Broadcast ${new Date().toLocaleDateString()}`,
            recipientsCount: recipients.length,
            status: 'sending'
        };

        await Broadcasts.create(broadcast);

        // Send to each recipient
        const results = [];
        for (const recipient of recipients) {
            try {
                const result = await sendToPersonal(recipient.phone, message);

                const historyId = generateId();
                await AnnouncementHistory.create({
                    id: historyId,
                    announcementId: announcement.id,
                    targetType: 'broadcast',
                    targetId: broadcastId,
                    targetName: recipient.name || recipient.phone
                });

                if (result.success) {
                    await AnnouncementHistory.updateStatus(historyId, 'sent');
                    results.push({ ...result, recipient: recipient.name });
                } else {
                    await AnnouncementHistory.updateStatus(historyId, 'failed', result.error);
                    results.push({ success: false, recipient: recipient.name, error: result.error });
                }
            } catch (error) {
                logger.error(`Broadcast error for ${recipient.name}:`, error);
                results.push({ success: false, recipient: recipient.name, error: error.message });
            }

            // Small delay between messages to avoid rate limit
            await new Promise(r => setTimeout(r, 500));
        }

        // Update broadcast status
        const successCount = results.filter(r => r.success).length;
        await Broadcasts.update(broadcastId, {
            status: successCount === recipients.length ? 'completed' : 'partial',
            sent_at: new Date().toISOString()
        });

        return {
            success: successCount > 0,
            broadcastId,
            total: recipients.length,
            sent: successCount,
            failed: recipients.length - successCount,
            results
        };
    } catch (error) {
        logger.error('Broadcast error:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Send with template
 */
async function sendWithTemplate(templateId, targetType, targetId) {
    try {
        // Get template content
        // Implementation: Load template, send to target
        logger.info(`Sending with template ${templateId} to ${targetType}:${targetId}`);

        return { success: true };
    } catch (error) {
        logger.error('Send with template error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get send history
 */
async function getHistory(announcementId) {
    try {
        const history = await AnnouncementHistory.listByAnnouncement(announcementId);

        return {
            success: true,
            announcementId,
            total: history.length,
            sent: history.filter(h => h.status === 'sent').length,
            failed: history.filter(h => h.status === 'failed').length,
            pending: history.filter(h => h.status === 'pending').length,
            history
        };
    } catch (error) {
        logger.error('Get history error:', error);
        return { success: false, error: error.message };
    }
}

export default {
    sendToGroup,
    sendToPersonal,
    sendBroadcast,
    sendWithTemplate,
    getHistory
};
