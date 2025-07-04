import { Products } from "../models/products.js";
import { stockRegistry } from "../models/stockRegistry.js";


export const logStockChange = async ({
  productId,
  action,
  quantity,
  reason,
  updatedBy,
  userId = null,
  newStock = null, 
}) => {
  const product = await Products.findById(productId);
  if (!product) {
    console.error("Product not found in logStockChange:", productId);
    return;
  }

  const finalNewStock = typeof newStock === "number" && !isNaN(newStock)
    ? newStock
    : product.stockQuantity;

  const previousStock =
    action === "stock_in"
      ? finalNewStock - quantity
      : finalNewStock + quantity;

  if (isNaN(previousStock) || isNaN(finalNewStock)) {
    console.error(`Invalid stock numbers: prev=${previousStock}, new=${finalNewStock}`);
    return;
  }

  await stockRegistry.create({
    productId,
    productName: product.name,
    action,
    quantity,
    previousStock,
    newStock: finalNewStock,
    reason,
    updatedBy,
    userId,
  });
};

