const pool = require('../db');

// Создать новую транзакцию
const createTransaction = async (description, amount, userId) => {
  const result = await pool.query(
    'INSERT INTO transactions (description, amount, user_id) VALUES ($1, $2, $3) RETURNING *',
    [description, amount, userId]
  );
  return result.rows[0];
};

// Получить все транзакции
const getTransactions = async () => {
  const result = await pool.query('SELECT * FROM transactions');
  return result.rows;
};

// Получить транзакции по ID пользователя
const getTransactionsByUserId = async (userId) => {
  const result = await pool.query('SELECT * FROM transactions WHERE user_id = $1', [userId]);
  return result.rows;
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionsByUserId
};
