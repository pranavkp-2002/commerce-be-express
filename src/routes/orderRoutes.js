const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  checkout,
  getMyOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const authorizeRole = require("../middleware/authorizeRole");
const { paginationQuery } = require("../validators/common");
const {
  checkoutSchema,
  orderIdParam,
  updateOrderStatusSchema,
} = require("../validators/orderValidators");

const router = express.Router();
router.post(
  "/checkout",
  authMiddleware,
  validate({ body: checkoutSchema }),
  checkout,
);
router.get(
  "/order",
  authMiddleware,
  validate({ query: paginationQuery }),
  getMyOrders,
);
router.get(
  "/order/:orderId",
  authMiddleware,
  validate({ params: orderIdParam }),
  getOrderDetails,
);
router.get(
  "/order/admin/all",
  authMiddleware,
  authorizeRole("admin"),
  validate({ query: paginationQuery }),
  getAllOrders,
);

router.patch(
  "/order/admin/:orderId",
  authMiddleware,
  authorizeRole("admin"),
  validate({ params: orderIdParam, body: updateOrderStatusSchema }),
  updateOrderStatus,
);

module.exports = router;
