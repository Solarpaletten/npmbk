// src/models/user.js
import pool from '../db';

export const createUser = async (username, email, passwordHash, role) => {
  const res = await pool.query(
    'INSERT INTO users (username, email, password_hash, role, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
    [username, email, passwordHash, role]
  );
  return res.rows[0];
};

export const getUserByEmail = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0];
};