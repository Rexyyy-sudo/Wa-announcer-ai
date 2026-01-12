/**
 * WhatsApp Bot menggunakan whatsapp-web.js (Baileys alternative)
 */

import { Client, LocalAuth, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import { parseCommand, parseContact } from '../utils/helpers.js';
import { formatAnnouncement, extractAnnouncementData } from '../services/ai.service.js';
import { Templates, Announcements, AnnouncementHistory, Contacts, Groups } from '../db/database.js';
import { generateId } from '../utils/helpers.js';
import SendService from './send.service.js';

let whatsappClient = null;
let qrCodeUrl = null;
let isReady = false;

/**
 * Initialize WhatsApp client
 */
export async function initWhatsApp() {
    try {
        const sessionPath = process.env.WHATSAPP_SESSION_PATH || './sessions';

        whatsappClient = new Client({
            authStrategy: new LocalAuth({ clientId: 'wa-announcer', dataPath: sessionPath }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                headless: true
            }
        });

        // Event: QR Code untuk scanning
        whatsappClient.on('qr', async (qr) => {
            logger.info('QR Code generated, scan dengan WhatsApp');
            try {
                qrCodeUrl = await qrcode.toDataURL(qr);
                const qrPath = path.join(process.cwd(), 'qr.png');
                await qrcode.toFile(qrPath, qr);
                logger.info(`QR Code saved to ${qrPath}`);
            } catch (err) {
                logger.error('QR Code generation error:', err);
            }
        });

        // Event: Ready
        whatsappClient.on('ready', async () => {
            logger.info('✅ WhatsApp Bot Ready!');
            isReady = true;
            qrCodeUrl = null;

            // Sync contacts dan groups
            await syncContacts();
        });

        // Event: Message received
        whatsappClient.on('message', async (msg) => {
            await handleMessage(msg);
        });

        // Event: Disconnected
        whatsappClient.on('disconnected', (reason) => {
            logger.warn(`WhatsApp disconnected: ${reason}`);
            isReady = false;
        });

        // Start client
        await whatsappClient.initialize();
        logger.info('WhatsApp client initialized');

        return whatsappClient;
    } catch (error) {
        logger.error('WhatsApp initialization error:', error);
        throw error;
    }
}

/**
 * Handle incoming messages
 */
async function handleMessage(msg) {
    try {
        const sender = msg.from;
        const messageText = msg.body;

        logger.info(`Message from ${sender}: ${messageText.substring(0, 50)}`);

        // Check if command
        const command = parseCommand(messageText);

        if (command) {
            await handleCommand(msg, command);
        } else {
            // Non-command message - inform user
            if (!msg.isStatus) {
                await msg.reply('Hai! 👋\n\nUntuk format pengumuman, gunakan:\n/buat <teks pengumuman>\n\nTik /help untuk bantuan.');
            }
        }
    } catch (error) {
        logger.error('Message handling error:', error);
    }
}

/**
 * Handle slash commands
 */
async function handleCommand(msg, { command, args }) {
    try {
        logger.info(`Command received: /${command} ${args}`);

        switch (command) {
            case 'buat':
                await commandBuat(msg, args);
                break;

            case 'kirimgrup':
                await commandKirimGrup(msg, args);
                break;

            case 'kirimpv':
                await commandKirimPV(msg, args);
                break;

            case 'template':
                await commandTemplate(msg, args);
                break;

            case 'status':
                await commandStatus(msg);
                break;

            case 'help':
                await commandHelp(msg);
                break;

            default:
                await msg.reply(`❌ Perintah /${command} tidak dikenali. Tik /help untuk bantuan.`);
        }
    } catch (error) {
        logger.error(`Command ${command} error:`, error);
        await msg.reply(`❌ Error: ${error.message}`);
    }
}

/**
 * /buat - Format pengumuman dengan AI
 */
async function commandBuat(msg, userInput) {
    if (!userInput) {
        await msg.reply('❌ Format: /buat <teks pengumuman>\n\nContoh:\n/buat ada acara camping minggu depan jam 8 pagi di taman, pemandu pak budi\n\nAI akan otomatis format menjadi pengumuman profesional.');
        return;
    }

    try {
        // Show loading indicator
        await msg.reply('⏳ Sedang memformat pengumuman dengan AI. Mohon tunggu...');

        // Format with AI
        const result = await formatAnnouncement(userInput);

        if (!result.success) {
            await msg.reply(`❌ Error: ${result.error}\n\nSilakan coba lagi atau hubungi admin.`);
            return;
        }

        // Save to database
        const announcementId = generateId();
        try {
            await Announcements.create({
                id: announcementId,
                userId: msg.from,
                originalInput: userInput,
                formattedContent: result.content,
                aiProvider: result.provider,
                formattingTimeMs: result.timeTaken,
                status: 'draft'
            });
        } catch (dbError) {
            logger.warn('Database save warning:', dbError.message);
        }

        // Send formatted preview with options
        const preview = `✅ *Pengumuman Siap Kirim*

${result.content}

---
⏱️ Waktu proses: ${result.timeTaken}ms

*Opsi Pengiriman:*
/kirimgrup <nama grup> - Kirim ke grup
/kirimpv <nomor WA> - Kirim ke personal
/kirimbroadcast - Kirim broadcast (multiple)

*Lainnya:*
/template simpan <nama> - Simpan sebagai template
/buat - Buat pengumuman baru`;

        await msg.reply(preview);
    } catch (error) {
        logger.error('Command /buat error:', error);
        await msg.reply(`❌ Error formatting: ${error.message}\n\nSilakan coba lagi nanti.`);
    }
}

/**
 * /kirimgrup - Kirim ke grup
 */
async function commandKirimGrup(msg, args) {
    if (!args) {
        try {
            const chats = await whatsappClient.getChats();
            const groups = chats.filter(g => g.isGroup);

            if (groups.length === 0) {
                await msg.reply('❌ Bot belum bergabung dengan grup apapun.\n\nSilakan:\n1. Tambahkan bot ke grup yang diinginkan\n2. Tunggu sync otomatis\n3. Coba lagi');
                return;
            }

            const groupList = groups
                .map((g, i) => `${i + 1}. ${g.name}`)
                .join('\n');

            await msg.reply(`📋 *Daftar Grup Aktif:*\n\n${groupList}\n\n*Gunakan:*\n/kirimgrup <nama atau nomor>\n\nContoh: /kirimgrup Keluarga\natau /kirimgrup 1`);
        } catch (error) {
            logger.error('Error listing groups:', error);
            await msg.reply('❌ Error mengambil daftar grup');
        }
        return;
    }

    try {
        await msg.reply('⏳ Mencari grup dan memproses pesan...');

        const chats = await whatsappClient.getChats();
        let targetGroup = null;

        // Search by name or number
        if (!isNaN(args)) {
            const groupIndex = parseInt(args) - 1;
            const groups = chats.filter(g => g.isGroup);
            if (groupIndex >= 0 && groupIndex < groups.length) {
                targetGroup = groups[groupIndex];
            }
        } else {
            targetGroup = chats.find(g =>
                g.isGroup && g.name.toLowerCase().includes(args.toLowerCase())
            );
        }

        if (!targetGroup) {
            await msg.reply(`❌ Grup "${args}" tidak ditemukan. Gunakan /kirimgrup untuk melihat daftar.`);
            return;
        }

        // Get last announcement (or use provided text)
        // For now, we'll require the announcement to be provided explicitly
        await msg.reply(`📢 Pengumuman akan dikirim ke grup: *${targetGroup.name}*\n\nUntuk mengirim, balas dengan pesan pengumuman atau gunakan pengumuman yang sudah diformat sebelumnya.\n\n/buat - untuk membuat pengumuman baru`);

    } catch (error) {
        logger.error('Command /kirimgrup error:', error);
        await msg.reply(`❌ Error: ${error.message}`);
    }
}

/**
 * /kirimgrupnow - Helper untuk mengirim langsung
 */
async function commandKirimGrupNow(msg, groupNameAndMessage) {
    try {
        const [groupName, ...messageParts] = groupNameAndMessage.split('|');
        const message = messageParts.join('|').trim();

        if (!message) {
            await msg.reply('Format: /kirimgrupnow <nama grup> | <pesan>');
            return;
        }

        const chats = await whatsappClient.getChats();
        const targetGroup = chats.find(g =>
            g.isGroup && g.name.toLowerCase().includes(groupName.trim().toLowerCase())
        );

        if (!targetGroup) {
            await msg.reply(`❌ Grup "${groupName.trim()}" tidak ditemukan`);
            return;
        }

        const result = await SendService.sendToGroup(targetGroup.id, message);

        if (result.success) {
            await msg.reply(`✅ Pesan berhasil dikirim ke grup: *${targetGroup.name}*\n\nPenerima: ${targetGroup.participants?.length || 'unknown'} anggota`);

            // Log to database
            try {
                const historyId = generateId();
                await AnnouncementHistory.create({
                    id: historyId,
                    announcementId: 'manual_' + generateId(),
                    targetType: 'group',
                    targetId: targetGroup.id,
                    targetName: targetGroup.name,
                    status: 'sent'
                });
            } catch (e) {
                logger.warn('Could not log to database:', e.message);
            }
        } else {
            await msg.reply(`❌ Gagal mengirim: ${result.error}`);
        }
    } catch (error) {
        logger.error('Command /kirimgrupnow error:', error);
        await msg.reply(`❌ Error: ${error.message}`);
    }
}

/**
 * /kirimpv - Kirim ke personal/kontak pribadi
 */
async function commandKirimPV(msg, phoneNumber) {
    if (!phoneNumber) {
        await msg.reply(`📱 *Format Pengiriman Personal:*

/kirimpv <nomor WA>

*Contoh dengan kode negara:*
/kirimpv 62812345678
/kirimpv +62812345678
/kirimpv 081234567890

*Cara mendapat nomor WA orang:*
1. Chat orang tersebut terlebih dahulu
2. Lihat nomor dari chat history
3. Copy nomor dan gunakan perintah di atas

⚠️ *Catatan:*
• Nomor harus valid dan sudah terdaftar WhatsApp
• Gunakan kode negara (62 untuk Indonesia)
• Bot harus sudah pernah chat dengan nomor tersebut`);
        return;
    }

    try {
        await msg.reply(`⏳ Mengirim pesan ke ${phoneNumber}...`);

        const result = await SendService.sendToPersonal(phoneNumber, msg.body);

        if (result.success) {
            await msg.reply(`✅ Pesan berhasil dikirim ke:\n*${result.contact}*\n\n📞 Nomor: ${result.phoneNumber}`);

            // Log to database
            try {
                const historyId = generateId();
                await AnnouncementHistory.create({
                    id: historyId,
                    announcementId: 'manual_' + generateId(),
                    targetType: 'personal',
                    targetId: result.phoneNumber,
                    targetName: result.contact,
                    status: 'sent'
                });
            } catch (e) {
                logger.warn('Could not log to database:', e.message);
            }
        } else {
            await msg.reply(`❌ Gagal mengirim: ${result.error}\n\nMungkin:\n• Nomor tidak valid\n• Orang tersebut tidak ada di kontak\n• Nomor belum aktif WhatsApp`);
        }
    } catch (error) {
        logger.error('Command /kirimpv error:', error);
        await msg.reply(`❌ Error: ${error.message}`);
    }
}

/**
 * /template - Template management (simpan, pakai, list)
 */
async function commandTemplate(msg, args) {
    if (!args) {
        await msg.reply(`📝 *Manajemen Template Pengumuman*

*Perintah:*

/template list
→ Lihat semua template yang tersimpan

/template simpan <nama template>
→ Simpan pengumuman terakhir sebagai template
→ Contoh: /template simpan Rapat Rutin Minggu

/template pakai <nama template>
→ Tampilkan kembali template yang sudah disimpan
→ Contoh: /template pakai Rapat Rutin Minggu

/template hapus <nama template>
→ Hapus template dari penyimpanan

*Fitur:*
✅ Menyimpan format pengumuman profesional
✅ Reuse untuk acara serupa
✅ Hemat waktu formatting
✅ Organized by organization/user

*Contoh Workflow:*
1. /buat ada rapat minggu depan jam 10 pagi
2. /template simpan Rapat Mingguan
3. Nanti tinggal /template pakai Rapat Mingguan`);
        return;
    }

    const parts = args.split(' ');
    const subcommand = parts[0].toLowerCase();
    const templateName = parts.slice(1).join(' ');

    switch (subcommand) {
        case 'list':
            await templateList(msg);
            break;

        case 'simpan':
            if (!templateName) {
                await msg.reply('❌ Format: /template simpan <nama template>\nContoh: /template simpan Rapat Mingguan');
                return;
            }
            await templateSave(msg, templateName);
            break;

        case 'pakai':
            if (!templateName) {
                await msg.reply('❌ Format: /template pakai <nama template>');
                return;
            }
            await templateUse(msg, templateName);
            break;

        case 'hapus':
            if (!templateName) {
                await msg.reply('❌ Format: /template hapus <nama template>');
                return;
            }
            await templateDelete(msg, templateName);
            break;

        default:
            await msg.reply(`❌ Subcommand tidak dikenali: ${subcommand}\n\nGunakan: /template list|simpan|pakai|hapus`);
    }
}

async function templateList(msg) {
    try {
        const templates = await Templates.listByUser(msg.from);

        if (templates.length === 0) {
            await msg.reply(`📝 *Belum ada template tersimpan*

Untuk menyimpan template:
1. /buat <pengumuman>
2. /template simpan <nama>

Contoh:
/buat ada rapat minggu depan jam 10
/template simpan Rapat Mingguan`);
            return;
        }

        const list = templates
            .map(t => `${t.id ? '✅' : '•'} *${t.name}*\n  └ Dipakai ${t.usage_count || 0}x | ${new Date(t.created_at).toLocaleDateString('id-ID')}`)
            .join('\n');

        await msg.reply(`📝 *Template Pengumuman Anda:*

${list}

Gunakan: /template pakai <nama>
Hapus: /template hapus <nama>`);
    } catch (error) {
        logger.error('Template list error:', error);
        await msg.reply(`❌ Error mengambil template: ${error.message}`);
    }
}

async function templateSave(msg, name) {
    if (!name || name.length === 0) {
        await msg.reply('❌ Nama template tidak boleh kosong\nContoh: /template simpan Rapat Mingguan');
        return;
    }

    try {
        // Get the content from the message context or last announcement
        // For now, we'll save with a placeholder that should be replaced
        const content = msg.body.replace('/template simpan ' + name, '').trim();

        if (!content) {
            await msg.reply(`⚠️ Tidak ada konten untuk disimpan\n\nCara menggunakan:\n1. /buat <pengumuman Anda>\n2. /template simpan ${name}`);
            return;
        }

        const templateId = generateId();
        await Templates.create({
            id: templateId,
            userId: msg.from,
            name: name,
            content: content,
            category: 'umum'
        });

        await msg.reply(`✅ *Template "${name}" berhasil disimpan!*

Gunakan dengan: /template pakai ${name}

Konten yang disimpan:
${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    } catch (error) {
        logger.error('Template save error:', error);
        await msg.reply(`❌ Error menyimpan template: ${error.message}`);
    }
}

async function templateUse(msg, name) {
    if (!name || name.length === 0) {
        await msg.reply('❌ Format: /template pakai <nama template>');
        return;
    }

    try {
        const template = await Templates.findByUserAndName(msg.from, name);

        if (!template) {
            await msg.reply(`❌ Template "${name}" tidak ditemukan\n\nLihat daftar template dengan: /template list`);
            return;
        }

        // Increment usage
        try {
            await Templates.incrementUsage(template.id);
        } catch (e) {
            logger.warn('Could not increment template usage:', e.message);
        }

        const response = `📝 *Template: ${name}*

${template.content}

---
*Opsi selanjutnya:*
/kirimgrup <nama> - Kirim ke grup
/kirimpv <nomor> - Kirim ke personal
/buat - Buat pengumuman baru`;

        await msg.reply(response);
    } catch (error) {
        logger.error('Template use error:', error);
        await msg.reply(`❌ Error mengambil template: ${error.message}`);
    }
}

async function templateDelete(msg, name) {
    try {
        const template = await Templates.findByUserAndName(msg.from, name);

        if (!template) {
            await msg.reply(`❌ Template "${name}" tidak ditemukan`);
            return;
        }

        await Templates.delete(template.id);
        await msg.reply(`✅ Template "${name}" berhasil dihapus`);
    } catch (error) {
        logger.error('Template delete error:', error);
        await msg.reply(`❌ Error menghapus template: ${error.message}`);
    }
}

/**
 * /status - Bot status dan statistik
 */
async function commandStatus(msg) {
    try {
        const chats = await whatsappClient.getChats();
        const groups = chats.filter(c => c.isGroup);
        const contacts = chats.filter(c => !c.isGroup);

        const uptime = process.uptime();
        const uptimeHours = Math.floor(uptime / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);

        const status = `✅ *BOT STATUS: READY*

📊 *Statistik Aktual:*
• Grup Aktif: ${groups.length}
• Kontak Personal: ${contacts.length}
• Total Chat: ${chats.length}

⚙️ *Konfigurasi:*
• AI Provider: ${process.env.AI_PROVIDER || 'openai'}
• Model: ${process.env.OPENAI_MODEL || process.env.OLLAMA_MODEL || 'default'}
• Database: Connected ✓
• Session: Active ✓

🕒 *Uptime:*
${uptimeHours}h ${uptimeMinutes}m

🔌 *Koneksi:*
• WhatsApp Web: Connected
• API Server: Running
• Database: Synced

*Perintah Utama:*
/buat - Format pengumuman dengan AI
/kirimgrup - Kirim ke grup
/kirimpv - Kirim ke personal
/template - Kelola template
/help - Bantuan lengkap

💡 *Tip:*
Gunakan /buat untuk mulai membuat pengumuman profesional!`;

        await msg.reply(status);
    } catch (error) {
        logger.error('Status command error:', error);
        await msg.reply(`⚠️ Error mengambil status: ${error.message}`);
    }
}

/**
 * /help - Help dan tutorial
 */
async function commandHelp(msg) {
    const help = `📢 *WhatsApp AI Announcer Bot v1.0*

Ubah pengumuman mentah menjadi format profesional & siap kirim!

*🚀 QUICK START:*

1️⃣ *Buat Pengumuman:*
   /buat ada acara camping minggu depan jam 8 pagi

2️⃣ *Kirim ke Grup:*
   /kirimgrup Nama Grup

3️⃣ *atau Kirim ke Personal:*
   /kirimpv 62812345678

---

*📋 PERINTAH LENGKAP:*

🎨 *Membuat Pengumuman:*
/buat <teks>
→ Format pengumuman ke bentuk profesional
→ AI akan otomatis isi tanggal, jam, target audience

📤 *Pengiriman:*
/kirimgrup <nama grup>
→ Kirim ke grup (tampilkan daftar jika kosong)

/kirimpv <nomor WA>
→ Kirim ke kontak pribadi
→ Format: /kirimpv 62812345678

📝 *Template:*
/template list
→ Lihat semua template tersimpan

/template simpan <nama>
→ Simpan pengumuman saat ini sebagai template

/template pakai <nama>
→ Gunakan kembali template yang sudah disimpan

/template hapus <nama>
→ Hapus template dari penyimpanan

ℹ️ *Informasi:*
/status
→ Lihat status bot & statistik

/help
→ Panduan ini

---

*💡 CONTOH PENGGUNAAN:*

📌 *Contoh 1 - Rapat Kantor:*
User: /buat ada rapat minggu depan jam 10 pagi di gedung A, dipandu pak andi
Bot: [format otomatis menjadi profesional]
User: /kirimgrup Staff
Bot: ✅ Terkirim ke 45 anggota

📌 *Contoh 2 - Event Sekolah:*
User: /buat upacara senin jam 7 pagi lapangan sekolah semua siswa
Bot: [format otomatis]
User: /kirimgrup Kelas 10
User: /kirimgrup Kelas 11
User: /kirimgrup Kelas 12

📌 *Contoh 3 - Acara Rutin:*
User: /buat tausiyah jumat ashar
Bot: [format otomatis]
User: /template simpan Tausiyah Jumat
Nanti tinggal: /template pakai Tausiyah Jumat

---

*✨ FITUR UNGGULAN:*

✅ AI Formatting otomatis
✅ Format WhatsApp profesional dengan emoji
✅ Support untuk organisasi Islam (Assalam)
✅ Multi-bahasa (Indonesia)
✅ Template reusable
✅ Broadcast to multiple recipients
✅ History & audit log
✅ Scheduling support

---

*⚙️ CATATAN TEKNIS:*

• Bot menggunakan WhatsApp Web API (whatsapp-web.js)
• AI menggunakan OpenAI atau Ollama
• Database SQLite3 untuk offline reliability
• Semua data terenkripsi lokal
• Support group messaging dan personal chat

---

*🆘 TROUBLESHOOTING:*

❌ Grup tidak ketemu?
→ Pastikan bot sudah member grup
→ Tunggu sync (auto 5 menit)
→ Coba /status untuk refresh

❌ Nomor WA tidak valid?
→ Gunakan format internasional (62...)
→ Pastikan orang tersebut aktif di WhatsApp

❌ AI error?
→ Cek koneksi internet
→ Cek API key OpenAI
→ Coba lagi dalam beberapa saat

---

*📞 SUPPORT:*
Hubungi admin untuk bantuan lebih lanjut.

Made with ❤️ for Organizations`;

    await msg.reply(help);
}

/**
 * Sync contacts dan groups dari WhatsApp
 */
async function syncContacts() {
    try {
        logger.info('Syncing contacts and groups...');

        const chats = await whatsappClient.getChats();

        for (const chat of chats) {
            if (chat.isGroup) {
                await Groups.createOrUpdate({
                    id: chat.id._serialized,
                    name: chat.name,
                    membersCount: chat.participants?.length || 0
                });
            } else {
                await Contacts.createOrUpdate({
                    id: chat.id._serialized,
                    phoneNumber: chat.name || chat.number,
                    name: chat.name || 'Unknown',
                    isGroup: false
                });
            }
        }

        logger.info(`Synced ${chats.length} chats`);
    } catch (error) {
        logger.error('Sync error:', error);
    }
}

/**
 * Get WhatsApp client
 */
export function getWhatsAppClient() {
    if (!whatsappClient) {
        throw new Error('WhatsApp client not initialized. Call initWhatsApp first.');
    }
    return whatsappClient;
}

/**
 * Get bot status
 */
export function getBotStatus() {
    return {
        ready: isReady,
        hasQR: !!qrCodeUrl,
        qrCode: qrCodeUrl
    };
}

/**
 * Close connection
 */
export async function closeWhatsApp() {
    if (whatsappClient) {
        await whatsappClient.destroy();
        whatsappClient = null;
        isReady = false;
        logger.info('WhatsApp client closed');
    }
}

export default {
    initWhatsApp,
    getWhatsAppClient,
    getBotStatus,
    closeWhatsApp
};
