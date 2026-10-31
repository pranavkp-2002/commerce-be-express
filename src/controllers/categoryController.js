const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const normalizedName = name.trim();

    const isExistingCat = await Category.findOne({
      name: normalizedName,
    });
    if (isExistingCat) {
      return res.status(400).json({
        success: false,
        message: "Category already avilable",
      });
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
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const categroy = await Category.find();

    return res.status(200).json({
      success: true,
      message: "Category fetch successfully",
      length: categroy.length,
      categroy,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category fetch successfully",
      category,
    });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description } = req.body;
    if (!name) {
      return res.status(404).json({
        success: false,
        message: "Name is requied",
      });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      category.name = name.trim();
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
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
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
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
