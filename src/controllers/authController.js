const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { id, username, password_hash, role } = result.rows[0];
    const validPassword = await bcrypt.compare(password, password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, username, role, userId: id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const registerUser = async (req, res) => {
  const { username, email } = req.body;
  const password = req.body.password || "default1234";
  const role = req.body.role || "standard";
  const hashedPassword = await bcrypt.hash(password, 10);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      rows: [user],
    } = await client.query(
      "INSERT INTO users (username, email, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, role, hashedPassword]
    );

    const {
      rows: [clientData],
    } = await client.query(
      `
      INSERT INTO clients 
        (name, email, phone, code, vat_code, user_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [`${user.username} Company`, user.email, null, null, null, user.id]
    );

    const {
      rows: [warehouse],
    } = await client.query(
      `
      INSERT INTO warehouses 
        (name, company_id, responsible_person_id, user_id)
      VALUES 
        ($1, $2, $3, $4) 
      RETURNING *`,
      ["Main Warehouse", clientData.id, user.id, user.id]
    );

    await client.query("COMMIT");

    res.status(201).json({ user, client: clientData, warehouse });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { loginUser, registerUser };
