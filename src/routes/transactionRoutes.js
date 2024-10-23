const express = require('express');
const router = express.Router();
const { getTransactions, addTransaction, getUserTransactions } = require('../controllers/transactionController');
const { authenticateJWT, isAdmin, isUser } = require('../middleware/authMiddleware'); // Импортируем middleware

// Получить все транзакции (только админы)
router.get('/transactions', authenticateJWT, isAdmin, getTransactions);

// Получить транзакции текущего пользователя (доступно авторизованным пользователям)
router.get('/transactions/user', authenticateJWT, isUser, getUserTransactions);

// Добавить новую транзакцию (доступно авторизованным пользователям)
router.post('/transactions', authenticateJWT, addTransaction);

module.exports = router;
