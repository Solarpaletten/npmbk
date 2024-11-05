const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Проверка на роль администратора
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Применяем middleware
router.use(authMiddleware);
router.use(adminMiddleware);

// Маршруты админ-панели
router.get('/', (req, res) => {
    res.json({ message: 'Admin panel access granted' });
});

// Системные логи
router.get('/logs', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                ul.action, 
                ul.created_at, 
                u.email 
            FROM user_logs ul
            JOIN users u ON ul.user_id = u.id
            ORDER BY ul.created_at DESC
            LIMIT 50
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;