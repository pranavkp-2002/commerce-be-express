const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const checkout = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { shippingAddress } = req.body;
    const userId = req.user.userId;

    // 1. Validate shipping address
    const requiredFields = ["street", "city", "state", "postalCode", "country"];

    if (
      !shippingAddress ||
      requiredFields.some(
        (field) =>
          typeof shippingAddress[field] !== "string" ||
          !shippingAddress[field].trim(),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a complete shipping address",
      });
    }

    let createdOrder;

    // 2. Execute all checkout operations in a transaction
    await session.withTransaction(async () => {
      const cartData = await Cart.findOne({ user: userId })
        .session(session)
        .populate({
          path: "items.product",
          select: "name price stock",
        });

      if (!cartData) {
        throw new Error("CART_NOT_FOUND");
      }

      if (cartData.items.length === 0) {
        throw new Error("CART_EMPTY");
      }

      const orderItems = [];

      // 3. Validate all products before reducing stock
      for (const item of cartData.items) {
        const product = item.product;

        if (!product) {
          throw new Error("PRODUCT_NOT_FOUND");
        }

        if (!Number.isInteger(item.quantity) || item.quantity < 1) {
          throw new Error("INVALID_QUANTITY");
        }

        if (item.quantity > product.stock) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
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
          throw new Error(`INSUFFICIENT_STOCK:${item.name}`);
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

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    if (error.message === "CART_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    if (
      error.message === "CART_EMPTY" ||
      error.message === "PRODUCT_NOT_FOUND" ||
      error.message === "INVALID_QUANTITY"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${error.message.split(":")[1]}`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Something went wrong during checkout",
    });
  } finally {
    await session.endSession();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orderId = req.params.orderId;

    // Validate order ID
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Find order belonging to logged-in user
    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { checkout, getMyOrders, getOrderDetails };
