const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser } = require('../models/user'); // Модели для работы с пользователями

// Регистрация пользователя
const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Проверка, существует ли пользователь
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(username, email, passwordHash, role);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка регистрации пользователя' });
  }
};

// Логин пользователя
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Поиск пользователя по email
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    // Генерация JWT токена
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Ошибка логина:', err);
    res.status(500).json({ error: 'Не удалось выполнить вход' });
  }
};

module.exports = { register, login }; // Экспортируем функции регистрации и логина
