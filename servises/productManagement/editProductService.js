import { Products } from "../../models/products.js";
import httpStatusCode from "../../utils/httpStatusCode.js";


export const getProduct = async () => {
  return await Products.findById(id);
};


export const updateProductService = async (productId, body, files) => {
  try {
    const existingProduct = await Products.findById(productId);
    if (!existingProduct) {
      return {
        success: false,
        statusCode: httpStatusCode.NOT_FOUND.code,
        message: 'Product not found'
      };
    }

    if (body.sku && body.sku !== existingProduct.sku) {
      const skuExists = await Products.findOne({
        sku: body.sku,
        _id: { $ne: productId }
      });

      if (skuExists) {
        return {
          success: false,
          statusCode: httpStatusCode.BAD_REQUEST.code,
          message: 'SKU already exists. Please use a different SKU.'
        };
      }
    }

    let images = existingProduct.images;
    if (files && files.length > 0) {
      images = files.map(file => ({
        url: file.path,
        public_id: file.filename
      }));
    }

    const productData = {
      ...body,
      images,
      updatedAt: new Date()
    };

    const updatedProduct = await Products.findByIdAndUpdate(
      productId,
      productData,
      { new: true, runValidators: true }
    );

    return {
      success: true,
      message: 'Product updated successfully!',
      product: updatedProduct
    };

  } catch (error) {
    console.error('Service error in updateProductService:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message).join(', ');
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: errors
      };
    }

    if (error.code === 11000) {
      return {
        success: false,
        statusCode: httpStatusCode.BAD_REQUEST.code,
        message: 'SKU already exists. Please use a different SKU.'
      };
    }

    return {
      success: false,
      statusCode: httpStatusCode.INTERNAL_SERVER_ERROR.code,
      message: 'Failed to update product due to an internal error.'
    };
  }
};