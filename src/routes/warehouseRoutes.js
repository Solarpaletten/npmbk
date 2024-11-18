// routes/warehouseRoutes.js
const express = require('express');
const router = express.Router();

const {
  getIncomingProducts,
  getIncomingProduct,
  createIncomingProduct,
  updateIncomingProduct,
  deleteIncomingProduct,
} = require('../controllers/incomingController');

const {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
} = require('../controllers/salesController');

// Маршруты для incoming_products
router.get('/incoming', getIncomingProducts);
router.get('/incoming/:id', getIncomingProduct);
router.post('/incoming', createIncomingProduct);
router.put('/incoming/:id', updateIncomingProduct);
router.delete('/incoming/:id', deleteIncomingProduct);

// Маршруты для sales_products
router.get('/sales', getSales);
router.get('/sales/:id', getSale);
router.post('/sales', createSale);
router.put('/sales/:id', updateSale);
router.delete('/sales/:id', deleteSale);

module.exports = router;
