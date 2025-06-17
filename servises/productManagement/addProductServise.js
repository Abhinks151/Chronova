import { Category } from "../../models/category.js";
import { Products } from '../../models/products.js';

export const addProductService = async (productData) => {
  try {
    const newProduct = new Products(productData);
    const savedProduct = await newProduct.save();
    return savedProduct;
  } catch (error) {
    throw error;
  }
};




export const getCategories = async () => {
  return await Category.find({ isBlocked: false, isDeleted: false }).lean();
};
