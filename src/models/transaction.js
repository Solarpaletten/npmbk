// src/models/transaction.js

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTransaction = async (description, amount, userId) => {
  const res = await pool.query(
    'INSERT INTO transactions (description, amount, user_id) VALUES ($1, $2, $3) RETURNING *',
    [description, amount, userId]
  );
  return res.rows[0];
};

const getTransactions = async () => {
  const res = await pool.query('SELECT * FROM transactions');
  return res.rows;
};

module.exports = {
  createTransaction,
  getTransactions,
};