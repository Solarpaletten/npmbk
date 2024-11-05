const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.connect()
    .then(client => {
        console.log('connecting to db');
        client.release(); // Освобождаем клиента после успешного подключения
    })
    .catch(err => console.error('Error to db', err.stack));

module.exports = pool;
