// src/controllers/transactionController.js

const jwt = require('jsonwebtoken');
const { createTransaction, getTransactions } = require('../models/transaction');

const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied, no token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

const getTransactionsHandler = async (req, res) => {
  try {
    const transactions = await getTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const addTransactionHandler = async (req, res) => {
  const { description, amount } = req.body;
  const userId = req.user.id;

  try {
    const newTransaction = await createTransaction(description, amount, userId);
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add transaction' });
  }
};

module.exports = { authenticate, getTransactionsHandler, addTransactionHandler };