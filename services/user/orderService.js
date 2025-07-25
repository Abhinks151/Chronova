import { Products } from "../../models/products.js";
import { Address } from "../../models/address.js";
import { Cart } from "../../models/cart.js";
import { Order } from "../../models/order.js";
import { Category } from "../../models/category.js";
import { Coupon } from "../../models/coupon.js";

import mongoose from "mongoose";
import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import * as crypto from "crypto";

import { logger } from "../../config/logger.js";
import { logStockChange } from "../../utils/logStockRegistry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




export const verifyRazorpayPaymentService = async (body) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    logger.warn("Missing required fields in Razorpay payment verification", body);
    const error = new Error("Missing required fields");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature !== razorpay_signature) {
    logger.warn("Invalid Razorpay signature", {
      received: razorpay_signature,
      expected: generatedSignature,
    });
    const error = new Error("Invalid payment signature");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    logger.warn("Order not found during payment verification", { orderId });
    const error = new Error("Order not found");
    error.statusCode = httpStatusCode.NOT_FOUND.code;
    throw error;
  }

  order.paymentStatus = "Paid";
  order.isPaid = true;
  order.paymentDetails = {
    transactionId: razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    paymentDate: new Date(),
    paymentProvider: "Razorpay",
  };

  await order.save();

  logger.info("Payment verified and order updated", { orderId });

  return {
    success: true,
    message: "Payment verified and order updated",
    orderId,
  };
};


