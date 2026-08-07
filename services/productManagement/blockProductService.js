import { Products } from '../../models/products.js';


export const blockProductService = async (productId) => {
  try {

    const updatedProduct = await Products.findOne({ _id: productId });
    // logger.info(updatedProduct);
    updatedProduct.isBlocked = !updatedProduct.isBlocked;
    await updatedProduct.save();
    return updatedProduct;
  } catch (error) {
    throw error;
  }
};