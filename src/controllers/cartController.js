const { mongoose } = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const addToCart = async (req, res) => {
  try {
    const { product, quantity } = req.body;

    // 1. Validate product ID
    if (!mongoose.isValidObjectId(product)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer",
      });
    }

    // 3. Check whether the product exists
    const productExists = await Product.findById(product);

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (productExists.stock < 1) {
      return res.status(404).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    const user = req.user.userId;

    const cart = await Cart.findOne({ user });

    if (!cart) {
      if (quantity > productExists.stock) {
        return res.status(400).json({
          success: false,
          message: "Requested quantity exceeds available stock",
        });
      }
      const payload = {
        user: user,
        items: [{ product, quantity }],
      };

      const cart = await Cart.create(payload);

      return res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        cart,
      });
    }
    const existingItem = cart.items.find(
      (item) => item.product.toString() === product,
    );
    const requestedTotal = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (requestedTotal > productExists.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
        availableStock: productExists.stock,
        quantityAlreadyInCart: existingItem ? existingItem.quantity : 0,
      });
    }
    if (existingItem) {
      existingItem.quantity = requestedTotal;
    } else {
      cart.items.push({ product, quantity });
    }

    await cart.save();
    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cart,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const updateCart = async (req, res) => {
  try {
    const user = req.user.userId;
    const productId = req.params.id;
    const { quantity } = req.body;

    const productExists = await Product.findById(productId);

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product no longer exists",
      });
    }

    if (productExists.stock < 1) {
      return res.status(404).json({
        success: false,
        message: "Product is out of stock",
      });
    }

    if (quantity > productExists.stock) {
      return res.status(400).json({
        success: false,
        message: "Requested quantity exceeds available stock",
        availableStock: productExists.stock,
      });
    }
    const cartData = await Cart.findOne({ user: user });

    let item = cartData.items.find(
      (ele) => ele.product.toString() === productId,
    );

    item.quantity = quantity;

    await cartData.save();

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      cartData,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const deleteCart = async (req, res) => {
  try {
    const user = req.user.userId;
    const productId = req.params.id;

    const cartData = await Cart.findOne({ user: user });

    cartData.items = cartData.items.filter(
      (ele) => ele.product.toString() !== productId,
    );

    await cartData.save();
    return res.status(200).json({
      success: true,
      message: "Cart deleted successfully",
      cartData,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const getCart = async (req, res) => {
  try {
    const user = req.user.userId;

    const cartData = await Cart.findOne({ user: user }).populate(
      "items.product",
      "name price",
    );

    if (!cartData) {
      return res.status(200).json({
        success: true,
        message: "Cart fetched successfully",
        cart: {
          items: [],
          subtotal: 0,
        },
      });
    }

    const items = cartData.items
      .filter((item) => item.product != null)
      .map((ele) => ({
        product: ele.product,
        quantity: ele.quantity,
        subtotal: ele.quantity * ele.product.price,
      }));
    const subTotal = items.reduce((total, ele) => total + ele.subtotal, 0);
    const qtyTotal = items.reduce((total, ele) => total + ele.quantity, 0);

    return res.status(200).json({
      success: true,
      message: "Cart fetch successfully",
      cart: {
        items,
        subTotal,
        qtyTotal,
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

module.exports = { addToCart, deleteCart, updateCart, getCart };
