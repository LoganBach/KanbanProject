const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

const { User } = require("../../models/associations");

router.post("/register", async (req, res) => {
    const { username, password, email, is_admin = false } = req.body;
    console.log("Registering userRRR:");
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with hashed password
        const newUser = await User.create({
            username,
            password: hashedPassword,
            email,
            is_admin,
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser.toJSON();
        // create a jwt token
        const token = jwt.sign({ username: newUser.username }, "supersecret123", {
            expiresIn: "1h",
        });

        // Respond with user data and token
        res.status(201).json({
            message: "User registered successfully",
            user: userWithoutPassword,
            token,
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ message: "Failed to register user" + error });
    }
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ where: { username } });

        // Check if user exists
        if (!user) {
            return res.status(400).json({ message: "Invalid Username" });
        }

        //compare password with hashed password
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        // Create a JWT token without password
        const token = jwt.sign({ username: user.username }, "supersecret123", {
            expiresIn: "1h",
        });

        // Respond with user data and token
        res.json({
            message: "Login successful",
            username: user.username,
            email: user.email,
            is_admin: user.is_admin,
            token,
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Failed to login" });
    }
});

module.exports = router;
