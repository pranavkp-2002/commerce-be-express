const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      price === undefined ||
      price === null ||
      price === "" ||
      !mongoose.isValidObjectId(category)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid name, price, and category are required",
      });
    }

    const isProduct = await Product.findOne({ name });
    if (isProduct) {
      return res.status(404).json({
        success: false,
        message: "Product already added with same name",
      });
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
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
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    if (page < 1 || limit < 5) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be greater than 0",
      });
    }
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

    if (mongoose.isValidObjectId(category)) {
      query.category = category;
    }

    if (minPrice < 0 && maxPrice > 0) {
      query.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    } else if (minPrice < 0) {
      query.price = { $gte: parseFloat(minPrice) };
    } else if (maxPrice > 0) {
      query.price = { $lte: parseFloat(maxPrice) };
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
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    return res.status(200).json({
      success: true,
      message: "Product fetch successfully",
      page: parseInt(page),
      limit: parseInt(limit),
      length: product.length,
      total: await Product.countDocuments(query),
      product,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const getProductyById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetch successfully",
      product,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, price, category, stock } = req.body;

    const productData = await Product.findById(id);
    if (!productData) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
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
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
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
  addProduct,
  getAllProduct,
  getProductyById,
  updateProduct,
  deleteProduct,
};
