const express = require('express');
const router = express.Router();
const { User, Board, Category, Note } = require('../../models/associations');

// GET /api/boards - Get all boards (or boards for a specific user if query param provided)
router.get('/', async (req, res) => {
    try {
        const { username } = req.query;

        let boards;
        if (username) {
            // Get boards for a specific user
            const user = await User.findByPk(username, {
                include: [{
                    model: Board,
                    attributes: ['id', 'title'],
                    through: { attributes: ['owns_board'] },
                    include: [{
                        model: Category,
                        attributes: ['id', 'title']
                    }]
                }]
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            boards = user.Boards;
        } else {
            // Get all boards
            boards = await Board.findAll({
                include: [
                    {
                        model: User,
                        attributes: ['username'],
                        through: { attributes: ['owns_board'] }
                    },
                    {
                        model: Category,
                        attributes: ['id', 'title']
                    }
                ]
            });
        }

        res.json(boards);
    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
});

// GET /api/boards/:id - Get specific board with categories and notes
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const board = await Board.findByPk(id, {
            include: [
                {
                    model: User,
                    attributes: ['username'],
                    through: { attributes: ['owns_board'] }
                },
                {
                    model: Category,
                    include: [{
                        model: Note,
                        attributes: ['id', 'title', 'content']
                    }]
                }
            ],
            order: [[{ model: Category }, 'id', 'ASC'],
            [{ model: Category }, { model: Note }, 'id', 'ASC']]
        });

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        res.json(board);
    } catch (error) {
        console.error('Error fetching board:', error);
        res.status(500).json({ error: 'Failed to fetch board' });
    }
});

// POST /api/boards - Create new board
router.post('/', async (req, res) => {
    try {
        const { title, owner_username } = req.body;

        if (!title || !owner_username) {
            return res.status(400).json({ error: 'Title and owner_username are required' });
        }

        // Check if owner exists
        const owner = await User.findByPk(owner_username);
        if (!owner) {
            return res.status(404).json({ error: 'Owner user not found' });
        }

        const board = await Board.create({ title });

        // Add owner to board with ownership
        await board.addUser(owner, { through: { owns_board: true } });

        // Fetch the created board with associations
        const createdBoard = await Board.findByPk(board.id, {
            include: [{
                model: User,
                attributes: ['username'],
                through: { attributes: ['owns_board'] }
            }]
        });

        res.status(201).json(createdBoard);
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ error: 'Failed to create board' });
    }
});

// PUT /api/boards/:id - Update board
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const board = await Board.findByPk(id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        if (title !== undefined) {
            await board.update({ title });
        }

        // Fetch updated board with associations
        const updatedBoard = await Board.findByPk(id, {
            include: [{
                model: User,
                attributes: ['username'],
                through: { attributes: ['owns_board'] }
            }]
        });

        res.json(updatedBoard);
    } catch (error) {
        console.error('Error updating board:', error);
        res.status(500).json({ error: 'Failed to update board' });
    }
});

// DELETE /api/boards/:id - Delete board
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const board = await Board.findByPk(id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        await board.destroy();
        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ error: 'Failed to delete board' });
    }
});

// GET /api/boards/:id/members - Get board members
router.get('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;

        const board = await Board.findByPk(id, {
            include: [{
                model: User,
                attributes: ['username', 'is_admin'],
                through: { attributes: ['owns_board'] }
            }]
        });

        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        res.json(board.Users);
    } catch (error) {
        console.error('Error fetching board members:', error);
        res.status(500).json({ error: 'Failed to fetch board members' });
    }
});

// POST /api/boards/:id/members - Add member to board
router.post('/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, owns_board = false } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const board = await Board.findByPk(id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const user = await User.findByPk(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is already a member
        const existingMembership = await board.hasUser(user);
        if (existingMembership) {
            return res.status(409).json({ error: 'User is already a member of this board' });
        }

        await board.addUser(user, { through: { owns_board } });

        res.status(201).json({ message: 'User added to board successfully' });
    } catch (error) {
        console.error('Error adding member to board:', error);
        res.status(500).json({ error: 'Failed to add member to board' });
    }
});

// PUT /api/boards/:id/members/:username - Update member permissions
router.put('/:id/members/:username', async (req, res) => {
    try {
        const { id, username } = req.params;
        const { owns_board } = req.body;

        const board = await Board.findByPk(id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const user = await User.findByPk(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is a member
        const membership = await board.hasUser(user);
        if (!membership) {
            return res.status(404).json({ error: 'User is not a member of this board' });
        }

        if (owns_board !== undefined) {
            await board.addUser(user, { through: { owns_board } });
        }

        res.json({ message: 'Member permissions updated successfully' });
    } catch (error) {
        console.error('Error updating member permissions:', error);
        res.status(500).json({ error: 'Failed to update member permissions' });
    }
});

// DELETE /api/boards/:id/members/:username - Remove member from board
router.delete('/:id/members/:username', async (req, res) => {
    try {
        const { id, username } = req.params;

        const board = await Board.findByPk(id);
        if (!board) {
            return res.status(404).json({ error: 'Board not found' });
        }

        const user = await User.findByPk(username);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is a member
        const membership = await board.hasUser(user);
        if (!membership) {
            return res.status(404).json({ error: 'User is not a member of this board' });
        }

        await board.removeUser(user);
        res.json({ message: 'Member removed from board successfully' });
    } catch (error) {
        console.error('Error removing member from board:', error);
        res.status(500).json({ error: 'Failed to remove member from board' });
    }
});

module.exports = router;
