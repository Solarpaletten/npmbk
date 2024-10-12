const Transaction = require('./models');

// Получить все транзакции
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Добавить новую транзакцию
const addTransaction = async (req, res) => {
  const newTransaction = new Transaction({
    description: req.body.description,
    amount: req.body.amount
  });
  try {
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add transaction' });
  }
};

module.exports = { getTransactions, addTransaction };
