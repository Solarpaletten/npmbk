const express = require("express");
const {
  getSales,
  getSale, 
  createSale,
  updateSale,
  deleteSale,
} = require("../controllers/saleController");
const router = express.Router();

router.get("/", getSales);        // будет доступен как /api/sales/
router.get("/:id", getSale);      // будет доступен как /api/sales/:id
router.post("/", createSale);     // будет доступен как /api/sales/
router.put("/:id", updateSale);   // будет доступен как /api/sales/:id
router.delete("/:id", deleteSale); // будет доступен как /api/sales/:id

module.exports = router;

