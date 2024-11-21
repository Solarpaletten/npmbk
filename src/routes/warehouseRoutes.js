const express = require("express");
const {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
} = require("../controllers/purchaseController");
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
} = require("../controllers/saleController");
const router = express.Router();

router.get("/purchases", getPurchases);
router.get("/purchases/:id", getPurchase);
router.post("/purchases", createPurchase);
router.put("/purchases/:id", updatePurchase);
router.delete("/purchases/:id", deletePurchase);

router.get("/sales", getSales);
router.get("/sales/:id", getSale);
router.post("/sales", createSale);
router.put("/sales/:id", updateSale);
router.delete("/sales/:id", deleteSale);

module.exports = router;
