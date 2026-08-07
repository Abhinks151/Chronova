import { Category } from "../../models/category.js";
import { Products } from '../../models/products.js';
import mongoose from 'mongoose';

export const addProductService = async (productData) => {
  const {
    productName,
    description,
    price,
    salePrice,
    stockQuantity,
    category,
    brand,
    color,
    dialSize,
    weight,
    sku,
  } = productData;

  const trimmedName = productName?.trim();
  const trimmedSKU = sku?.trim();
  const trimmedColor = color?.trim();

  const enums = {
    productType: [
      "Analog", "Digital", "Smart", "Hybrid", "Automatic",
      "Mechanical", "Quartz", "Chronograph", "Skeleton",
    ],
    strapType: ["Leather", "Metal", "Rubber", "Fabric", "Silicone", "Ceramic", "NATO"],
    dialShape: ["Round", "Square", "Rectangle", "Oval", "Tonneau"],
    movement: ["Quartz", "Automatic", "Manual", "Digital", "Solar"],
    waterResistance: ["30M", "50M", "100M", "200M", "300M", "500M"],
    warranty: ["6 months", "1 year", "2 years", "3 years", "5 years", "Lifetime"],
  };

  if (!trimmedName || !/^[a-zA-Z0-9\s-_]+$/.test(trimmedName)) {
    return { error: "Product name is required and must contain only letters, numbers, spaces, hyphens, and underscores" };
  }

  if (!description || typeof description !== "string" || description.trim().length < 10) {
    return { error: "Product description is required and must be at least 10 characters long" };
  }

  const parsedPrice = Number(price);
  const parsedSalePrice = Number(salePrice);

  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return { error: "Regular price must be a valid non-negative number" };
  }

  if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
    return { error: "Sale price must be a valid non-negative number" };
  }

  if (parsedSalePrice > parsedPrice) {
    return { error: "Sale price cannot exceed the regular price" };
  }

  const parsedStock = Number(stockQuantity);
  if (isNaN(parsedStock) || parsedStock < 0) {
    return { error: "Stock quantity must be a valid non-negative number" };
  }

  if (!trimmedSKU || trimmedSKU.length < 3) {
    return { error: "SKU is required and must be at least 3 characters long" };
  }

  const skuExists = await Products.findOne({ sku: trimmedSKU });
  if (skuExists) {
    return { error: "A product with this SKU already exists" };
  }

  if (!Array.isArray(category) || !category.every(id => mongoose.Types.ObjectId.isValid(id))) {
    return { error: "Invalid category list" };
  }

  if (brand && (!/^[a-zA-Z\s]+$/.test(brand) || typeof brand !== "string")) {
    return { error: "Brand must be a string containing only letters and spaces" };
  }

  for (const [key, validValues] of Object.entries(enums)) {
    if (!validValues.includes(productData[key])) {
      return { error: `Invalid value for ${key}` };
    }
  }

  if (!trimmedColor || trimmedColor.length < 2) {
    return { error: "Color must be a valid string with at least 2 characters" };
  }

  const parsedDialSize = Number(dialSize);
  if (isNaN(parsedDialSize) || parsedDialSize < 20 || parsedDialSize > 60) {
    return { error: "Dial size must be between 20 and 60 mm" };
  }

  const parsedWeight = Number(weight);
  if (isNaN(parsedWeight) || parsedWeight < 10 || parsedWeight > 1000) {
    return { error: "Weight must be between 10g and 1000g" };
  }

  const nameExists = await Products.findOne({ productName: new RegExp(`^${trimmedName}$`, "i") });
  if (nameExists) {
    return { error: "A product with this name already exists" };
  }

  const newProduct = new Products({
    ...productData,
    productName: trimmedName,
    sku: trimmedSKU,
    color: trimmedColor,
    price: parsedPrice,
    salePrice: parsedSalePrice,
    stock: parsedStock,
    dialSize: parsedDialSize,
    weight: parsedWeight,
  });

  const savedProduct = await newProduct.save();
  return { data: savedProduct };
};

export const getCategories = async () => {
  return await Category.find({ isBlocked: false, isDeleted: false }).lean();
};

