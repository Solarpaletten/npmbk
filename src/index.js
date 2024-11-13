const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authMiddleware = require("./middlewares/authMiddleware");

dotenv.config();

const clientRoutes = require("./routes/clientRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const userRoutes = require("./routes/userRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/clients", authMiddleware, clientRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/warehouse", authMiddleware, warehouseRoutes);
app.use("/api/auth", authRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
