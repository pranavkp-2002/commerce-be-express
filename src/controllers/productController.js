const Product = require("../models/Product");
const Category = require("../models/Category");
const AppError = require("../utils/AppError");

const addProduct = async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  const isProduct = await Product.findOne({ name });
  if (isProduct) {
    throw new AppError("Product already added with same name", 404);
  }

  const existingCategory = await Category.findById(category);

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
    const categories = await Category.find({
      name: { $regex: search, $options: "i" },
    }).select("_id");

    const categoryIds = categories.map((cat) => cat._id);
    console.log("categoryIds", categoryIds);

    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
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
  const product = await Product.find(query)
    .populate("category", "name description")
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(limit);

  return res.status(200).json({
    success: true,
    message: "Product fetch successfully",
    page,
    limit,
    length: product.length,
    total: await Product.countDocuments(query),
    product,
  });
};

const getProductyById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
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
