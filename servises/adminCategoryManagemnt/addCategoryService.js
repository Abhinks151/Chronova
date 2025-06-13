import httpStatusCode from "../../utils/httpStatusCode.js";
import { Category } from "../../models/category.js";
import { Products } from '../../models/products.js';


export const addCategoryService = async (categoryData) => {
  const { categoryName, products } = categoryData;

  if (!categoryName || typeof categoryName !== "string" || categoryName.trim() === "") {
    const error = new Error("Category name is required");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  const categoryExist = await Category.findOne({ categoryName: categoryName.trim() });
  if (categoryExist) {
    const error = new Error("Category already exists");
    error.statusCode = httpStatusCode.CONFLICT.code;
    throw error;
  }

  const newCategory = await Category.create({ categoryName: categoryName.trim() });

  if (Array.isArray(products) && products.length > 0) {
    await Products.updateMany(
      { _id: { $in: products } },
      { $addToSet: { category: newCategory._id } }
    );
  }

  return {
    message: "Category created and products linked",
    categoryId: newCategory._id
  };
}