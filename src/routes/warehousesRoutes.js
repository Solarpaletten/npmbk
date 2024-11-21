const express = require("express");
const { getWarehouses } = require("../controllers/warehousesController");
const router = express.Router();

router.get("/", getWarehouses);

module.exports = router;
