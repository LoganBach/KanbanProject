const express = require("express");
const router = express.Router();
const { User, Board, Invite } = require("../../models/associations");

// GET /api/invites - Get all invites for a specific user
router.get("/", async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res
                .status(400)
                .json({ error: "Username query parameter is required" });
        }

        // Find the user first to validate they exist
        const user = await User.findByPk(username);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get all invites for this user
        const invites = await Invite.findAll({
            where: {
                UserUsername: username,
            },
            include: [
                {
                    model: User,
                    attributes: ["username"],
                },
                {
                    model: Board,
                    attributes: ["id", "title"],
                },
            ],
        });

        res.json(invites);
    } catch (error) {
        console.error("Error fetching invites:", error);
        res.status(500).json({ error: "Failed to fetch invites" });
    }
});

// POST /api/invites - Create a new invite
router.post("/", async (req, res) => {
    try {
        const { username, boardId, sender } = req.body;

        if (!username || !boardId || !sender) {
            return res
                .status(400)
                .json({ error: "Username, boardId, and sender are required" });
        }

        // Verify the user exists
        const user = await User.findByPk(username);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify the board exists
        const board = await Board.findByPk(boardId);
        if (!board) {
            return res.status(404).json({ error: "Board not found" });
        }

        // Check if invite already exists
        const existingInvite = await Invite.findOne({
            where: {
                UserUsername: username,
                BoardId: boardId,
            },
        });

        if (existingInvite) {
            return res.status(409).json({
                error: "Invite already exists for this user and board",
            });
        }

        // Create the invite
        const invite = await Invite.create({
            UserUsername: username,
            BoardId: boardId,
            sender: sender,
        });

        // Return the invite with associated data
        const createdInvite = await Invite.findByPk(invite.id, {
            include: [
                {
                    model: User,
                    attributes: ["username"],
                },
                {
                    model: Board,
                    attributes: ["id", "title"],
                },
            ],
        });

        res.status(201).json(createdInvite);
    } catch (error) {
        console.error("Error creating invite:", error);
        res.status(500).json({ error: "Failed to create invite" });
    }
});

// DELETE /api/invites/:id - Delete an invite
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const invite = await Invite.findByPk(id);
        if (!invite) {
            return res.status(404).json({ error: "Invite not found" });
        }

        await invite.destroy();
        res.json({ message: "Invite deleted successfully" });
    } catch (error) {
        console.error("Error deleting invite:", error);
        res.status(500).json({ error: "Failed to delete invite" });
    }
});

module.exports = router;
