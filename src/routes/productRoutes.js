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
const validate = require("../middleware/validate");
const { idParam } = require("../validators/common");
const {
  createProductSchema,
  updateProductSchema,
  listProductsQuery,
} = require("../validators/productValidators");

const router = express.Router();

router.post(
  "",
  authMiddleware,
  authorizeRole("admin"),
  validate({ body: createProductSchema }),
  addProduct,
);
router.get("", validate({ query: listProductsQuery }), getAllProduct);
router.get("/:id", validate({ params: idParam }), getProductyById);
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  validate({ params: idParam, body: updateProductSchema }),
  updateProduct,
);
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin"),
  validate({ params: idParam }),
  deleteProduct,
);

module.exports = router;
