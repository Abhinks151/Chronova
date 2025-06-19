import { Products } from "../../models/products.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import mongoose from "mongoose";

export const getProduct = async (id) => {
  return await Products.findById(id);
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

    if (body.sku && body.sku !== existingProduct.sku) {
      const skuExists = await Products.findOne({
        sku: body.sku,
        _id: { $ne: productId },
      });

      if (skuExists) {
        return {
          success: false,
          statusCode: httpStatusCode.BAD_REQUEST.code,
          message: "SKU already exists. Please use a different SKU.",
        };
      }
    }

    let images = existingProduct.images;
    if (files && files.length > 0) {
      images = files.map((file) => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    const productData = {
      ...body,
      images,
      updatedAt: new Date(),
    };

    const { productName, description, price, stockQuantity, category, brand } = productData;
    const parsedPrice = Number(price);
    const parsedStock = Number(stockQuantity);

    if (!productName || !productName.trim() || !/^[a-zA-Z0-9\s]+$/i.test(productName.trim())) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Product name is required and must contain only letters , numbers and spaces",
      };
    }

    if (!description || !description.trim() || description.trim().length < 10) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Product description is required and must be at least 10 characters",
      };
    }

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Product price must be a valid non-negative number",
      };
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Product stock must be a valid non-negative number",
      };
    }

    if (!Array.isArray(category) || !category.every((id) => mongoose.Types.ObjectId.isValid(id))) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Invalid category id",
      };
    }

    if (brand && (!/^[a-zA-Z\s]+$/i.test(brand) || typeof brand !== "string")) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Brand must be a string containing only letters and spaces",
      };
    }

    const updatedProduct = await Products.findByIdAndUpdate(productId, productData, {
      new: true,
    });

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