export const placeOrderService = async (userId, orderData, req, isVerifiedOnline) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const fullAddress = await Address.findById(orderData.shippingAddress).session(session).lean();
    if (!fullAddress) throw new Error("Shipping address not found");

    if (orderData.paymentMethod === 'cod' && orderData.total > 1000) {
      throw new Error('Maximum order amount for COD is 1000');
    }

    const productIds = orderData.items.map((item) => {
      return item.productId?._id?.toString() || item.productId?.toString()
    });

    const products = await Products.find({
      _id: { $in: productIds },
      isDeleted: false,
      isBlocked: false,
    }).lean().session(session);

    if (!products.length) {
      throw new Error("No valid products found")
    };

    const items = [];

    //error add fallback
    const grossTotal = orderData.items.reduce((acc, item) => {
      const price = Number(item.offerPrice || item.price || 0);
      const quantity = Number(item.quantity || 0);
      return acc + price * quantity;
    }, 0);

    const couponDiscount = Number(orderData.discount || 0);
    let discountRatio = 0;
    if (grossTotal > 0) {
      discountRatio = couponDiscount / grossTotal;
    }

    for (const item of orderData.items) {
      const productId = item.productId?._id?.toString() || item.productId?.toString();
      const product = products.find((product) => {
        return product._id.toString() === productId;
      });

      if (!product) throw new Error("Product not found or blocked/deleted");
      const itemQty = Number(item.quantity || 0);
      if (product.stockQuantity < itemQty) {
        throw new Error(`${product.productName} has only ${product.stockQuantity} items left`);
      }

      const validCategoryCount = await Category.countDocuments({
        _id: { $in: product.category },
        isBlocked: false,
        isDeleted: false,
      }).session(session);

      if (validCategoryCount !== product.category.length) {
        throw new Error(`${product.productName} has blocked or deleted category`);
      }

      const basePrice = Number(product.finalPrice || product.salePrice || product.price || 0);
      const offerPrice = Number(item.offer?.offerPrice || basePrice || 0);
      const perUnitDiscount = +(offerPrice * discountRatio).toFixed(2);
      const netPrice = Number(offerPrice - perUnitDiscount).toFixed(2);

      for (let i = 0; i < itemQty; i++) {
        items.push({
          productId: product._id,
          productName: product.productName,
          brand: product.brand,
          quantity: 1,
          price: basePrice,
          category: product.category,
          image: {
            url: product.images?.[0]?.url || "",
            public_id: product.images?.[0]?.public_id || "",
          },
          status: "Placed",
          discount: item.offer?.discount || 0,
          finalPrice: offerPrice,
          couponDiscountPerItem: isNaN(perUnitDiscount) ? 0 : perUnitDiscount,
          netItemTotal: isNaN(netPrice) ? 0 : netPrice,
        });
      }
    }

    const subtotal = items.reduce((acc, curr) => acc + (Number(curr.finalPrice) || 0), 0);
    const totalAmount = items.reduce((acc, curr) => acc + (Number(curr.netItemTotal) || 0), 0);

    if (isNaN(subtotal) || isNaN(totalAmount)) {
      throw new Error("Subtotal or totalAmount contains invalid values");
    }

    const bulkOps = orderData.items.map((item) => ({
      updateOne: {
        filter: {
          _id: item.productId?._id || item.productId,
          stockQuantity: { $gte: item.quantity },
        },
        update: { $inc: { stockQuantity: -item.quantity } },
      },
    }));

    const result = await Products.bulkWrite(bulkOps, { session });
    if (result.modifiedCount !== orderData.items.length) {
      throw new Error("Stock update failed for one or more items");
    }

    if (orderData.coupon) {
      const coupon = await Coupon.findOne({
        coupon: orderData.coupon.code,
        isActive: true,
        isDeleted: false,
        expiryTime: { $gte: new Date() },
      }).session(session);

      if (!coupon) throw new Error("Invalid coupon code");

      const userIdStr = req.user.id || req.user._id;
      if (coupon.applicableFor.usedBy.includes(userIdStr)) {
        throw new Error("You have already used this coupon");
      }

      if (coupon.applicableFor.usageCount >= coupon.applicableFor.limit) {
        throw new Error("Coupon usage limit exceeded");
      }

      coupon.applicableFor.usedBy.push(userIdStr);
      coupon.applicableFor.usageCount += 1;
      await coupon.save({ session });
    }

    const newOrder = new Order({
      userId,
      shippingAddress: fullAddress,
      items,
      subtotal,
      discount: couponDiscount,
      totalAmount,
      paymentMethod: orderData.paymentMethod.toUpperCase(),
      coupon: orderData.coupon,
      isPaid: isVerifiedOnline,
      paymentStatus: isVerifiedOnline ? "Paid" : "Pending",
      paymentDetails: isVerifiedOnline
        ? {
          paymentProvider: "Razorpay",
          razorpay_payment_id: orderData.paymentDetails?.razorpay_payment_id,
          razorpay_order_id: orderData.paymentDetails?.razorpay_order_id,
          razorpay_signature: orderData.paymentDetails?.razorpay_signature,
        }
        : {},
    });

    await newOrder.save({ session });

    const groupedItems = {};
    for (const item of orderData.items) {
      const pid = item.productId?._id?.toString() || item.productId?.toString();
      groupedItems[pid] = (groupedItems[pid] || 0) + item.quantity;
    }

    for (const [productId, quantity] of Object.entries(groupedItems)) {
      const updatedProduct = await Products.findById(productId).session(session).lean();
      const newStock = Number(updatedProduct?.stockQuantity);
      if (!isNaN(newStock)) {
        await logStockChange({
          productId,
          action: "stock_out",
          quantity,
          reason: "Order Placed",
          updatedBy: "system",
          userId,
          newStock,
        });
      }
    }

    await Cart.updateOne(
      { userId },
      { $pull: { items: { productId: { $in: productIds } } } },
      { session }
    );

    await session.commitTransaction();

    return {
      orderId: newOrder.orderId,
      message: "Order placed successfully",
      orderDetails: {
        shippingAddress: fullAddress,
        items: newOrder.items,
        subtotal,
        totalAmount,
        paymentMethod: newOrder.paymentMethod,
      },
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};





export const orderListByUserId = async (userId) => {
  try {
    const orders = await Order.find({ userId })
      .populate(
        "items.productId",
        "productName brand images finalPrice salePrice price"
      )
      .populate("shippingAddress")
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        productId: item.productId?._id || item.productId,
      })),
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw new Error("Failed to fetch orders");
  }
};

export const getSingleOrderService = async (userId, orderId) => {
  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    throw new Error("Order not found or access denied.");
  }

  return order;
};


