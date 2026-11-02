const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Listing: GET /products filters by category and/or price range and sorts by
// price or createdAt. Category-first compounds serve the filtered + sorted
// case; the single-field ones serve sorting across all categories.
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
// Duplicate-name check in addProduct
productSchema.index({ name: 1 });

module.exports = mongoose.model("Product", productSchema);
