/**
 * Template Routes
 */

import express from 'express';
import { Templates } from '../../db/database.js';
import { generateId } from '../../utils/helpers.js';

const router = express.Router();

/**
 * GET /api/templates
 */
router.get('/', async (req, res, next) => {
    try {
        const templates = await Templates.listByUser(req.user.userId, 100);

        res.json({
            success: true,
            count: templates.length,
            templates
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/templates
 */
router.post('/', async (req, res, next) => {
    try {
        const { name, description, content, category } = req.body;

        if (!name || !content) {
            return res.status(400).json({
                success: false,
                message: 'Name dan content wajib diisi'
            });
        }

        // Check if name exists
        const existing = await Templates.findByUserAndName(req.user.userId, name);
        if (existing) {
            return res.status(400).json({
                success: false,
                message: `Template "${name}" sudah ada`
            });
        }

        const templateId = generateId();
        await Templates.create({
            id: templateId,
            userId: req.user.userId,
            name,
            description,
            content,
            category
        });

        res.status(201).json({
            success: true,
            templateId,
            message: 'Template berhasil disimpan'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/templates/:id
 */
router.get('/:id', async (req, res, next) => {
    try {
        const template = await Templates.findById(req.params.id);

        if (!template || template.user_id !== req.user.userId) {
            return res.status(404).json({
                success: false,
                message: 'Template tidak ditemukan'
            });
        }

        res.json({
            success: true,
            template
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /api/templates/:id
 */
router.put('/:id', async (req, res, next) => {
    try {
        const template = await Templates.findById(req.params.id);

        if (!template || template.user_id !== req.user.userId) {
            return res.status(404).json({
                success: false,
                message: 'Template tidak ditemukan'
            });
        }

        const { name, description, content, category, is_favorite } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (content !== undefined) updates.content = content;
        if (category !== undefined) updates.category = category;
        if (is_favorite !== undefined) updates.is_favorite = is_favorite ? 1 : 0;

        await Templates.update(req.params.id, updates);

        res.json({
            success: true,
            message: 'Template berhasil diupdate'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/templates/:id
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const template = await Templates.findById(req.params.id);

        if (!template || template.user_id !== req.user.userId) {
            return res.status(404).json({
                success: false,
                message: 'Template tidak ditemukan'
            });
        }

        await Templates.delete(req.params.id);

        res.json({
            success: true,
            message: 'Template dihapus'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
