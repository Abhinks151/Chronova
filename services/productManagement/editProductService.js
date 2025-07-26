import { Products } from "../../models/products.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';
import { logStockChange } from "../../utils/logStockRegistry.js";

export const getProduct = async (id) => {
  return await Products.findOne({ _id: id, isBlocked: false }).lean();
};



export const updateProductService = async (productId, body, files) => {
  try {
    const existingProduct = await Products.findById(productId);
    if (!existingProduct) {
      return {
        success: false,
        statusCode: httpStatusCode.NOT_FOUND.code,
        message: "Product not found",
      };
    }

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
    } = body;

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
      return { success: false, message: "Product name is required and must contain only letters, numbers, spaces, hyphens, and underscores" };
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return { success: false, message: "Product description is required and must be at least 10 characters long" };
    }

    const parsedPrice = Number(price);
    const parsedSalePrice = Number(salePrice);

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return { success: false, message: "Regular price must be a valid non-negative number" };
    }

    if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
      return { success: false, message: "Sale price must be a valid non-negative number" };
    }

    if (parsedSalePrice > parsedPrice) {
      return { success: false, message: "Sale price cannot exceed the regular price" };
    }

    const parsedStock = Number(stockQuantity);
    if (isNaN(parsedStock) || parsedStock < 0) {
      return { success: false, message: "Stock quantity must be a valid non-negative number" };
    }

    if (!trimmedSKU || trimmedSKU.length < 3) {
      return { success: false, message: "SKU is required and must be at least 3 characters long" };
    }

    if (trimmedSKU !== existingProduct.sku) {
      const skuExists = await Products.findOne({ sku: trimmedSKU, _id: { $ne: productId } });
      if (skuExists) {
        return { success: false, message: "SKU already exists. Please use a different SKU." };
      }
    }

    if (!Array.isArray(category) || !category.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return { success: false, message: "Invalid category list" };
    }

    if (brand && (!/^[a-zA-Z\s]+$/.test(brand) || typeof brand !== "string")) {
      return { success: false, message: "Brand must be a string containing only letters and spaces" };
    }

    for (const [key, validValues] of Object.entries(enums)) {
      if (!validValues.includes(body[key])) {
        return { success: false, message: `Invalid value for ${key}` };
      }
    }

    if (!trimmedColor || trimmedColor.length < 2) {
      return { success: false, message: "Color must be a valid string with at least 2 characters" };
    }

    const parsedDialSize = Number(dialSize);
    if (isNaN(parsedDialSize) || parsedDialSize < 20 || parsedDialSize > 60) {
      return { success: false, message: "Dial size must be between 20 and 60 mm" };
    }

    const parsedWeight = Number(weight);
    if (isNaN(parsedWeight) || parsedWeight < 10 || parsedWeight > 1000) {
      return { success: false, message: "Weight must be between 10g and 1000g" };
    }

    let images = existingProduct.images || Array(4).fill(null);
    const updatedImages = [...images];

    files.forEach((file) => {
      const match = file.originalname.match(/image_(\d)\./);
      const index = match ? parseInt(match[1], 10) : null;

      if (index !== null && index >= 0 && index < 4) {
        if (images[index]?.public_id) {
          cloudinary.uploader.destroy(images[index].public_id)
            .then(res => console.log(`Deleted ${images[index].public_id}:`, res))
            .catch(err => console.error(`Error deleting ${images[index].public_id}:`, err));
        }

        updatedImages[index] = {
          url: file.path,
          public_id: file.filename,
          originalname: file.originalname,
        };
      }
    });

    const finalImages = updatedImages.filter((img) => img);
    existingProduct.images = finalImages;

    const oldStock = existingProduct.stockQuantity;
    const newStock = parsedStock;

    if (oldStock !== newStock) {
      const action = newStock > oldStock ? 'stock_in' : 'stock_out';
      const quantity = Math.abs(newStock - oldStock);
      const reason = 'Manual update by admin';

      await logStockChange({
        productId,
        action,
        quantity,
        reason,
        updatedBy: 'admin',
        previousStock: oldStock,
        newStock: newStock,
      });
    }

    const updatedProduct = await Products.findByIdAndUpdate(productId, {
      ...body,
      productName: trimmedName,
      sku: trimmedSKU,
      color: trimmedColor,
      dialSize: parsedDialSize,
      weight: parsedWeight,
      price: parsedPrice,
      salePrice: parsedSalePrice,
      stockQuantity: parsedStock,
      images: finalImages,
      updatedAt: new Date(),
    }, { new: true });

    return {
      success: true,
      message: "Product updated successfully!",
      product: updatedProduct,
    };

  } catch (error) {
    console.error("Service error in updateProductService:", error);
    return {
      success: false,
      statusCode: httpStatusCode.INTERNAL_SERVER_ERROR.code,
      message: "Failed to update product due to an internal error.",
    };
  }
};



