const express = require('express');
const { getUsers, getUser } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Применяем middleware ко всем маршрутам
router.use(authMiddleware);

// Маршруты
router.get('/', getUsers);
router.get('/:id', getUser);

module.exports = router;