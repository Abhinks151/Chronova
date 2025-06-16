import { Products } from '../../models/products.js';


export const getProductDetails = async (productId) => {
  try {
    const product = await Products.findOne({
      _id: productId,
      isBlocked: false,
      isDeleted: false
    })
      .lean()

    if(!product) throw new Error("Product missing");  
    return product
  } catch (error) {
    console.error('Error in getProductDetails:', error);
    throw error;
  }
}

