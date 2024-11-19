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

  try {
    // TODO: need to wrap in transaction
    const {
      rows: [user],
    } = await pool.query(
      "INSERT INTO users (username, email, role, password_hash) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, role, hashedPassword]
    );

    const {
      rows: [client],
    } = await pool.query(
      `
      INSERT INTO clients 
        (name, email, phone, code, vat_code, created_by)
      VALUES 
        ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      ["Client 1", user.email, null, null, null, user.id]
    );


    await pool.query()
    
    const {
      rows: [warehouse],
    } = await pool.query(
      `
      INSERT INTO warehouse 
        (name, company_id, location, responsible_person_id, status)
      VALUES 
        ($1, $2, $3, $4, $5) 
      RETURNING *`,
      ["Warehouse 1", client.id, null, user.id, "Active"]
    );

    res.status(201).json({ user, client, warehouse });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { loginUser, registerUser };
