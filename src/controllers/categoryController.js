const Category = require("../models/Category");
const AppError = require("../utils/AppError");

const createCategory = async (req, res) => {
  const { name, description } = req.body;

  const isExistingCat = await Category.findOne({ name });
  if (isExistingCat) {
    throw new AppError("Category already avilable", 400);
  }

  const categroy = await Category.create({
    name,
    description,
  });

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    categroy,
  });
};

const getAllCategory = async (req, res) => {
  const categroy = await Category.find();

  return res.status(200).json({
    success: true,
    message: "Category fetch successfully",
    length: categroy.length,
    categroy,
  });
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Category fetch successfully",
    category,
  });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;

  const { name, description } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (name !== undefined) {
    category.name = name;
  }

  if (description !== undefined) {
    category.description = description;
  }

  await category.save();

  return res.status(200).json({
    success: true,
    message: "Category Updated successfully",
    category,
  });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
  });
};
module.exports = {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
