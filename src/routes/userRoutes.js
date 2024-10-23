const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController'); // Убедитесь, что register и login импортированы

// Маршрут для регистрации
router.post('/register', register);

// Маршрут для логина
router.post('/login', login);

module.exports = router;


