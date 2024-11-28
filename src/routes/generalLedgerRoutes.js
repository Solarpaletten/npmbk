const express = require("express");
const router = express.Router();
const {
  getGeneralRegister,
  getGeneralLedger,
  getDocSettlement,
  getPeriodClosure,
  getCurrencyRates,
  getChartOfAccounts
} = require("../controllers/generalLedgerController");

router.get("/register", getGeneralRegister);
router.get("/ledger", getGeneralLedger);
router.get("/settlement", getDocSettlement);
router.get("/period-closure", getPeriodClosure);
router.get("/currency-rates", getCurrencyRates);
router.get("/chart-of-accounts", getChartOfAccounts);

module.exports = router;