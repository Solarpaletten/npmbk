const pool = require("../db");

const getWarehouses = async (req, res) => {
  const userId = req.user.userId;

  try {
    const {
      rows: [user],
    } = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);

    let queryString = `
      SELECT 
        warehouses.*, 
        users.username AS created_by_name 
      FROM warehouses 
      JOIN users 
        ON warehouses.user_id = users.id
    `;

    const queryParams = [];

    if (user.role !== "admin") {
      queryString += ` WHERE warehouses.user_id = $1`;
      queryParams.push(userId);
    }

    const result = await pool.query(queryString, queryParams);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getWarehouses,
};
