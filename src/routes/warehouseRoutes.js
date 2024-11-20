const express = require("express");
const {
  getIncomingProducts,
  getIncomingProduct,
  createIncomingProduct,
  updateIncomingProduct,
  deleteIncomingProduct,
} = require("../controllers/incomingController");
const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
} = require("../controllers/salesController");

const router = express.Router();

router.get("/incoming", getIncomingProducts);
router.get("/incoming/:id", getIncomingProduct);
router.post("/incoming", createIncomingProduct);
router.put("/incoming/:id", updateIncomingProduct);
router.delete("/incoming/:id", deleteIncomingProduct);

router.get("/sales", getSales);
router.get("/sales/:id", getSale);
router.post("/sales", createSale);
router.put("/sales/:id", updateSale);
router.delete("/sales/:id", deleteSale);

module.exports = router;
