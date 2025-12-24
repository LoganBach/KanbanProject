const express = require('express');
const router = express.Router();
const { Category, Note, Board } = require('../../models/associations');

// GET /api/notes - Get all notes (optionally filtered by category)
router.get('/', async (req, res) => {
    try {
        const { categoryId } = req.query;

        let notes;
        if (categoryId) {
            // Get notes for a specific category
            const category = await Category.findByPk(categoryId, {
                include: [{
                    model: Note,
                    attributes: ['id', 'title', 'content']
                }]
            });

            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }

            notes = category.Notes;
        } else {
            // Get all notes
            notes = await Note.findAll({
                include: [{
                    model: Category,
                    attributes: ['id', 'title'],
                    include: [{
                        model: Board,
                        attributes: ['id', 'title']
                    }]
                }]
            });
        }

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// GET /api/notes/:id - Get specific note
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findByPk(id, {
            include: [{
                model: Category,
                attributes: ['id', 'title'],
                include: [{
                    model: Board,
                    attributes: ['id', 'title']
                }]
            }]
        });

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json(note);
    } catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});

// POST /api/notes - Create new note
router.post('/', async (req, res) => {
    try {
        const { title, content, categoryId } = req.body;

        if (!title || !content || !categoryId) {
            return res.status(400).json({ error: 'Title, content, and categoryId are required' });
        }

        // Check if category exists
        const category = await Category.findByPk(categoryId);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const note = await Note.create({
            title,
            content,
            CategoryId: categoryId
        });

        // Fetch the created note with associations
        const createdNote = await Note.findByPk(note.id, {
            include: [{
                model: Category,
                attributes: ['id', 'title'],
                include: [{
                    model: Board,
                    attributes: ['id', 'title']
                }]
            }]
        });

        res.status(201).json(createdNote);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// PUT /api/notes/:id - Update note
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, categoryId } = req.body;

        const note = await Note.findByPk(id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (categoryId !== undefined) {
            // Check if new category exists
            const category = await Category.findByPk(categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            updateData.CategoryId = categoryId;
        }

        await note.update(updateData);

        // Fetch updated note with associations
        const updatedNote = await Note.findByPk(id, {
            include: [{
                model: Category,
                attributes: ['id', 'title'],
                include: [{
                    model: Board,
                    attributes: ['id', 'title']
                }]
            }]
        });

        res.json(updatedNote);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const note = await Note.findByPk(id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        await note.destroy();
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// PATCH /api/notes/:id - Partially update note (for quick edits)
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const note = await Note.findByPk(id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Only update fields that are provided
        const allowedFields = ['title', 'content'];
        const updateData = {};

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                updateData[field] = updates[field];
            }
        }

        if (updates.categoryId !== undefined) {
            // Check if new category exists
            const category = await Category.findByPk(updates.categoryId);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            updateData.CategoryId = updates.categoryId;
        }

        await note.update(updateData);

        // Fetch updated note with associations
        const updatedNote = await Note.findByPk(id, {
            include: [{
                model: Category,
                attributes: ['id', 'title'],
                include: [{
                    model: Board,
                    attributes: ['id', 'title']
                }]
            }]
        });

        res.json(updatedNote);
    } catch (error) {
        console.error('Error partially updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

module.exports = router;
