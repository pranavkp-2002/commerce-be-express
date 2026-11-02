const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");

const addToCart = async (req, res) => {
  const { product, quantity } = req.body;

  // Check whether the product exists
  const productExists = await Product.findById(product);

  if (!productExists) {
    throw new AppError("Product not found", 404);
  }

  if (productExists.stock < 1) {
    throw new AppError("Product is out of stock", 404);
  }

  const user = req.user.userId;

  const cart = await Cart.findOne({ user });

  if (!cart) {
    if (quantity > productExists.stock) {
      throw new AppError("Requested quantity exceeds available stock", 400);
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
    throw new AppError("Requested quantity exceeds available stock", 400, {
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
};

const updateCart = async (req, res) => {
  const user = req.user.userId;
  const productId = req.params.id;
  const { quantity } = req.body;

  const productExists = await Product.findById(productId);

  if (!productExists) {
    throw new AppError("Product no longer exists", 404);
  }

  if (productExists.stock < 1) {
    throw new AppError("Product is out of stock", 404);
  }

  if (quantity > productExists.stock) {
    throw new AppError("Requested quantity exceeds available stock", 400, {
      availableStock: productExists.stock,
    });
  }
  const cartData = await Cart.findOne({ user: user });

  let item = cartData?.items.find(
    (ele) => ele.product.toString() === productId,
  );

  if (!item) {
    throw new AppError("Product not found in cart", 404);
  }

  item.quantity = quantity;

  await cartData.save();

  return res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    cartData,
  });
};

const deleteCart = async (req, res) => {
  const user = req.user.userId;
  const productId = req.params.id;

  const cartData = await Cart.findOne({ user: user });

  if (!cartData) {
    throw new AppError("Cart not found", 404);
  }

  cartData.items = cartData.items.filter(
    (ele) => ele.product.toString() !== productId,
  );

  await cartData.save();
  return res.status(200).json({
    success: true,
    message: "Cart deleted successfully",
    cartData,
  });
};

const getCart = async (req, res) => {
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
};

module.exports = { addToCart, deleteCart, updateCart, getCart };
