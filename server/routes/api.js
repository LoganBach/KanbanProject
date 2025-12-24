var express = require("express");
var router = express.Router();
const usersRoutes = require("./api/users");
const boardsRoutes = require("./api/boards");
const categoriesRoutes = require("./api/categories");
const notesRoutes = require("./api/notes");
const authRoutes = require("./api/auth");
const invitesRoutes = require("./api/invites");

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/boards", boardsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/notes", notesRoutes);
router.use("/invites", invitesRoutes);

router.get("/", (req, res) => {
    res.json({
        message: "Kanban Online Server API",
        version: "1.0.0",
        endpoints: {
            users: "/api/users",
            boards: "/api/boards",
            categories: "/api/categories",
            notes: "/api/notes",
            auth: "/api/auth",
            invites: "/api/invites",
        },
    });
});

module.exports = router;
