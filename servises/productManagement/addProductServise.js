import { Category } from "../../models/category.js";
import { Products } from '../../models/products.js';
import mongoose from 'mongoose';

export const addProductService = async (productData) => {
  const { productName, description, price, stockQuantity, category, brand } = productData;

  const parsedPrice = Number(price);
  const parsedStock = Number(stockQuantity);
  console.log(description);
  if (!productName || !productName.trim() || !/^[a-zA-Z0-9\s-_]+$/i.test(productName.trim())) {
    return { error: "Product name is required and must contain only letters, numbers, spaces, hyphens and underscores" };
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return { error: "Product description is required and must be at least 10 characters long" };
  }

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return { error: "Product price must be a valid non-negative number" };
  }

  if (isNaN(parsedStock) || parsedStock < 0) {
    return { error: "Product stock must be a valid non-negative number" };
  }

  if (!Array.isArray(category) || !category.every(id => mongoose.Types.ObjectId.isValid(id))) {
    return { error: "Invalid category id" };
  }

  if (brand && (!/^[a-zA-Z\s]+$/.test(brand) || typeof brand !== "string")) {
    return { error: "Brand must be a string containing only letters and spaces" };
  }

  const nameExists = await Products.findOne({ productName: new RegExp(`^${productName.trim()}$`, 'i') });
  if (nameExists) {
    return { error: "A product with this name already exists" };
  }

  const newProduct = new Products({
    ...productData,
    productName: productName.trim(),
    price: parsedPrice,
    stock: parsedStock,
  });

  const savedProduct = await newProduct.save();
  return { data: savedProduct };
};

export const getCategories = async () => {
  return await Category.find({ isBlocked: false, isDeleted: false }).lean();
};

