const express = require("express");
const {
  getPurchases,
  getPurchase,
  createPurchase,
  updatePurchase,
  deletePurchase,
} = require("../controllers/purchaseController");
const router = express.Router();

router.get("/", getPurchases);         // будет доступен как /api/purchases/
router.get("/:id", getPurchase);       // будет доступен как /api/purchases/:id
router.post("/", createPurchase);      // будет доступен как /api/purchases/
router.put("/:id", updatePurchase);    // будет доступен как /api/purchases/:id
router.delete("/:id", deletePurchase); // будет доступен как /api/purchases/:id

module.exports = router;