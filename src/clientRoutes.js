// src/clientRoutes.js

const express = require('express');
const router = express.Router();
const { Client } = require('pg'); // Подключение к базе данных PostgreSQL

// Подключение к базе данных PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Отключаем проверку SSL сертификата
  }
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.stack));

// Маршрут для добавления нового клиента
router.post('/', (req, res) => {
  const { name, email, phone } = req.body; // Получаем данные клиента
  const query = 'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *'; // SQL-запрос

  client.query(query, [name, email, phone], (err, result) => {
    if (err) {
      console.error('Error adding client:', err);
      res.status(500).json({ error: 'Error adding client' });
    } else {
      res.json({ message: 'Client added successfully', client: result.rows[0] });
    }
  });
});

// Маршрут для получения всех клиентов
router.get('/', (req, res) => {
  client.query('SELECT * FROM clients', (err, result) => {
    if (err) {
      console.error('Query execution error:', err);
      res.status(500).json({ error: 'Query execution error' });
    } else {
      res.json(result.rows);
    }
  });
});

// Маршрут для обновления клиента по ID
router.put('/:id', (req, res) => {
  const { name, email, phone } = req.body; // Получаем данные клиента
  const clientId = req.params.id; // Получаем ID клиента

  const query = 'UPDATE clients SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *'; // SQL-запрос
  client.query(query, [name, email, phone, clientId], (err, result) => {
    if (err) {
      console.error('Error updating client:', err);
      res.status(500).json({ error: 'Error updating client' });
    } else {
      res.json(result.rows[0]);
    }
  });
});

// Маршрут для удаления клиента по ID
router.delete('/:id', (req, res) => {
  const clientId = req.params.id; // Получаем ID клиента

  const query = 'DELETE FROM clients WHERE id = $1 RETURNING *'; // SQL-запрос на удаление
  client.query(query, [clientId], (err, result) => {
    if (err) {
      console.error('Error deleting client:', err);
      res.status(500).json({ error: 'Error deleting client' });
    } else {
      res.json({ message: 'Client deleted successfully', client: result.rows[0] });
    }
  });
});

// Маршруты для транзакций клиента
router.get('/:id/transactions', (req, res) => {
  const clientId = req.params.id; // ID клиента

  const query = 'SELECT * FROM transactions WHERE client_id = $1';
  client.query(query, [clientId], (err, result) => {
    if (err) {
      console.error('Error fetching transactions:', err);
      res.status(500).json({ error: 'Error fetching transactions' });
    } else {
      res.json(result.rows);
    }
  });
});

// Добавление транзакции для клиента
router.post('/:id/transactions', (req, res) => {
  const { description, amount } = req.body;
  const clientId = req.params.id;

  const query = 'INSERT INTO transactions (description, amount, client_id) VALUES ($1, $2, $3) RETURNING *';
  client.query(query, [description, amount, clientId], (err, result) => {
    if (err) {
      console.error('Error adding transaction:', err);
      res.status(500).json({ error: 'Error adding transaction' });
    } else {
      res.json({ message: 'Transaction added successfully', transaction: result.rows[0] });
    }
  });
});

module.exports = router;