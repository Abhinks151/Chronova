import {Products} from '../../models/products.js';

export const addProductService = async (productData) => {
  try {
    const newProduct = new Products(productData);
    const savedProduct = await newProduct.save();
    return savedProduct;
  } catch (error) {
    throw error;
  }
};

