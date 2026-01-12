/**
 * Utility functions
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate UUID
 */
export function generateId() {
    return uuidv4();
}

/**
 * Format phone number untuk WhatsApp
 */
export function formatPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // If starts with 62 (Indonesia), use as is
    if (cleaned.startsWith('62')) {
        return cleaned + '@c.us';
    }

    // If starts with 0 (Indonesia), replace with 62
    if (cleaned.startsWith('0')) {
        cleaned = '62' + cleaned.substring(1);
    }

    return cleaned + '@c.us';
}

/**
 * Check if contact is group
 */
export function isGroupId(id) {
    return id.includes('-');
}

/**
 * Parse WhatsApp contact
 */
export function parseContact(contact) {
    return {
        id: contact.id._serialized,
        name: contact.name || contact.pushname || 'Unknown',
        phone: contact.number || null,
        isGroup: contact.isGroup || false,
        profilePicture: contact.profilePicUrl || null
    };
}

/**
 * Format date untuk pengumuman
 */
export function formatDateForAnnouncement(date) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const d = new Date(date);
    const day = days[d.getDay()];
    const dateNum = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day}, ${dateNum} ${month} ${year}`;
}

/**
 * Format time untuk pengumuman
 */
export function formatTimeForAnnouncement(time, timezone = 'WIB') {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes} ${timezone}`;
}

/**
 * Parse announcement content untuk extract data
 */
export function parseAnnouncementStructure(content) {
    const structure = {
        kegiatan: null,
        tanggal: null,
        waktu: null,
        tempat: null,
        pemateri: null,
        tambahan: []
    };

    // Simple regex patterns untuk parse
    const activityMatch = content.match(/📝\s*Kegiatan:\s*(.+?)(?=\n|�)/i);
    const dateMatch = content.match(/📅\s*Hari\/Tanggal:\s*(.+?)(?=\n|⏰)/i);
    const timeMatch = content.match(/⏰\s*Waktu:\s*(.+?)(?=\n|�)/i);
    const locationMatch = content.match(/📍\s*Tempat:\s*(.+?)(?=\n|🎤)/i);
    const coordinatorMatch = content.match(/🎤\s*Pemateri\/PJ:\s*(.+?)(?=\n|�)/i);

    if (activityMatch) structure.kegiatan = activityMatch[1].trim();
    if (dateMatch) structure.tanggal = dateMatch[1].trim();
    if (timeMatch) structure.waktu = timeMatch[1].trim();
    if (locationMatch) structure.tempat = locationMatch[1].trim();
    if (coordinatorMatch) structure.pemateri = coordinatorMatch[1].trim();

    return structure;
}

/**
 * Validate email
 */
export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone) {
    // Indonesia format: 62xxx or 0xxx
    const re = /^(0|62)[0-9]{7,12}$/;
    return re.test(phone.replace(/\D/g, ''));
}

/**
 * Validate WhatsApp message length
 */
export function validateMessageLength(message) {
    // WhatsApp limit ~4096 characters
    return message.length <= 4096;
}

/**
 * Truncate message if too long
 */
export function truncateMessage(message, maxLength = 4000) {
    if (message.length <= maxLength) return message;

    return message.substring(0, maxLength - 3) + '...';
}

/**
 * Escape special chars untuk database
 */
export function escapeSQL(str) {
    return str.replace(/'/g, "''");
}

/**
 * Sleep function
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function
 */
export async function retry(fn, maxAttempts = 3, delayMs = 1000) {
    let lastError;

    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (i < maxAttempts - 1) {
                await sleep(delayMs * (i + 1));
            }
        }
    }

    throw lastError;
}

/**
 * Parse command dari message
 */
export function parseCommand(message) {
    const trimmed = message.trim();

    if (!trimmed.startsWith('/')) {
        return null;
    }

    const parts = trimmed.split(/\s+/);
    const command = parts[0].substring(1).toLowerCase();
    const args = parts.slice(1).join(' ');

    return { command, args };
}

/**
 * Generate announcement preview
 */
export function generatePreview(content, maxLength = 150) {
    const cleaned = content.replace(/[📢*]/g, '').trim();
    if (cleaned.length <= maxLength) return cleaned;

    return cleaned.substring(0, maxLength) + '...';
}

export default {
    generateId,
    formatPhoneNumber,
    isGroupId,
    parseContact,
    formatDateForAnnouncement,
    formatTimeForAnnouncement,
    parseAnnouncementStructure,
    validateEmail,
    validatePhoneNumber,
    validateMessageLength,
    truncateMessage,
    escapeSQL,
    sleep,
    retry,
    parseCommand,
    generatePreview
};
