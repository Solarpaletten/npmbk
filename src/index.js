const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require('morgan');
const helmet = require('helmet');
const prisma = require('./prisma');
const authMiddleware = require("./middlewares/authMiddleware");

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

// Middleware
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

// Добавляем Prisma в req для доступа во всех маршрутах
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// API Routes
// Публичные маршруты
app.use("/api/auth", authRoutes);

// Защищенные маршруты
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/clients", authMiddleware, clientRoutes);
app.use("/api/bank-operations", authMiddleware, bankOperationsRoutes);
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Server startup
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});