const express = require("express");
const {
  addProduct,
  getAllProduct,
  getProductyById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const authorizeRole = require("../middleware/authorizeRole");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("", authMiddleware, authorizeRole("admin"), addProduct);
router.get("", getAllProduct);
router.get("/:id", getProductyById);
router.put("/:id", authMiddleware, authorizeRole("admin"), updateProduct);
router.delete("/:id", authMiddleware, authorizeRole("admin"), deleteProduct);

module.exports = router;
