const pool = require("../db");

const getEmployees = async (req, res) => {
  const userId = req.user.userId;

  try {
    const queryString = `
      SELECT 
        employees.*,
        users.username
      FROM employees
      JOIN users 
        ON employees.ref_user_id = users.id
      WHERE employees.user_id = $1
    `;

    const result = await pool.query(queryString, [userId]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getEmployees,
};
