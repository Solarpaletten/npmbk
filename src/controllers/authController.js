const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createUser } = require('./userController');

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { id, username, password_hash, role } = result.rows[0];
    const validPassword = await bcrypt.compare(password, password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, username, role, userId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerUser = async (req, res) => {
  await createUser(req, res);
};

module.exports = { loginUser, registerUser };
