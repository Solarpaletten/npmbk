const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authMiddleware = require("./middlewares/authMiddleware");
 
dotenv.config();

const clientRoutes = require("./routes/clientRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const warehousesRoutes = require("./routes/warehousesRoutes");
const bankOperationsRoutes = require("./routes/bankOperationsRoutes");
const chartOfAccountsRoutes = require("./routes/chartOfAccountsRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const generalLedgerRoutes = require("./routes/generalLedgerRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/clients", authMiddleware, clientRoutes);
app.use("/api/warehouses", authMiddleware, warehousesRoutes);
app.use("/api/bank/operations", authMiddleware, bankOperationsRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/products", authMiddleware, productRoutes);
app.use("/api/warehouse", authMiddleware, warehouseRoutes);
app.use("/api/chart-of-accounts", authMiddleware, chartOfAccountsRoutes);
app.use("/api/payroll", authMiddleware, payrollRoutes);
app.use("/api/employees", authMiddleware, employeeRoutes);
app.use("/api/general-ledger", authMiddleware, generalLedgerRoutes);
app.use("/api/auth", authRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
