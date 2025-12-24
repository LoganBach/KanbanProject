const express = require("express");
const router = express.Router();
const { User, Board } = require("../../models/associations");

// GET /api/users - Get all users (admin only or basic user info)
router.get("/", async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ["username", "email", "is_admin"],
            include: [
                {
                    model: Board,
                    attributes: ["id", "title"],
                    through: { attributes: ["owns_board"] },
                },
            ],
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// GET /api/users/:username - Get specific user
router.get("/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findByPk(username, {
            attributes: ["username", "email", "is_admin"],
            include: [
                {
                    model: Board,
                    attributes: ["id", "title"],
                    through: { attributes: ["owns_board"] },
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// POST /api/users - Create new user
router.post("/", async (req, res) => {
    try {
        const { username, password, email, is_admin = false } = req.body;

        if (!username || !password || !email) {
            return res
                .status(400)
                .json({ error: "Username, password, and email are required" });
        }

        // Check if user already exists
        const existingUser = await User.findByPk(username);
        if (existingUser) {
            return res.status(409).json({ error: "User already exists" });
        }

        const user = await User.create({
            username,
            password,
            email,
            is_admin,
        });

        // Return user without password
        const { password: _, ...userResponse } = user.toJSON();
        res.status(201).json(userResponse);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});

// PUT /api/users/:username - Update user
router.put("/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const { password, email, is_admin } = req.body;

        const user = await User.findByPk(username);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updateData = {};
        if (password !== undefined) updateData.password = password;
        if (email !== undefined) updateData.email = email;
        if (is_admin !== undefined) updateData.is_admin = is_admin;

        await user.update(updateData);

        // Return user without password
        const { password: _, ...userResponse } = user.toJSON();
        res.json(userResponse);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
});

// DELETE /api/users/:username - Delete user
router.delete("/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findByPk(username);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await user.destroy();
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// GET /api/users/:username/boards - Get boards for a specific user
router.get("/:username/boards", async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findByPk(username, {
            include: [
                {
                    model: Board,
                    attributes: ["id", "title"],
                    through: { attributes: ["owns_board"] },
                },
            ],
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user.Boards);
    } catch (error) {
        console.error("Error fetching user boards:", error);
        res.status(500).json({ error: "Failed to fetch user boards" });
    }
});

module.exports = router;
