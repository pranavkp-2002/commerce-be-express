const express = require("express");
const {
  addProduct,
  getAllProduct,
  getProductyById,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
} = require("../controllers/productController");
const authorizeRole = require("../middleware/authorizeRole");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { uploadProductImages } = require("../middleware/upload");
const { idParam } = require("../validators/common");
const {
  createProductSchema,
  updateProductSchema,
  listProductsQuery,
  imageParams,
} = require("../validators/productValidators");

const router = express.Router();

router.post(
  "",
  authMiddleware,
  authorizeRole("admin"),
  uploadProductImages,
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
router.post(
  "/:id/images",
  authMiddleware,
  authorizeRole("admin"),
  uploadProductImages,
  validate({ params: idParam }),
  addProductImages,
);
router.delete(
  "/:id/images/:imageId",
  authMiddleware,
  authorizeRole("admin"),
  validate({ params: imageParams }),
  deleteProductImage,
);

module.exports = router;
