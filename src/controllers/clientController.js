const pool = require("../db");

const getClients = async (req, res) => {
  console.log(req)
  try {
    const userId = req.user.userId;
    const {
      rows: [user],
    } = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

    let queryString = `
      SELECT 
        clients.*, 
        users.username AS created_by_name 
      FROM clients 
      JOIN users 
        ON clients.created_by = users.id
    `;

    const queryParams = [];

    if (user.role !== "admin") {
      queryString += ` WHERE clients.created_by = $1`;
      queryParams.push(userId);
    }

    const result = await pool.query(queryString, queryParams);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM clients WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createClient = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { name, email, phone, code = null, vat_code = null } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email and phone are required",
        received: { name, email, phone },
      });
    }

    const query = `
      INSERT INTO clients 
        (name, email, phone, code, vat_code, created_by) 
      VALUES 
        ($1, $2, $3, $4, $5, $6) 
      RETURNING *`;

    const values = [name, email, phone, code, vat_code, userId];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: "Error creating client",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, code, vat_code } = req.body;
  try {
    const result = await pool.query(
      "UPDATE clients SET name = $1, email = $2, phone = $3, code = $4, vat_code = $5 WHERE id = $6 RETURNING *",
      [name, email, phone, code, vat_code, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM clients WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ message: "Client deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const copyClient = async (req, res) => {
  const { id } = req.params;
  try {
    const sourceClient = await pool.query(
      "SELECT * FROM clients WHERE id = $1",
      [id]
    );

    if (sourceClient.rows.length === 0) {
      return res.status(404).json({ message: "Client not found" });
    }

    const client = sourceClient.rows[0];

    const query = `
      INSERT INTO clients 
        (name, email, phone, code, vat_code) 
      VALUES 
        ($1, $2, $3, $4, $5) 
      RETURNING *`;

    const values = [
      `${client.name} (Copy)`,
      client.email,
      client.phone,
      client.code,
      client.vat_code,
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  copyClient,
};
