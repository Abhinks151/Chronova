import { Category } from "../../models/category.js";
import { Products } from "../../models/products.js";
import mongoose from "mongoose";


export const addCategoryService = async ({ categoryName, type, description, products = [] }) => {
  if (!categoryName || !categoryName.trim() || !/^[a-zA-Z0-9\s]+$/i.test(categoryName)) {
    return { error: "Category name must contain only letters, numbers and spaces" };
  }

  if (!type || !['audience', 'style', 'function', 'seasonal'].includes(type)) {
    return { error: "Invalid or missing category type" };
  }

  if (!description || !description.trim() || !/^[a-zA-Z0-9\s.,]+$/i.test(description)) {
    return { error: "Category description must contain only letters, numbers, spaces, commas and periods" };
  }

  const existing = await Category.findOne({ categoryName: categoryName });
  if (existing) {
    return { error: "A category with this name already exists" };
  }

  const newCategory = new Category({
    categoryName: categoryName,
    type,
    description: description,
  });

  const savedCategory = await newCategory.save();

  if (products.length > 0) {
    const validProductIds = products.filter(id => mongoose.Types.ObjectId.isValid(id));
    await Products.updateMany(
      { _id: { $in: validProductIds } },
      { $addToSet: { category: savedCategory._id } }
    );
  }

  return { data: savedCategory };
};

