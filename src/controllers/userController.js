const pool = require("../db");
const bcrypt = require("bcryptjs");

// Получение всех пользователей
const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                email, 
                role, 
                created_at, 
                last_login,
                (SELECT COUNT(*) FROM user_logs WHERE user_id = users.id) as activity_count
            FROM users 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Получение конкретного пользователя
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                email, 
                role, 
                created_at, 
                last_login,
                (SELECT COUNT(*) FROM user_logs WHERE user_id = users.id) as activity_count
            FROM users 
            WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userLogs = await pool.query(
            "SELECT action, created_at FROM user_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10",
            [id]
        );

        const userData = {
            ...result.rows[0],
            recent_activity: userLogs.rows
        };

        res.json(userData);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Создание пользователя
const createUser = async (req, res) => {
    const { email, password, role } = req.body;

    // Валидация входных данных
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // Проверка роли
    const validRoles = ['admin', 'user', 'manager'];
    if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    try {
        // Проверка существующего пользователя
        const exists = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (exists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, role, created_at) 
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP) 
             RETURNING id, email, role, created_at`,
            [email, hashedPassword, role || 'user']
        );

        // Логирование действия
        await pool.query(
            `INSERT INTO user_logs (user_id, action, created_at) 
             VALUES ($1, $2, CURRENT_TIMESTAMP)`,
            [result.rows[0].id, 'User created']
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Обновление пользователя
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password, role } = req.body;
    const updatedFields = [];
    const values = [id];
    let queryIndex = 2;

    try {
        // Проверяем существование пользователя
        const userExists = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Формируем запрос обновления
        if (email) {
            updatedFields.push(`email = $${queryIndex}`);
            values.push(email);
            queryIndex++;
        }

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedFields.push(`password_hash = $${queryIndex}`);
            values.push(hashedPassword);
            queryIndex++;
        }

        if (role) {
            // Проверка валидности роли
            const validRoles = ['admin', 'user', 'manager'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: "Invalid role" });
            }
            updatedFields.push(`role = $${queryIndex}`);
            values.push(role);
            queryIndex++;
        }

        if (updatedFields.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        // Выполнение обновления
        const result = await pool.query(
            `UPDATE users 
             SET ${updatedFields.join(', ')}, 
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 
             RETURNING id, email, role, created_at, updated_at`,
            values
        );

        // Логирование действия
        await pool.query(
            `INSERT INTO user_logs (user_id, action, created_at) 
             VALUES ($1, $2, CURRENT_TIMESTAMP)`,
            [id, 'User updated']
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Удаление пользователя
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Проверка, не пытается ли пользователь удалить сам себя
        if (parseInt(id) === req.user.userId) {
            return res.status(400).json({ message: "Cannot delete yourself" });
        }

        // Проверяем существование пользователя
        const userExists = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [id]
        );

        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Сохраняем логи пользователя перед удалением
        await pool.query(
            `INSERT INTO deleted_user_logs 
             SELECT * FROM user_logs 
             WHERE user_id = $1`,
            [id]
        );

        // Удаляем логи пользователя
        await pool.query(
            "DELETE FROM user_logs WHERE user_id = $1",
            [id]
        );

        // Удаляем пользователя
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id",
            [id]
        );

        res.json({ 
            message: "User successfully deleted",
            id: result.rows[0].id
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Получение статистики
const getUserStats = async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count,
                COUNT(CASE WHEN role = 'user' THEN 1 END) as user_count,
                COUNT(CASE WHEN role = 'manager' THEN 1 END) as manager_count,
                COUNT(CASE WHEN last_login > NOW() - INTERVAL '24 hours' THEN 1 END) as active_users_24h
            FROM users
        `);

        const recent_activity = await pool.query(`
            SELECT ul.action, ul.created_at, u.email
            FROM user_logs ul
            JOIN users u ON ul.user_id = u.id
            ORDER BY ul.created_at DESC
            LIMIT 10
        `);

        res.json({
            stats: stats.rows[0],
            recent_activity: recent_activity.rows
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    getUserStats
};