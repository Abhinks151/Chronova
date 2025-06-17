import { Category } from "../../models/category.js";
import { Products } from '../../models/products.js';
import mongoose from 'mongoose';



export const addProductService = async (productData) => {
  const { productName, description, price, stockQuantity, category, brand } = productData;

  const parsedPrice = Number(price);
  const parsedStock = Number(stockQuantity);


  if (!productName || !productName.trim()) {
    return { error: "Product name is required" };
  }

  if (!description || !description.trim()) {
    return { error: "Product description is required" };
  }

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return { error: "Product price must be a valid non-negative number" };
  }

  if (isNaN(parsedStock) || parsedStock < 0) {
    return { error: "Product stock must be a valid non-negative number" };
  }

  if (
    !Array.isArray(category) || !category.every(id => mongoose.Types.ObjectId.isValid(id))
  ) {
    return { error: "Invalid category id" };
  }

  if (brand && typeof brand !== "string") {
    return { error: "Brand must be a string" };
  }

  const nameExists = await Products.findOne({ productName: productName.trim() });
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
