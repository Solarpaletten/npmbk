// bankOperationsController.js
const pool = require("../db");

const getBankOperations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const queryString = `
      SELECT 
        bank_operations.*, 
        users.username AS created_by_name 
      FROM bank_operations 
      JOIN users 
        ON bank_operations.user_id = users.id
      WHERE bank_operations.user_id = $1
    `;

    const result = await pool.query(queryString, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBankOperation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM bank_operations WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBankOperation = async (req, res) => {
  const userId = req.user.userId;

  try {
    const { 
      date, 
      type, // D or K
      amount,
      client,
      description = null,
      account = "271",
      corresponding_account
    } = req.body;

    if (!date || !type || !amount || !client || !corresponding_account) {
      return res.status(400).json({
        message: "Date, type, amount, client and corresponding account are required",
        received: { date, type, amount, client, corresponding_account },
      });
    }

    const query = `
      INSERT INTO bank_operations 
        (date, type, amount, client, description, account, corresponding_account, user_id) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`;

    const values = [date, type, amount, client, description, account, corresponding_account, userId];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBankOperation = async (req, res) => {
  const { id } = req.params;
  const { 
    date, 
    type,
    amount,
    client,
    description,
    account,
    corresponding_account 
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bank_operations 
       SET date = $1, type = $2, amount = $3, client = $4, description = $5, 
           account = $6, corresponding_account = $7 
       WHERE id = $8 
       RETURNING *`,
      [date, type, amount, client, description, account, corresponding_account, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBankOperation = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM bank_operations WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Operation not found" });
    }
    res.json({ message: "Operation deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const copyBankOperation = async (req, res) => {
  const { id } = req.params;
  try {
    const sourceOperation = await pool.query(
      "SELECT * FROM bank_operations WHERE id = $1",
      [id]
    );

    if (sourceOperation.rows.length === 0) {
      return res.status(404).json({ message: "Operation not found" });
    }

    const operation = sourceOperation.rows[0];

    const query = `
      INSERT INTO bank_operations 
        (date, type, amount, client, description, account, corresponding_account, user_id) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`;

    const values = [
      operation.date,
      operation.type,
      operation.amount,
      operation.client,
      `${operation.description} (Copy)`,
      operation.account,
      operation.corresponding_account,
      operation.user_id
    ];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getBankOperations,
  getBankOperation,
  createBankOperation,
  updateBankOperation,
  deleteBankOperation,
  copyBankOperation,
};