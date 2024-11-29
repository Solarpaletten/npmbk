const express = require("express");
const {
  getPayrolls,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
} = require("../controllers/payrollController");
const router = express.Router();

router.get("/", getPayrolls);
router.get("/:id", getPayroll);
router.post("/", createPayroll);
router.put("/:id", updatePayroll);
router.delete("/:id", deletePayroll);

module.exports = router;