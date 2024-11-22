const pool = require("../db");

const getWarehouses = async (req, res) => {
  const userId = req.user.userId;

  try {
    const queryString = `
      SELECT 
        warehouses.*, 
        users.username AS created_by_name 
      FROM warehouses 
      JOIN users 
        ON warehouses.user_id = users.id
      WHERE warehouses.user_id = $1
    `;

    const result = await pool.query(queryString, [userId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getWarehouses,
};
