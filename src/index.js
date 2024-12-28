const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authMiddleware = require("./middlewares/authMiddleware");
const morgan = require('morgan');
const helmet = require('helmet');

dotenv.config();

// Импорт маршрутов
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const clientRoutes = require("./routes/clientRoutes");
const bankOperationsRoutes = require("./routes/bankOperationsRoutes");
const saleRoutes = require("./routes/saleRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const warehousesRoutes = require("./routes/warehousesRoutes");
const productRoutes = require("./routes/productRoutes");
const chartOfAccountsRoutes = require("./routes/chartOfAccountsRoutes");
const generalLedgerRoutes = require("./routes/generalLedgerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const payrollRoutes = require("./routes/payrollRoutes");

const app = express();

// Middleware - все middleware должны быть в начале
app.use(morgan('dev')); // Логирование запросов
app.use(helmet()); // Безопасность
app.use(cors()); // CORS
app.use(express.json()); // Парсинг JSON

// API Routes
// Публичные маршруты (без авторизации)
app.use("/api/auth", authRoutes);

// Защищенные маршруты (требуют авторизации)
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/clients", authMiddleware, clientRoutes);
app.use("/api/bank-operations", authMiddleware, bankOperationsRoutes); // Исправлен путь
app.use("/api/sales", authMiddleware, saleRoutes);
app.use("/api/purchases", authMiddleware, purchaseRoutes);
app.use("/api/warehouses", authMiddleware, warehousesRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/chart-of-accounts", authMiddleware, chartOfAccountsRoutes);
app.use("/api/general-ledger", authMiddleware, generalLedgerRoutes);
app.use("/api/employees", authMiddleware, employeeRoutes);
app.use("/api/payroll", authMiddleware, payrollRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

// Error handlers должны быть последними middleware
// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
}); 

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Server startup
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});