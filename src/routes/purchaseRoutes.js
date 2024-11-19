const express = require("express");
const {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
} = require("../controllers/purchaseController");
const router = express.Router();

router.get("/purchases", getPurchases);
router.get("/purchases/:id", getPurchase);
router.post("/purchases", createPurchase);
router.put("/purchases/:id", updatePurchase);
router.delete("/purchases/:id", deletePurchase);

module.exports = router;