export const cancelEntireOrderService = async (userId, orderId) => {
  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    logger.warn(`Order not found: orderId=${orderId}, userId=${userId}`);
    const error = new Error("Order not found.");
    error.statusCode = httpStatusCode.NOT_FOUND.code;
    throw error;
  }

  if (order.orderStatus === "Cancelled") {
    logger.info(`Order already cancelled: orderId=${orderId}`);
    const error = new Error("Order already cancelled.");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  const allItemsPlaced = order.items.every(item => item.status === "Placed");
  if (!allItemsPlaced) {
    logger.warn(`Order has non-cancellable items: orderId=${orderId}`);
    const error = new Error("Only orders with all items in 'Placed' status can be cancelled.");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  for (const item of order.items) {
    await Products.findByIdAndUpdate(item.productId, {
      $inc: { stockQuantity: item.quantity },
    });

    item.status = "Cancelled";
    item.cancelReason = "Cancelled by user";

    await logStockChange({
      productId: item.productId,
      action: "stock_in",
      quantity: item.quantity,
      reason: "Order Cancelled",
      updatedBy: "system",
      userId,
    });
  }

  order.orderStatus = "Cancelled";
  order.cancellation = {
    cancelledAt: new Date(),
    cancelledBy: "User",
    reason: "Cancelled by user",
  };

  await order.save();

  logger.info(`Order cancelled successfully: orderId=${orderId}`);
  return order;
};




export const cancelSingleItemService = async (userId, orderId, itemId) => {
  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    logger.warn(`Order not found for user ${userId}, orderId=${orderId}`);
    const error = new Error("Order not found.");
    error.statusCode = httpStatusCode.NOT_FOUND.code;
    throw error;
  }

  const item = order.items.id(itemId);
  if (!item) {
    logger.warn(`Item not found in order ${orderId}, itemId=${itemId}`);
    const error = new Error("Item not found in order.");
    error.statusCode = httpStatusCode.NOT_FOUND.code;
    throw error;
  }

  if (item.status !== "Placed") {
    logger.info(`Item cannot be cancelled: itemId=${itemId}, currentStatus=${item.status}`);
    const error = new Error("Item cannot be cancelled.");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  await Products.findByIdAndUpdate(item.productId, {
    $inc: { stockQuantity: item.quantity },
  });

  item.status = "Cancelled";
  item.cancelReason = "Cancelled by user";

  await logStockChange({
    productId: item.productId,
    action: "stock_in",
    quantity: item.quantity,
    reason: "Item Cancelled",
    updatedBy: "system",
    userId,
  });

  const allItemsCancelled = order.items.every(i => i.status === "Cancelled");
  if (allItemsCancelled) {
    order.orderStatus = "Cancelled";
    order.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: "User",
      reason: "All items cancelled",
    };
    logger.info(`Entire order marked as cancelled since all items are cancelled: orderId=${orderId}`);
  }

  await order.save();

  logger.info(`Item cancelled successfully: itemId=${itemId}, orderId=${orderId}`);
  return order;
};




