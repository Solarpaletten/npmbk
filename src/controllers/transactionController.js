const { createTransaction, getTransactions, getTransactionsByUserId } = require('../models/transaction');

// Получить все транзакции
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await getTransactions();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Получить транзакции по ID пользователя
exports.getUserTransactions = async (req, res) => {
  try {
    const userId = req.user.id; // Получаем ID пользователя из токена
    const transactions = await getTransactionsByUserId(userId);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
};

// Добавить новую транзакцию
exports.addTransaction = async (req, res) => {
  const { description, amount } = req.body;
  const userId = req.user.id; // Получаем ID пользователя из токена

  try {
    const newTransaction = await createTransaction(description, amount, userId);
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add transaction' });
  }
};
