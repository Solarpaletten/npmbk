// bankOperationsRoutes.js
const express = require("express");
const {
  getBankOperations,
  getBankOperation,
  createBankOperation,
  updateBankOperation,
  deleteBankOperation,
  copyBankOperation,
} = require('../controllers/bankOperationsController');

const router = express.Router();

router.get("/", getBankOperations);
router.get("/:id", getBankOperation);
router.post("/", createBankOperation);
router.put("/:id", updateBankOperation);
router.delete("/:id", deleteBankOperation);
router.post("/:id/copy", copyBankOperation);

module.exports = router;