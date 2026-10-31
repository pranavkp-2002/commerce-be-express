const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter name, email, password",
      });
    }

    const userData = await User.findOne({ email });
    if (userData) {
      return res.status(400).json({
        success: false,
        message: "User already registed",
      });
    }

    const hashPass = await bcrypt.hash(password, 12);

    const user = await User.create({ name, email, password: hashPass });
    console.log(name, email, password);

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
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Enter email, password",
      });
    }

    const userData = await User.findOne({ email });

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "email or password is wrong",
      });
    }

    const token = jwt.sign(
      { userId: userData._id, role: userData.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "5h",
      },
    );

    return res.status(200).json({
      success: true,
      message: "Login succesfully",
      token,
      data: userData,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const profileUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Profile succesfully",
      user,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, newPassword, oldPassword } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Old password and new password are required",
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      user.password = await bcrypt.hash(newPassword, 12);
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
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId);

    return res.status(200).json({
      success: true,
      message: "Profile deleted succesfully",
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  profileUser,
  updateUser,
  deleteUser,
};
