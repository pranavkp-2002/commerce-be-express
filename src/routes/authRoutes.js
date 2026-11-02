const express = require("express");
const {
  registerUser,
  loginUser,
  profileUser,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { authLimiter } = require("../middleware/rateLimiter");
const {
  registerSchema,
  loginSchema,
  updateUserSchema,
} = require("../validators/authValidators");

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  registerUser,
);
router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  loginUser,
);
router.get("/profile", authMiddleware, profileUser);
router.patch(
  "/update",
  authMiddleware,
  validate({ body: updateUserSchema }),
  updateUser,
);
router.delete("/delete", authMiddleware, deleteUser);

module.exports = router;
