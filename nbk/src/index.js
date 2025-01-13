const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const prisma = require('./prisma');
const path = require('path');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://npmbk.onrender.com',  // фронтенд на render
    'http://localhost:3000',       // локальный фронтенд
    'http://localhost:3001'        // локальный бэкенд
  ],
  credentials: true
}));

// Настройка CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' https://npmbk.onrender.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  next();
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://npmbk.onrender.com'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'"],
    },
  },
}));
app.use(express.json());

// Добавляем prisma в req
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100 // лимит 100 запросов с одного IP
});
app.use(limiter);

// Импорт роутов
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clientRoutes = require('./routes/clientRoutes');
const productRoutes = require('./routes/productRoutes');
const warehouseRoutes = require('./routes/warehouseRoutes');
const saleRoutes = require('./routes/saleRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const bankOperationsRoutes = require('./routes/bankOperationsRoutes');
const chartOfAccountsRoutes = require('./routes/chartOfAccountsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminPanelRoutes = require('./routes/adminPanelRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');

// Базовый маршрут API
const API_PREFIX = '/api/v1';

// Публичные маршруты (без аутентификации)
app.use(`${API_PREFIX}/auth`, authRoutes);

// Защищенные маршруты (с аутентификацией)
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/clients`, clientRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/warehouses`, warehouseRoutes);
app.use(`${API_PREFIX}/sales`, saleRoutes);
app.use(`${API_PREFIX}/purchases`, purchaseRoutes);
app.use(`${API_PREFIX}/bank-operations`, bankOperationsRoutes);
app.use(`${API_PREFIX}/chart-of-accounts`, chartOfAccountsRoutes);
app.use('/admin', adminPanelRoutes);
app.use('/admin', adminDashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`API available at http://localhost:${PORT}${API_PREFIX}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  prisma.$disconnect();
  process.exit(0);
});