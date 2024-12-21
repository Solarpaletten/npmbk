// routes/chartOfAccountsRoutes.js
const express = require("express");
const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  copyAccount,
  importAccounts,
} = require('../controllers/chartOfAccountsController');
const router = express.Router();

router.get("/", getAccounts);
router.get("/:id", getAccount);
router.post("/", createAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);
router.post("/:id/copy", copyAccount);
router.post("/import", importAccounts);

module.exports = router;

