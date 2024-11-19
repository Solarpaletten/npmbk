const express = require("express");
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
} = require("../controllers/saleController");
const router = express.Router();

router.get("/sales", getSales);
router.get("/sales/:id", getSale);
router.post("/sales", createSale);
router.put("/sales/:id", updateSale);
router.delete("/sales/:id", deleteSale);

module.exports = router;
