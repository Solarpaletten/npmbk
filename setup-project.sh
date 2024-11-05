#!/bin/bash

# Создание структуры директорий
mkdir -p src/{admin-panel,controllers,middlewares,routes} scripts

# Создание package.json
cat > package.json << 'EOF'
{
  "name": "admin-panel",
  "version": "1.0.0",
  "description": "Admin Panel Backend",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.9.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
EOF

# Создание .env
cat > .env << 'EOF'
DATABASE_URL=postgresql://solar_user:PWO1lclgDswIAhL7OV1zBKGglUeTPmuf@dpg-cs4khfrtq21c73fve2j0-a.oregon-postgres.render.com/solar_eat1
PORT=4000
DATABASE_SSL=true
JWT_SECRET=myverysecretkey1234567890
NODE_ENV=development
EOF

# Создание src/db.js
cat > src/db.js << 'EOF'
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
EOF

# Создание src/index.js
cat > src/index.js << 'EOF'
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require('path');

dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

const authMiddleware = require("./middlewares/authMiddleware");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use(cors({
    origin: ['http://localhost:4000', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'admin-panel')));

app.use("/api/auth", authRoutes);
app.use("/api/admin", authMiddleware, adminRoutes);
app.use("/api/users", authMiddleware, userRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API is running" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
EOF

# Создание src/controllers/authController.js
cat > src/controllers/authController.js << 'EOF'
const pool = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const checkAuth = async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, email, role FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { loginUser, checkAuth };
EOF

# Создание src/middlewares/authMiddleware.js
cat > src/middlewares/authMiddleware.js << 'EOF'
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

module.exports = authMiddleware;
EOF

# Создание src/routes/authRoutes.js
cat > src/routes/authRoutes.js << 'EOF'
const express = require('express');
const { loginUser, checkAuth } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', loginUser);
router.get('/check', authMiddleware, checkAuth);

module.exports = router;
EOF

# Создание src/routes/adminRoutes.js
cat > src/routes/adminRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Admin panel access granted' });
});

module.exports = router;
EOF

# Создание скрипта для создания админа
cat > scripts/user-management.js << 'EOF'
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function createAdminUser() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        const password = 'user123';
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query('DELETE FROM users WHERE email = $1', ['solar@solar.de']);

        const result = await pool.query(
            `INSERT INTO users (email, password, role) 
             VALUES ($1, $2, $3) 
             RETURNING id, email, role`,
            ['solar@solar.de', hashedPassword, 'admin']
        );

        console.log('\nAdmin user created successfully!');
        console.log('----------------------------------------');
        console.log('Email: solar@solar.de');
        console.log('Password: user123');
        console.log('Role: admin');
        console.log('User ID:', result.rows[0].id);
        console.log('----------------------------------------');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await pool.end();
    }
}

createAdminUser();
EOF

# Создание минимального index.html для админ-панели
cat > src/admin-panel/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Admin Panel</title>
</head>
<body>
    <h1>Admin Panel</h1>
    <div id="login-form">
        <input type="email" id="email" placeholder="Email">
        <input type="password" id="password" placeholder="Password">
        <button onclick="login()">Login</button>
    </div>
    <script>
        async function login() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    alert('Logged in successfully!');
                }
            } catch (error) {
                alert('Login failed');
            }
        }
    </script>
</body>
</html>
EOF

# Установка зависимостей
npm install

echo "Project structure created successfully!"
echo "Run 'npm run dev' to start the server"
echo "Run 'node scripts/user-management.js' to create admin user"
EOF
