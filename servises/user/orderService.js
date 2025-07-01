import { Products } from "../../models/products.js";
import { Address } from "../../models/address.js";
import { Cart } from "../../models/cart.js";
import { Order } from "../../models/order.js";
import { Category } from "../../models/category.js";

export const placeOrderService = async (userId, orderData) => {
  const fullAddress = await Address.findById(orderData.shippingAddress).lean();
  if (!fullAddress) throw new Error("Shipping address not found");

  if (orderData.paymentMethod?.toLowerCase() === 'online') {
    throw new Error("Online payment is not supported yet");
  }

  const productIds = orderData.items.map(item =>
    item.productId?._id?.toString() || item.productId?.toString()
  );

  const products = await Products.find({
    _id: { $in: productIds },
    isDeleted: false,
    isBlocked: false
  }).lean();

  if (!products.length) throw new Error("No valid products found");

  const items = [];

  for (const item of orderData.items) {
    const productId = item.productId?._id?.toString() || item.productId?.toString();
    const product = products.find(p => p._id.toString() === productId);

    if (!product) throw new Error("Product not found or blocked/deleted");

    if (product.stockQuantity < item.quantity) {
      throw new Error(`${product.productName} has only ${product.stockQuantity} items left`);
    }

    // Validate all categories are active
    const validCategoryCount = await Category.countDocuments({
      _id: { $in: product.category },
      isBlocked: false,
      isDeleted: false
    });

    if (validCategoryCount !== product.category.length) {
      throw new Error(`${product.productName} has blocked or deleted category`);
    }

    items.push({
      productId: product._id,
      productName: product.productName,
      brand: product.brand,
      quantity: item.quantity,
      price: product.finalPrice || product.salePrice || product.price,
      category: product.category, // keep ObjectIds, your schema supports them
      image: {
        url: product.images?.[0]?.url || "",
        public_id: product.images?.[0]?.public_id || ""
      }
    });
  }

  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const totalAmount = orderData.total || subtotal;

  // Bulk stock decrement
  const bulkOps = items.map(item => ({
    updateOne: {
      filter: {
        _id: item.productId,
        stockQuantity: { $gte: item.quantity }
      },
      update: { $inc: { stockQuantity: -item.quantity } }
    }
  }));

  const result = await Products.bulkWrite(bulkOps);
  if (result.modifiedCount !== items.length) {
    throw new Error("Stock update failed for one or more items");
  }

  const newOrder = new Order({
    userId,
    shippingAddress: fullAddress,
    items,
    subtotal,
    discount: 0,
    totalAmount,
    paymentMethod: orderData.paymentMethod.toUpperCase(),
  });

  await newOrder.save();

  // Remove ordered items from cart
  await Cart.updateOne(
    { userId },
    { $pull: { items: { productId: { $in: productIds } } } }
  );

  return {
    orderId: newOrder._id,
    message: "Order placed successfully",
    orderDetails: {
      shippingAddress: fullAddress,
      items: newOrder.items,
      subtotal,
      totalAmount,
      paymentMethod: newOrder.paymentMethod,
    }
  };
};
