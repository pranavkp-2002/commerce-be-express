const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userData = await User.findOne({ email });
  if (userData) {
    throw new AppError("User already registed", 400);
  }

  const hashPass = await bcrypt.hash(password, 12);

  const user = await User.create({ name, email, password: hashPass });

  return res.status(201).json({
    success: true,
    message: "Register succesfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// Compared against when the email is unknown so both failure paths take the
// same time and don't reveal which emails are registered
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12);

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const userData = await User.findOne({ email }).select("+password");

  const isMatch = await bcrypt.compare(
    password,
    userData ? userData.password : DUMMY_HASH,
  );

  if (!userData || !isMatch) {
    throw new AppError("email or password is wrong", 401);
  }

  const token = jwt.sign(
    { userId: userData._id, role: userData.role },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: process.env.JWT_EXPIRES_IN || "5h",
    },
  );

  return res.status(200).json({
    success: true,
    message: "Login succesfully",
    token,
    data: {
      id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
    },
  });
};

const profileUser = async (req, res) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Profile succesfully",
    user,
  });
};

const updateUser = async (req, res) => {
  const { name, newPassword, oldPassword } = req.body;

  const user = await User.findById(req.user.userId).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (newPassword) {
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new AppError("Old password is incorrect", 400);
    }

    user.password = await bcrypt.hash(newPassword, 12);
    // Revokes all existing tokens; the client must log in again
    user.passwordChangedAt = new Date();
  }

  await user.save();

  return res.status(200).json({
    success: true,
    message: "Profile updated succesfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

const deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.user.userId);

  return res.status(200).json({
    success: true,
    message: "Profile deleted succesfully",
  });
};

module.exports = {
  registerUser,
  loginUser,
  profileUser,
  updateUser,
  deleteUser,
};
