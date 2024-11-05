const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createAdminUser() {
    try {
        // Удаляем таблицу если она существует и создаем заново
        await pool.query(`
            DROP TABLE IF EXISTS users;
            
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('Table created successfully');

        // Создаем хэш пароля
        const password = 'user123';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Добавляем администратора
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, role) 
             VALUES ($1, $2, $3) 
             RETURNING id, email, role`,
            ['solar@solar.de', hashedPassword, 'admin']
        );

        console.log('\nAdmin user created successfully!');
        console.log('----------------------------------------');
        console.log('Email: solar@solar.de');
        console.log('Password: user123');
        console.log('Role: admin');
        console.log('User ID:', result.rows[0].id);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await pool.end();
    }
}

createAdminUser();