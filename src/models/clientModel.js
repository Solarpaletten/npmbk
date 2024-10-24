import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Подключение к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});



// Функция для получения всех клиентов
export const getClients = async () => {
  const result = await pool.query('SELECT * FROM clients');
  return result.rows;
};

// Функция для добавления нового клиента
export const addClient = async (clientData) => {
  const { name, email, phone } = clientData;
  const result = await pool.query(
    'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
    [name, email, phone]
  );
  return result.rows[0];
};
