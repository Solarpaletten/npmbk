import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';  // Используем import вместо require
import clientRoutes from './routes/clientRoutes.js';  // Используем import вместо require







const app = express();

// Middleware для обработки JSON
app.use(express.json());

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:3001',  // Здесь должен быть фронтенд (React)
  methods: 'GET,POST,PUT,DELETE',
  credentials: true  // Если необходимо передавать куки или заголовки авторизации
}));

// Маршрут для получения клиентов через fetch
app.get('/fetch-clients', async (req, res) => {
  try {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000'; // URL сервера backend
    const response = await fetch(`${API_URL}/api/clients`);
    const clients = await response.json();
    res.json(clients);
  } catch (error) {
    console.error('Ошибка при запросе клиентов:', error);
    res.status(500).json({ message: 'Ошибка при запросе клиентов' });
  }
});

// Подключение маршрутов для обработки запросов от фронтенда
app.use('/api/clients', clientRoutes);

// Корневой маршрут для главной страницы
app.get('/', (req, res) => {
  res.send('Добро пожаловать! Вы вошли на сервер backend.');
});

// Обработка ошибки 404 для несуществующих маршрутов
app.use((req, res) => {
  res.status(404).send({ error: 'Not found' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

