const express = require("express");
const {
  registerUser,
  loginUser,
  profileUser,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authMiddleware, profileUser);
router.patch("/update", authMiddleware, updateUser);
router.delete("/delete", authMiddleware, deleteUser);

module.exports = router;
