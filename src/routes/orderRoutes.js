const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  checkout,
  getMyOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const authorizeRole = require("../middleware/authorizeRole");

const router = express.Router();
router.post("/checkout", authMiddleware, checkout);
router.get("/order", authMiddleware, getMyOrders);
router.get("/order/:orderId", authMiddleware, getOrderDetails);
router.get(
  "/order/admin/all",
  authMiddleware,
  authorizeRole("admin"),
  getAllOrders,
);

router.patch(
  "/order/admin/:orderId",
  authMiddleware,
  authorizeRole("admin"),
  updateOrderStatus,
);

module.exports = router;
