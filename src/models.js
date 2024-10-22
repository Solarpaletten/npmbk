const { Client } = require('pg');

// Настройка подключения к PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

// Функция для добавления новой транзакции
const addTransaction = async (description, amount) => {
  const query = 'INSERT INTO transactions (description, amount, date) VALUES ($1, $2, NOW()) RETURNING *';
  const values = [description, amount];
  
  try {
    const res = await client.query(query, values);
    console.log('Transaction added:', res.rows[0]);
    return res.rows[0];
  } catch (err) {
    console.error('Error adding transaction:', err);
    throw err;
  }
};

// Функция для получения всех транзакций
const getTransactions = async () => {
  const query = 'SELECT * FROM transactions';
  
  try {
    const res = await client.query(query);
    console.log('Transactions:', res.rows);
    return res.rows;
  } catch (err) {
    console.error('Error fetching transactions:', err);
    throw err;
  }
};

// Экспорт функций для использования в других файлах
module.exports = { addTransaction, getTransactions };
