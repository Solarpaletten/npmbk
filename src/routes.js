const express = require('express');
const router = express.Router();
const { Client } = require('pg'); // Подключаем PostgreSQL

// Подключение к базе данных
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Отключаем проверку SSL сертификата
  }
});

client.connect()
  .then(() => console.log('Подключение к базе данных PostgreSQL выполнено успешно'))
  .catch(err => console.error('Ошибка подключения к базе данных:', err.stack));

// Маршрут для добавления нового клиента
router.post('/', (req, res) => {
  const { name, email, phone } = req.body; // Получаем данные клиента из тела запроса
  const query = 'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *'; // SQL запрос

  client.query(query, [name, email, phone], (err, result) => {
    if (err) {
      console.error('Ошибка при добавлении клиента:', err); // Выводим ошибку в консоль
      res.status(500).json({ error: 'Ошибка при добавлении клиента' }); // Отправляем ответ с ошибкой
    } else {
      res.json({ message: 'Клиент успешно добавлен', client: result.rows[0] }); // Возвращаем сообщение об успехе и данные клиента
    }
  });
});

// Маршрут для получения всех клиентов
router.get('/', (req, res) => {
  client.query('SELECT * FROM clients', (err, result) => {
    if (err) {
      console.error('Ошибка выполнения запроса:', err); // Выводим ошибку в консоль
      res.status(500).json({ error: 'Ошибка выполнения запроса' }); // Отправляем ответ с ошибкой
    } else {
      res.json(result.rows); // Возвращаем всех клиентов в формате JSON
    }
  });
});

// Маршрут для обновления клиента по ID
router.put('/:id', (req, res) => {
  const { name, email, phone } = req.body; // Получаем новые данные клиента из тела запроса
  const clientId = req.params.id; // Получаем ID клиента из параметров URL

  const query = 'UPDATE clients SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *'; // SQL запрос на обновление клиента
  client.query(query, [name, email, phone, clientId], (err, result) => {
    if (err) {
      console.error('Ошибка обновления клиента:', err); // Выводим ошибку в консоль
      res.status(500).json({ error: 'Ошибка сервера' }); // Отправляем ответ с ошибкой
    } else {
      res.json(result.rows[0]); // Возвращаем обновленного клиента
    }
  });
});

// Маршрут для удаления клиента по ID
router.delete('/:id', (req, res) => {
  const clientId = req.params.id; // Получаем ID клиента из параметров URL

  const query = 'DELETE FROM clients WHERE id = $1 RETURNING *'; // SQL запрос на удаление клиента
  client.query(query, [clientId], (err, result) => {
    if (err) {
      console.error('Ошибка удаления клиента:', err); // Выводим ошибку в консоль
      res.status(500).json({ error: 'Ошибка сервера' }); // Отправляем ответ с ошибкой
    } else {
      res.json({ message: 'Клиент успешно удален', client: result.rows[0] }); // Возвращаем сообщение об успехе и удаленного клиента
    }
  });
});

module.exports = router; // Экспортируем маршруты для использования в index.js
