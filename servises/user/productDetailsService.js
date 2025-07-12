import { Products } from "../../models/products.js";
import { Category } from "../../models/category.js";


import mongoose from "mongoose";

export const getProductDetails = async (productId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return {
        success: false,
        message: "Invalid product ID format",
        data: null,
      };
    }

    const product = await Products.findOne({
      _id: productId,
      isBlocked: false,
      isDeleted: false,
    }).lean();

    if (!product) {
      return {
        success: false,
        message: "Product not found or is unavailable",
        data: null,
      };
    }

    const invalidCategory = await Category.findOne({
      _id: { $in: product.category },
      $or: [{ isBlocked: true }, { isDeleted: true }],
    });

    if (invalidCategory) {
      return {
        success: false,
        message: "Product has an unavailable category",
        data: null,
      };
    }

    return {
      success: true,
      message: "Product fetched successfully",
      data: product,
    };
  } catch (error) {
    console.error("Error in getProductDetails:", error.message);
    return {
      success: false,
      message: "Something went wrong while fetching product details",
      data: null,
    };
  }
};
