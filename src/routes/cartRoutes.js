const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addToCart,
  deleteCart,
  updateCart,
  getCart,
} = require("../controllers/cartController");

const router = express.Router();

router.get("", authMiddleware, getCart);
router.post("", authMiddleware, addToCart);
router.put("/:id", authMiddleware, updateCart);
router.delete("/:id", authMiddleware, deleteCart);

module.exports = router;
