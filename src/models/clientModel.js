import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();  // Загружаем переменные окружения из .env

// Настраиваем подключение к базе данных
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Функция для получения всех клиентов
export const getClients = async () => {
  try {
    const result = await pool.query('SELECT * FROM clients');
    return result.rows;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

// Функция для добавления нового клиента
export const addClient = async (clientData) => {
  try {
    const { name, email, phone } = clientData;
    const result = await pool.query(
      'INSERT INTO clients (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding client:', error);
    throw error;
  }
};
