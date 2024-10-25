const pool = require("../db");

const getClients = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clients");
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
  const { name, email, phone } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO clients (name, email, phone, code, vat_code) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, email, phone, code, vat_code]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

module.exports = {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};
