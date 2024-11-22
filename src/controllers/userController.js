const pool = require("../db");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    const role = rows[0].role;

    if (role !== "admin") throw new Error({ message: "Access denied" });

    const { search = "", sort = "username", order = "ASC" } = req.query;

    const searchQuery = `%${search}%`;
    const sortColumn = ["username", "email", "role", "created_at"].includes(
      sort
    )
      ? sort
      : "username";
    const sortOrder = order === "DESC" ? "DESC" : "ASC";

    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE username ILIKE $1 OR email ILIKE $1 OR role ILIKE $1
      ORDER BY ${sortColumn} ${sortOrder}
      `,
      [searchQuery]
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      rows: [user],
    } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      rows: [client],
    } = await pool.query("SELECT * FROM clients WHERE created_by = $1", [user.id]);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ ...user, ...client });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  const { username, email } = req.body;
  const password = req.body.password || "default1234";
  const role = req.body.role || "standard";
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (username, email, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, role, hashedPassword]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  try {
    const result = await pool.query(
      "UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING *",
      [username, email, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, getUser, createUser, updateUser, deleteUser };
