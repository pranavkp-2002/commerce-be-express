const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const checkout = async (req, res) => {
  const { shippingAddress } = req.body;
  const userId = req.user.userId;

  const session = await mongoose.startSession();
  let createdOrder;

  try {
    // 2. Execute all checkout operations in a transaction.
    // Any AppError thrown here aborts the transaction and reaches errorHandler.
    await session.withTransaction(async () => {
      const cartData = await Cart.findOne({ user: userId })
        .session(session)
        .populate({
          path: "items.product",
          select: "name price stock",
        });

      if (!cartData) {
        throw new AppError("Cart not found", 404);
      }

      if (cartData.items.length === 0) {
        throw new AppError("Cart is empty", 400);
      }

      const orderItems = [];

      // 3. Validate all products before reducing stock
      for (const item of cartData.items) {
        const product = item.product;

        if (!product) {
          throw new AppError("A product in your cart no longer exists", 400);
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new AppError("Invalid quantity in cart", 400);
        }

        if (item.quantity > product.stock) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // 4. Reduce stock atomically
      for (const item of orderItems) {
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          {
            new: true,
            session,
          },
        );

        if (!updatedProduct) {
          throw new AppError(`Insufficient stock for ${item.name}`, 400);
        }
      }

      // 5. Calculate total
      const totalAmount = orderItems.reduce(
        (total, item) => total + item.quantity * item.price,
        0,
      );

      // 6. Create order
      const orders = await Order.create(
        [
          {
            user: userId,
            items: orderItems,
            shippingAddress,
            totalAmount,
          },
        ],
        { session },
      );

      createdOrder = orders[0];

      // 7. Clear cart
      cartData.items = [];
      await cartData.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return res.status(201).json({
    success: true,
    message: "Order placed successfully",
    order: createdOrder,
  });
};

const getMyOrders = async (req, res) => {
  const userId = req.user.userId;
  const { page, limit } = req.query;

  // Served by the { user: 1, createdAt: -1 } index without an in-memory sort
  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: userId }),
  ]);

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    page,
    limit,
    count: orders.length,
    total,
    orders,
  });
};

const getOrderDetails = async (req, res) => {
  const userId = req.user.userId;
  const orderId = req.params.orderId;

  // Find order belonging to logged-in user
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).lean();

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Order fetched successfully",
    order,
  });
};

const getAllOrders = async (req, res) => {
  const { page, limit } = req.query;

  const [orders, total] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "name email")
      .lean(),
    Order.estimatedDocumentCount(),
  ]);

  return res.status(200).json({
    success: true,
    message: "Orders fetched successfully",
    page,
    limit,
    count: orders.length,
    total,
    orders,
  });
};

const updateOrderStatus = async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  // 1. Find and update order
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true, runValidators: true },
  );

  // 2. Check order existence
  if (!updatedOrder) {
    throw new AppError("Order not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order: updatedOrder,
  });
};
module.exports = {
  checkout,
  getMyOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
};
