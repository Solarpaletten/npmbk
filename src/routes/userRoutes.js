const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserStats
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Применяем middleware ко всем маршрутам
router.use(authMiddleware);

// Статистика
router.get('/stats', getUserStats);

// CRUD операции
router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;