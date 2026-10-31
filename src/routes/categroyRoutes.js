const express = require("express");
const authorizeRole = require("../middleware/authorizeRole");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

router.post("", authMiddleware, authorizeRole("admin"), createCategory);
router.get("", getAllCategory);
router.get("/:id", getCategoryById);
router.put("/:id", authMiddleware, authorizeRole("admin"), updateCategory);
router.delete("/:id", authMiddleware, authorizeRole("admin"), deleteCategory);

module.exports = router;
