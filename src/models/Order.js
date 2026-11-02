const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a positive integer",
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true },
);

const addressSchema = new mongoose.Schema(
  {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "An order must contain at least one item",
      },
    },
    shippingAddress: {
      type: addressSchema,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// getMyOrders filters by user and sorts newest first; the user prefix also
// serves getOrderDetails' { _id, user } lookup and replaces a plain user index
orderSchema.index({ user: 1, createdAt: -1 });
// Admin listing sorts all orders newest first
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
