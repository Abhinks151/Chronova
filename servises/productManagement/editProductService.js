import { Products } from "../../models/products.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import mongoose from "mongoose";
import { v2 as cloudinary } from 'cloudinary';

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

    let images = existingProduct.images || Array(4).fill(null);
    const updatedImages = [...images];

    files.forEach((file) => {
      const match = file.originalname.match(/image_(\d)\./);
      const index = match ? parseInt(match[1], 10) : null;

      if (index !== null && index >= 0 && index < 4) {
        // If there's an old image in this slot, delete it from Cloudinary
        if (images[index]?.public_id) {
          cloudinary.uploader.destroy(images[index].public_id)
            .then((res) => console.log(`Deleted ${images[index].public_id}:`, res))
            .catch((err) => console.error(`Error deleting ${images[index].public_id}:`, err));
        }

        // Replace with the new image
        updatedImages[index] = {
          url: file.path,
          public_id: file.filename,
          originalname: file.originalname,
        };
      }
    });

    // Filter out nulls
    const finalImages = updatedImages.filter((img) => img);

    existingProduct.images = finalImages;

    const productData = {
      ...body,
      images: finalImages,
      updatedAt: new Date(),
    };


    const { productName, description, price, stockQuantity, category, brand } = productData;

    if (!productName || !productName.trim() || !/^[a-zA-Z0-9\s_-]+$/i.test(productName.trim())) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Product name is required and must contain only letters, numbers, - and _",
      };
    }

    if (!description || !description.trim() || description.trim().length < 10) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Product description is required and must be at least 10 characters",
      };
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: "Product price must be a valid non-negative number",
      };
    }

    if (isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
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

    // const nameExists = await Products.findOne({ productName: new RegExp(`^${productName.trim()}$`, 'i') });
    // if (nameExists) {
    //   return {
    //     status: false,
    //     statusCode: httpStatusCode.BAD_REQUEST.code,
    //     message: "Product name already exists. Please use a different name.",
    //   };
    // }

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

