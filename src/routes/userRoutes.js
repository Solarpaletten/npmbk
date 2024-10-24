import express from 'express';
import { register, login } from '../controllers/userController'; // Убедитесь, что register и login импортированы

const router = express.Router();

// Маршрут для регистрации
router.post('/register', register);

// Маршрут для логина
router.post('/login', login);

export default router;


