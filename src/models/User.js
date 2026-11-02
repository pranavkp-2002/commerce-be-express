const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      // Never returned by queries unless explicitly requested with .select("+password")
      select: false,
    },
    // Tokens issued before this time are rejected (see authMiddleware)
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Defense in depth: strip secrets even if a query selected them
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.passwordChangedAt;
        delete ret.__v;
        return ret;
      },
    },
  },
);

module.exports = mongoose.model("User", userSchema);