export const returnOrderItemService = async (userId, orderId, itemId, returnReason) => {
  if (!returnReason?.trim()) {
    logger.warn("Return reason is missing or empty.");
    const error = new Error("Return reason is required.");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    logger.warn(`Order not found: orderId=${orderId}, userId=${userId}`);
    const error = new Error("Order not found.");
    error.statusCode = httpStatusCode.NOT_FOUND.code;
    throw error;
  }

  const item = order.items.id(itemId);
  if (!item) {
    logger.warn(`Item not found in order: itemId=${itemId}, orderId=${orderId}`);
    const error = new Error("Item not found.");
    error.statusCode = httpStatusCode.NOT_FOUND.code;
    throw error;
  }

  if (item.status !== "Delivered") {
    logger.info(`Return denied: item not delivered. itemId=${itemId}, status=${item.status}`);
    const error = new Error("Only delivered items can be returned.");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  item.status = "Return Requested";
  item.returnReason = returnReason.trim();

  await order.save();

  logger.info(`Return request submitted: itemId=${itemId}, orderId=${orderId}`);
  return order;
};





export const returnEntireOrderService = async (userId, orderId, returnReason) => {
  if (!returnReason?.trim()) {
    logger.warn("Return reason missing for entire order return.");
    const error = new Error("Return reason is required.");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    logger.warn(`Order not found: orderId=${orderId}, userId=${userId}`);
    const error = new Error("Order not found.");
    error.statusCode = httpStatusCode.NOT_FOUND.code;
    throw error;
  }

  const allItemsDelivered = order.items.every(item => item.status === "Delivered");
  if (!allItemsDelivered) {
    logger.info(`Order contains non-delivered items, cannot return entire order: orderId=${orderId}`);
    const error = new Error("Only delivered orders can be returned.");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  for (const item of order.items) {
    item.status = "Return Requested";
    item.returnReason = returnReason.trim();
  }

  order.orderStatus = "Return Requested";
  order.returnRequest = {
    requestedAt: new Date(),
    requestedBy: "User",
    reason: returnReason.trim(),
  };

  await order.save();

  logger.info(`Entire order return requested: orderId=${orderId}, userId=${userId}`);
  return order;
};

export const viewInvoiceService = async (userId, orderId) => {
  if (!userId || !orderId) {
    logger.warn("Missing userId or orderId for invoice generation.");
    const error = new Error("User ID and Order ID are required.");
    error.statusCode = httpStatusCode.BAD_REQUEST.code;
    throw error;
  }

  const order = await Order.findOne({ _id: orderId, userId });

  if (!order) {
    logger.warn(`Order not found for invoice: userId=${userId}, orderId=${orderId}`);
    const error = new Error("Order not found.");
    error.statusCode = httpStatusCode.NOT_FOUND.code;
    throw error;
  }

  logger.info(`Invoice rendered for orderId=${orderId}`);
  return order;
};


export const generateInvoiceService = async (userId, orderId) => {
  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    logger.warn(`Order not found for PDF invoice: userId=${userId}, orderId=${orderId}`);
    throw new Error("Order not found or access denied.");
  }

  order.invoiceGenerated = true;
  order.save();

  const templatePath = path.join(
    __dirname,
    "../../views/Layouts/PDFs/userOrderInvoice.ejs"
  );
  const html = await ejs.renderFile(templatePath, { order });

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  logger.info(`Invoice PDF generated for orderId=${orderId}`);
  await browser.close();

  return pdfBuffer;
};

// export const generateInvoiceService = async (userId, orderId) => {
//   const order = await Order.findOne({ _id: orderId, userId });

//   if (!order) {
//     const error = new Error("Order not found.");
//     error.statusCode = httpStatusCode.NOT_FOUND.code;
//     throw error;
//   }

//   const htmlContent = await renderInvoiceTemplate(order); // Render EJS or any view engine
//   const pdfBuffer = await generatePDFBuffer(htmlContent); // Convert HTML to PDF buffer

//   return pdfBuffer;
// };


// async function updateOrderStatusBasedOnItems(order) {
//   const itemStatuses = order.items.map((item) => item.status);
//   const totalItems = order.items.length;

//   const statusCounts = {
//     placed: itemStatuses.filter((s) => s === "Placed").length,
//     cancelled: itemStatuses.filter((s) => s === "Cancelled").length,
//     shipped: itemStatuses.filter((s) => s === "Shipped").length,
//     delivered: itemStatuses.filter((s) => s === "Delivered").length,
//     returnRequested: itemStatuses.filter((s) => s === "Return Requested")
//       .length,
//     returnApproved: itemStatuses.filter((s) => s === "Return Approved").length,
//     returnRejected: itemStatuses.filter((s) => s === "Return Rejected").length,
//   };

//   if (statusCounts.returnApproved === totalItems) {
//     order.orderStatus = "Return Approved";
//   } else if (statusCounts.returnApproved > 0) {
//     order.orderStatus = "Partially Return Approved";
//   } else if (statusCounts.returnRequested > 0) {
//     if (statusCounts.returnRequested === totalItems) {
//       order.orderStatus = "Return Requested";
//     } else {
//       order.orderStatus = "Return Requested";
//     }
//   } else if (statusCounts.cancelled === totalItems) {
//     order.orderStatus = "Cancelled";
//   } else if (statusCounts.cancelled > 0) {
//     order.orderStatus = "Partially Cancelled";
//   } else if (statusCounts.delivered === totalItems) {
//     order.orderStatus = "Delivered";
//   } else if (statusCounts.delivered > 0) {
//     order.orderStatus = "Delivered";
//   } else if (statusCounts.shipped > 0) {
//     order.orderStatus = "Shipped";
//   } else if (statusCounts.placed === totalItems) {
//     order.orderStatus = "Placed";
//   }
// }

export const returnReason = ["Damaged", "Wrong Item", "Quality Issue", "Other"];


