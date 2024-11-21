const pool = require("../db");

const getWarehouses = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM warehouses");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getWarehouses,
};
