const pool = require("../db");

const getDashboard = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) AS admin_users,
        COUNT(CASE WHEN role = 'standard' THEN 1 END) AS standard_users
      FROM users
    `);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDashboard,
};
