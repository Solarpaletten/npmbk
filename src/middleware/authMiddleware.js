const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware для аутентификации через JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authorization required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Добавляем информацию о пользователе в запрос
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware для проверки роли администратора
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

// Middleware для проверки роли пользователя
const isUser = (req, res, next) => {
  if (req.user.role !== 'user') {
    return res.status(403).json({ message: 'Access denied: Users only' });
  }
  next();
};

module.exports = {
  authenticateJWT,
  isAdmin,
  isUser
};
