const Product = require("../models/Product");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");

// Treat user input as literal text in $regex (prevents ReDoS / pattern injection)
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const addProduct = async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  const isProduct = await Product.exists({ name });
  if (isProduct) {
    throw new AppError("Product already added with same name", 404);
  }

  const existingCategory = await Category.exists({ _id: category });

  if (!existingCategory) {
    throw new AppError("Category not found", 404);
  }
  const prodcut = await Product.create({
    name,
    description,
    price,
    category,
    stock,
  });

  return res.status(201).json({
    success: true,
    message: "Product added successfully",
    prodcut,
  });
};

const getAllProduct = async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page, limit } = req.query;

  let query = {};
  if (search) {
    const pattern = escapeRegex(search);
    const categoryIds = await Category.distinct("_id", {
      name: { $regex: pattern, $options: "i" },
    });

    query = {
      $or: [
        { name: { $regex: pattern, $options: "i" } },
        { category: { $in: categoryIds } },
      ],
    };
  }

  if (category) {
    query.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  let sortOption = {};
  if (sort === "price_asc") {
    sortOption = { price: 1 };
  } else if (sort === "price_desc") {
    sortOption = { price: -1 };
  } else if (sort === "newest") {
    sortOption = { createdAt: -1 };
  }
  const [product, total] = await Promise.all([
    Product.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category", "name description")
      .lean(),
    Product.countDocuments(query),
  ]);

  return res.status(200).json({
    success: true,
    message: "Product fetch successfully",
    page,
    limit,
    length: product.length,
    total,
    product,
  });
};

const getProductyById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).lean();
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product fetch successfully",
    product,
  });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;

  const { name, description, price, category, stock } = req.body;

  const productData = await Product.findById(id);
  if (!productData) {
    throw new AppError("Product not found", 404);
  }

  if (name !== undefined) {
    productData.name = name;
  }

  if (description !== undefined) {
    productData.description = description;
  }

  if (price !== undefined) {
    productData.price = price;
  }

  if (category !== undefined) {
    productData.category = category;
  }

  if (stock !== undefined) {
    productData.stock = stock;
  }

  await productData.save();

  return res.status(200).json({
    success: true,
    message: "Product Updated successfully",
    productData,
  });
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
};

module.exports = {
  addProduct,
  getAllProduct,
  getProductyById,
  updateProduct,
  deleteProduct,
};
