const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  checkout,
  getMyOrders,
  getOrderDetails,
} = require("../controllers/orderController");

const router = express.Router();
router.post("/checkout", authMiddleware, checkout);
router.get("/order", authMiddleware, getMyOrders);
router.get("/order/:orderId", authMiddleware, getOrderDetails);

module.exports = router;
