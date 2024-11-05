const pool = require("../db");

const getUsers = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, email, role, created_at FROM users ORDER BY id ASC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Server error" });
    }
};

const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "SELECT id, email, role, created_at FROM users WHERE id = $1",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getUsers,
    getUser
};