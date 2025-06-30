import { Products } from "../../models/products.js";
import { Address } from "../../models/address.js";
import { Cart } from "../../models/cart.js";
import { Order } from "../../models/order.js";

export const placeOrderService = async (userId, orderData) => {
  const fullAddress = await Address.findById(orderData.shippingAddress);
  if (!fullAddress) throw new Error("Shipping address not found");

  const productIds = orderData.items.map(item =>
    (item.productId?._id || item.productId).toString()
  );

  const products = await Products.find({
    _id: { $in: productIds },
    isDeleted: false,
    isBlocked: false
  }).lean();

  const items = orderData.items.map(item => {
    const productId = item.productId?._id || item.productId;
    const product = products.find(p => p._id.toString() === productId.toString());
    if (!product) throw new Error("Product not found");

    return {
      productId: product._id,
      productName: product.productName,
      brand: product.brand,
      quantity: item.quantity,
      price: product.finalPrice || product.salePrice || product.price,
      category: product.category.map(id => id.toString()),
      image: {
      url: product.images?.[0]?.url || "",
      public_id: product.images?.[0]?.public_id || ""
      }
    };
  });

  const subtotal = items.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  const newOrder = new Order({
    userId,
    shippingAddress: fullAddress.toObject(),
    items,
    subtotal,
    discount: 0,
    totalAmount: orderData.total || subtotal,
    paymentMethod: orderData.paymentMethod.toUpperCase()
  });

  await newOrder.save();

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
      subtotal: newOrder.subtotal,
      totalAmount: newOrder.totalAmount,
      paymentMethod: newOrder.paymentMethod,
    },
  };
};
