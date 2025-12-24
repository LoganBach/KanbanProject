const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlize = require("./config/database");

const apiRoutes = require("./routes/api");

// Import database models to ensure they're initialized
require("./models/associations");

const app = express();
const PORT = 5000;
const CORS_ORIGIN = "http://localhost:3000";

//########## Middleware

app.use(
    cors({
        origin: CORS_ORIGIN,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

app.use("/api", apiRoutes); // routes for API endpoints

// 404 handler for undefined routes
app.use("*", (req, res) => {
    res.status(404).json({
        error: "Route not found",
        path: req.originalUrl,
        method: req.method,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(500).json({
        error: "Internal server error",
        message:
            process.env.NODE_ENV === "development"
                ? err.message
                : "Something went wrong",
    });
});

//########## Startup

sqlize
    .sync({ force: false })
    .then(() => {
        console.log("Sequelize synced");
    })
    .catch((error) => {
        console.error("Sequelize sync failed:", error);
    });

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API documentation available at: http://localhost:${PORT}/api/`);
});

module.exports = app;
