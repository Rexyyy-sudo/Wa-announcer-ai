/**
 * AI Service untuk format pengumuman menggunakan OpenAI atau Ollama
 */

import axios from 'axios';
import { getAnnouncementPrompt, getValidatorPrompt, getExtractionPrompt } from '../prompts/announcement.prompt.js';
import logger from '../utils/logger.js';

const PROVIDER = process.env.AI_PROVIDER || 'openai';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral';

/**
 * Format pengumuman menggunakan AI
 */
export async function formatAnnouncement(userInput, customProvider = null) {
    const startTime = Date.now();
    const provider = customProvider || PROVIDER;

    try {
        logger.info(`[AI] Formatting announcement with ${provider}`);

        const prompt = getAnnouncementPrompt(userInput);
        let formattedContent;

        if (provider === 'openai') {
            formattedContent = await formatWithOpenAI(prompt);
        } else if (provider === 'ollama') {
            formattedContent = await formatWithOllama(prompt);
        } else {
            throw new Error(`Unsupported provider: ${provider}`);
        }

        const timeTaken = Date.now() - startTime;
        logger.info(`[AI] Formatting completed in ${timeTaken}ms`);

        return {
            provider,
            content: formattedContent.trim(),
            timeTaken,
            success: true
        };
    } catch (error) {
        logger.error(`[AI] Formatting error:`, error.message);
        throw error;
    }
}

/**
 * Format dengan OpenAI
 */
async function formatWithOpenAI(prompt) {
    if (!OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY not configured');
    }

    const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
            model: OPENAI_MODEL,
            messages: [
                { role: 'system', content: 'Anda adalah AI assistant profesional untuk format pengumuman organisasi Indonesia.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 0.95
        },
        {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        }
    );

    return response.data.choices[0].message.content;
}

/**
 * Format dengan Ollama (Local LLM)
 */
async function formatWithOllama(prompt) {
    try {
        const response = await axios.post(
            `${OLLAMA_API_URL}/api/generate`,
            {
                model: OLLAMA_MODEL,
                prompt: prompt,
                stream: false,
                temperature: 0.7
            },
            {
                timeout: 60000
            }
        );

        return response.data.response;
    } catch (error) {
        logger.error('Ollama connection error:', error.message);
        throw new Error(`Ollama service error: ${error.message}. Pastikan Ollama running di ${OLLAMA_API_URL}`);
    }
}

/**
 * Validate formatted announcement
 */
export async function validateAnnouncement(announcement, customProvider = null) {
    const provider = customProvider || PROVIDER;

    try {
        const prompt = getValidatorPrompt(announcement);
        let validation;

        if (provider === 'openai') {
            validation = await formatWithOpenAI(prompt);
        } else if (provider === 'ollama') {
            validation = await formatWithOllama(prompt);
        } else {
            return { valid: true, message: 'Tidak ada provider untuk validasi' };
        }

        const isApproved = validation.includes('✅ APPROVED');

        return {
            valid: isApproved,
            feedback: validation,
            provider
        };
    } catch (error) {
        logger.warn('Validation error, skip:', error.message);
        // Return true jika validation gagal, jangan block pengiriman
        return { valid: true, feedback: 'Validasi dilewati karena error', provider };
    }
}

/**
 * Extract data struktural dari pengumuman
 */
export async function extractAnnouncementData(userInput, customProvider = null) {
    const provider = customProvider || PROVIDER;

    try {
        logger.info('[AI] Extracting announcement data');

        const prompt = getExtractionPrompt(userInput);
        let jsonResponse;

        if (provider === 'openai') {
            jsonResponse = await formatWithOpenAI(prompt);
        } else if (provider === 'ollama') {
            jsonResponse = await formatWithOllama(prompt);
        } else {
            return null;
        }

        // Parse JSON response
        const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            logger.warn('[AI] No JSON found in response');
            return null;
        }

        const data = JSON.parse(jsonMatch[0]);
        logger.info('[AI] Extraction successful');

        return data;
    } catch (error) {
        logger.error('[AI] Extraction error:', error.message);
        return null; // Return null, jangan throw
    }
}

/**
 * Check if AI provider is available
 */
export async function checkProviderAvailability(provider = PROVIDER) {
    try {
        if (provider === 'openai') {
            if (!OPENAI_API_KEY) {
                return { available: false, message: 'OPENAI_API_KEY not configured' };
            }
            return { available: true, message: 'OpenAI API available' };
        } else if (provider === 'ollama') {
            const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, { timeout: 5000 });
            return { available: true, message: `Ollama available with ${response.data.models?.length || 0} models` };
        }
        return { available: false, message: `Unknown provider: ${provider}` };
    } catch (error) {
        return { available: false, message: `Provider error: ${error.message}` };
    }
}

export default {
    formatAnnouncement,
    validateAnnouncement,
    extractAnnouncementData,
    checkProviderAvailability
};
