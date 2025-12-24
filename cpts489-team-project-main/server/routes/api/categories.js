const express = require('express');
const router = express.Router();
const { Board, Category, Note } = require('../../models/associations');

// GET /api/categories - Get all categories (optionally filtered by board)
router.get('/', async (req, res) => {
    try {
        const { boardId } = req.query;

        let categories;
        if (boardId) {
            // Get categories for a specific board
            const board = await Board.findByPk(boardId, {
                include: [{
                    model: Category,
                    include: [{
                        model: Note,
                        attributes: ['id', 'title', 'content']
                    }]
                }]
            });

            if (!board) {
                return res.status(404).json({ error: 'Board not found' });
            }

            categories = board.Categories;
        } else {
            // Get all categories
            categories = await Category.findAll({
                include: [
                    {
                        model: Board,
                        attributes: ['id', 'title']
                    },
                    {
                        model: Note,
                        attributes: ['id', 'title', 'content']
                    }
                ]
            });
        }

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/categories/:id - Get specific category with notes
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, {
            include: [
                {
                    model: Board,
                    attributes: ['id', 'title']
                },
                {
                    model: Note,
                    attributes: ['id', 'title', 'content']
                }
            ]
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category' });
    }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
    try {
        const { title, boardId } = req.body;

        if (!title || !boardId) {
            return res.status(400).json({ error: 'Title and boardId are required' });
        }

        // Check if board exists
        const board = await Board.findByPk(boardId);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const category = await Category.create({
            title,
            BoardId: boardId
        });

        // Fetch the created category with associations
        const createdCategory = await Category.findByPk(category.id, {
            include: [{
                model: Board,
                attributes: ['id', 'title']
            }]
        });

        res.status(201).json(createdCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Failed to create category' });
    }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, boardId } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (boardId !== undefined) {
            // Check if new board exists
            const board = await Board.findByPk(boardId);
            if (!board) {
                return res.status(404).json({ error: 'Board not found' });
            }
            updateData.BoardId = boardId;
        }

        await category.update(updateData);

        // Fetch updated category with associations
        const updatedCategory = await Category.findByPk(id, {
            include: [{
                model: Board,
                attributes: ['id', 'title']
            }]
        });

        res.json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
    }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        await category.destroy();
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Failed to delete category' });
    }
});

// GET /api/categories/:id/notes - Get notes for a specific category
router.get('/:id/notes', async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findByPk(id, {
            include: [{
                model: Note,
                attributes: ['id', 'title', 'content']
            }]
        });

        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.json(category.Notes);
    } catch (error) {
        console.error('Error fetching category notes:', error);
        res.status(500).json({ error: 'Failed to fetch category notes' });
    }
});

module.exports = router;
