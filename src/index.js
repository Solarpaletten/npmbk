import express from 'express';
import clientRoutes from './routes/clientRoutes.js';  // Используем import вместо require
import fetch from 'node-fetch';  // Добавляем импорт fetch

const app = express();

// Добавляем middleware для обработки CORS
app.use((_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

import cors from 'cors';
app.use(cors({
  origin: ['http://localhost:3000', 'https://npmfr.onrender.com'],
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));


app.use(express.json());  // Добавляем middleware для обработки JSON

app.use('/api/clients', clientRoutes);  // Добавляем маршруты для клиентов

// Маршрут для получения клиентов через fetch
app.get('/fetch-clients', async (_, res) => {
  try {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'; 'https://npmbk.onrender.com'; 
    const response = await fetch(`${API_URL}/api/clients`);
    const clients = await response.json();
    res.json(clients);
  } catch (error) {
    console.error('Ошибка при запросе клиентов:', error);
    res.status(500).json({ message: 'Ошибка при запросе клиентов' });
  }
});

// Корневой маршрут для главной страницы
app.get('/', (_, res) => {
  res.send('Добро пожаловать! Вы вошли на сервер backend.');
});

// Обработка ошибки 404 для несуществующих маршрутов
app.use((_, res) => {
  res.status(404).send({ error: 'Not found' });
});

// Запуск сервера
const PORT = process.env.PORT || 4000;  // Обратите внимание, что порт указан только один раз
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
