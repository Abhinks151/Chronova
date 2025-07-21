import { Products } from "../../models/products.js"

export const deleteProductService = async (productId) => {
  const product = await Products.findById(productId);
  product.isDeleted = true;
  await product.save();
};