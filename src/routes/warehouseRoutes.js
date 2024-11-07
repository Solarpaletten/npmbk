const express = require("express");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addIncoming,
  createSale,
  getProductHistory,
  getStock
} = require("../controllers/warehouseController");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

router.post("/incoming", addIncoming);
router.post("/sales", createSale);

router.get("/history/:id", getProductHistory);
router.get("/stock/current", getStock);

module.exports = router;