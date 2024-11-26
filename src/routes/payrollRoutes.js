const express = require("express");
const {
  getPayrolls,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  
} = require("../controllers/payrollController");
const router = express.Router();
// Добавьте эту функцию в ваш контроллер
const getPayrollSummary = async (req, res) => {
    // Логика для получения сводки по зарплатам
  };

// Получить все записи зарплат
router.get("/", getPayrolls);

// Получить сводку по зарплатам
router.get("/summary", getPayrollSummary);

// Получить конкретную запись зарплаты
router.get("/:id", getPayroll);

// Создать новую запись зарплаты
router.post("/", createPayroll);

// Обновить запись зарплаты
router.put("/:id", updatePayroll);

// Удалить запись зарплаты
router.delete("/:id", deletePayroll);

module.exports = router;