const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');

// Конфигурация
dotenv.config();

// Определяем PORT до использования
const PORT = process.env.PORT || 4000;

// Инициализация приложения
const app = express();

// Middleware
const authMiddleware = require("./middlewares/authMiddleware");

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require('./routes/adminRoutes');

// Middleware для логирования запросов
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Middleware configuration
app.use(cors({
    origin: ['http://localhost:4000', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'admin-panel')));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/users", userRoutes);

// Root endpoint
app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;