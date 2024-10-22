require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes'); // Основные маршруты
const clientRoutes = require('./clientRoutes'); // Маршруты для клиентов

const app = express();
const PORT = process.env.PORT || 3000; // Порт из переменных окружения или 3000 по умолчанию

app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(bodyParser.json()); // Разбираем JSON-тело запросов
app.use(express.json());
app.use('/api', routes); // Подключаем основные маршруты
app.use('/api/clients', clientRoutes); // Подключаем маршруты для клиентов

// Корневой маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Server is running! Welcome to the client API.');
});

// Запуск сервера на указанном порту
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;