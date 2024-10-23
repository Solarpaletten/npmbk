// src/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const { authenticate, getTransactionsHandler, addTransactionHandler } = require('../controllers/transactionController');

router.get('/transactions', authenticate, getTransactionsHandler);
router.post('/transactions', authenticate, addTransactionHandler);

module.exports = router;