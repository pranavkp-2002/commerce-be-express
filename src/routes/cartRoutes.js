const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  addToCart,
  deleteCart,
  updateCart,
  getCart,
} = require("../controllers/cartController");
const { idParam } = require("../validators/common");
const {
  addToCartSchema,
  updateCartSchema,
} = require("../validators/cartValidators");

const router = express.Router();

router.get("", authMiddleware, getCart);
router.post("", authMiddleware, validate({ body: addToCartSchema }), addToCart);
router.put(
  "/:id",
  authMiddleware,
  validate({ params: idParam, body: updateCartSchema }),
  updateCart,
);
router.delete(
  "/:id",
  authMiddleware,
  validate({ params: idParam }),
  deleteCart,
);

module.exports = router;
