import { Category } from "../../models/category.js";
import { Products } from "../../models/products.js";
import mongoose from "mongoose";

export const addCategoryService = async ({ categoryName, type, description, products = [] }) => {
  if (!categoryName || !categoryName.trim()) {
    throw new Error("Category name is required");
  }

  if (!type || !['audience', 'style', 'function', 'seasonal'].includes(type)) {
    throw new Error("Invalid or missing category type");
  }

  if (!description || !description.trim()) {
    throw new Error("Category description is required");
  }

  const existing = await Category.findOne({ categoryName: categoryName });
  if (existing) {
    throw new Error("A category with this name already exists");
  }

  const newCategory = new Category({
    categoryName: categoryName,
    type,
    description: description,
  });

  const savedCategory = await newCategory.save();
  console.log('savedCategory', savedCategory);
  if (products.length > 0) {
    const validProductIds = products.filter(id => mongoose.Types.ObjectId.isValid(id));
    await Products.updateMany(
      { _id: { $in: validProductIds } },
      { $addToSet: { category: savedCategory._id } } //array
    );
  }
  console.log('products', products);

  return savedCategory;
};
