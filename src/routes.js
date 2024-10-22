// src/routes.js

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const client = require('./db'); // Подключение к базе данных




// Маршрут для регистрации
router.post('/register', register);

// Маршрут для входа
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  try {
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // SQL запрос для вставки нового пользователя
    const query = 'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *';
    const result = await client.query(query, [username, email, hashedPassword]);

    return res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// Маршрут для создания пользователя
router.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Хеширование пароля
    const newUser = await createUser(name, email, hashedPassword);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

