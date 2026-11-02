const express = require("express");
const authorizeRole = require("../middleware/authorizeRole");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { idParam } = require("../validators/common");
const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/categoryValidators");

const router = express.Router();

router.post(
  "",
  authMiddleware,
  authorizeRole("admin"),
  validate({ body: createCategorySchema }),
  createCategory,
);
router.get("", getAllCategory);
router.get("/:id", validate({ params: idParam }), getCategoryById);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  validate({ params: idParam, body: updateCategorySchema }),
  updateCategory,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  validate({ params: idParam }),
  deleteCategory,
);

module.exports = router;
