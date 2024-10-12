require('dotenv').config(); // Подключаем dotenv для загрузки переменных из .env

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const clientRoutes = require('./routes'); // Подключаем маршруты для работы с клиентами

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(bodyParser.json()); // Позволяет парсить JSON в запросах

// Подключаем маршруты для работы с клиентами
app.use('/api/clients', clientRoutes);

// Добавляем маршрут для корневого пути "/"
app.get('/', (req, res) => {
  res.send('Сервер работает! Добро пожаловать в API клиентов.');
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
