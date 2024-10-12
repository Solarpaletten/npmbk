const { Client } = require('pg');

// Используем переменную окружения DATABASE_URL для подключения к базе данных
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Отключаем проверку сертификата SSL
  }
});

client.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Connection error', err.stack));

module.exports = client;
