import { Products } from "../../models/products.js";
import { Address } from "../../models/address.js";
import { Cart } from "../../models/cart.js";
import { Order } from "../../models/order.js";
import { Category } from "../../models/category.js";
import puppeteer from "puppeteer";
import path from "path";
import ejs from "ejs";
import { logStockChange } from "../../utils/logStockRegistry.js";
import { logger } from "../../config/logger.js";
import { fileURLToPath } from "url";
import { Coupon } from "../../models/coupon.js";

import mongoose from 'mongoose';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const placeOrderService = async (
  userId,
  orderData,
  req,
  isVerifiedOnline
) => {
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();

    const fullAddress = await Address.findById(orderData.shippingAddress)
      .session(session)
      .lean();

    if (!fullAddress) throw new Error("Shipping address not found");


    // console.log(orderData)
    if(orderData.paymentMethod === 'cod' && orderData.total > 1000){
      throw new Error('Maximum order amount for COD is 1000');
    }

    

    const productIds = orderData.items.map(
      (item) => item.productId?._id?.toString() || item.productId?.toString()
    );

    const products = await Products.find({
      _id: { $in: productIds },
      isDeleted: false,
      isBlocked: false,
    })
      .lean()
      .session(session);

    if (!products.length) throw new Error("No valid products found");

    const items = [];

    for (const item of orderData.items) {
      const productId =
        item.productId?._id?.toString() || item.productId?.toString();
      const product = products.find((p) => p._id.toString() === productId);

      if (!product) throw new Error("Product not found or blocked/deleted");

      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `${product.productName} has only ${product.stockQuantity} items left`
        );
      }

      const validCategoryCount = await Category.countDocuments({
        _id: { $in: product.category },
        isBlocked: false,
        isDeleted: false,
      }).session(session);

      if (validCategoryCount !== product.category.length) {
        throw new Error(
          `${product.productName} has blocked or deleted category`
        );
      }

      for (let i = 0; i < item.quantity; i++) {
        items.push({
          productId: product._id,
          productName: product.productName,
          brand: product.brand,
          quantity: 1,
          price: product.finalPrice || product.salePrice || product.price,
          category: product.category,
          image: {
            url: product.images?.[0]?.url || "",
            public_id: product.images?.[0]?.public_id || "",
          },
          status: "Placed",
          discount: item.offer.discount,
          finalPrice: item.offer.offerPrice,
        });
      }
    }

    const subtotal = items.reduce(
      (acc, curr) => acc + curr.price * curr.quantity,
      0
    );
    const totalAmount = orderData.total || subtotal;

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

      if (coupon.applicableFor.usedBy.includes(req.user.id || req.user._id)) {
        throw new Error("You have already used this coupon");
      }

      if (coupon.applicableFor.usageCount >= coupon.applicableFor.limit) {
        throw new Error("Coupon usage limit exceeded");
      }

      coupon.applicableFor.usedBy.push(req.user.id || req.user._id);
      coupon.applicableFor.usageCount += 1;
      await coupon.save({ session });
    }

    const discount = orderData.discount || 0;

    const newOrder = new Order({
      userId,
      shippingAddress: fullAddress,
      items,
      subtotal,
      discount,
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
      const pid =
        item.productId?._id?.toString() || item.productId?.toString();
      groupedItems[pid] = (groupedItems[pid] || 0) + item.quantity;
    }

    for (const [productId, quantity] of Object.entries(groupedItems)) {
      const updatedProduct = await Products.findById(productId)
        .session(session)
        .lean();

      const newStock = Number(updatedProduct?.stockQuantity);
      if (isNaN(newStock)) {
        console.error(`Invalid stock quantity for product ${productId}`);
        continue;
      }

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

export const cancelOrderItemService = async (userId, orderId, itemId) => {
  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    throw new Error("Order not found or access denied.");
  }

  const item = order.items.id(itemId);

  if (!item) {
    throw new Error("Item not found in this order.");
  }

  if (item.status !== "Placed") {
    throw new Error("Only items with 'Placed' status can be cancelled.");
  }

  item.status = "Cancelled";
  item.cancelReason = "Cancelled by user";

  await Products.findByIdAndUpdate(item.productId, {
    $inc: { stockQuantity: item.quantity },
  });

  // Update order status based on item statuses
  await updateOrderStatusBasedOnItems(order);

  await order.save();

  return order;
};

export const returnOrderItemService = async (
  userId,
  orderId,
  itemId,
  returnReason
) => {
  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    throw new Error("Order not found or access denied.");
  }

  const item = order.items.id(itemId);

  if (!item) {
    throw new Error("Item not found in this order.");
  }

  if (item.status !== "Delivered") {
    throw new Error("Only delivered items can be returned.");
  }

  if (item.returnReason) {
    throw new Error("Return request already submitted for this item.");
  }

  // Set status to "Return Requested" and add return reason
  item.status = "Return Requested";
  item.returnReason = returnReason;
  item.returnRequestedAt = new Date();

  // Update return info
  if (!order.returnInfo) {
    order.returnInfo = {
      totalReturnRequests: 0,
      approvedReturns: 0,
      rejectedReturns: 0,
    };
  }
  order.returnInfo.totalReturnRequests += 1;

  // Update order status based on item statuses
  await updateOrderStatusBasedOnItems(order);

  await order.save();

  return order;
};

export const returnEntireOrderService = async (
  userId,
  orderId,
  returnReason
) => {
  const order = await Order.findOne({ userId, orderId });

  if (!order) {
    throw new Error("Order not found or access denied.");
  }

  const deliveredItems = order.items.filter(
    (item) => item.status === "Delivered" && !item.returnReason
  );

  if (deliveredItems.length === 0) {
    throw new Error("No delivered items available for return.");
  }

  // Update all delivered items to return requested
  let returnRequestCount = 0;
  order.items = order.items.map((item) => {
    if (item.status === "Delivered" && !item.returnReason) {
      returnRequestCount++;
      return {
        ...item._doc,
        status: "Return Requested",
        returnReason: returnReason,
        returnRequestedAt: new Date(),
      };
    }
    return item;
  });

  // Update return info
  if (!order.returnInfo) {
    order.returnInfo = {
      totalReturnRequests: 0,
      approvedReturns: 0,
      rejectedReturns: 0,
    };
  }
  order.returnInfo.totalReturnRequests += returnRequestCount;

  // Update order status based on item statuses
  await updateOrderStatusBasedOnItems(order);

  await order.save();

  return order;
};

export const generateInvoiceService = async (userId, orderId) => {
  const order = await Order.findOne({ userId, orderId });

  if (!order) {
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

  await browser.close();

  return pdfBuffer;
};

async function updateOrderStatusBasedOnItems(order) {
  const itemStatuses = order.items.map((item) => item.status);
  const totalItems = order.items.length;

  const statusCounts = {
    placed: itemStatuses.filter((s) => s === "Placed").length,
    cancelled: itemStatuses.filter((s) => s === "Cancelled").length,
    shipped: itemStatuses.filter((s) => s === "Shipped").length,
    delivered: itemStatuses.filter((s) => s === "Delivered").length,
    returnRequested: itemStatuses.filter((s) => s === "Return Requested")
      .length,
    returnApproved: itemStatuses.filter((s) => s === "Return Approved").length,
    returnRejected: itemStatuses.filter((s) => s === "Return Rejected").length,
  };

  if (statusCounts.returnApproved === totalItems) {
    order.orderStatus = "Return Approved";
  } else if (statusCounts.returnApproved > 0) {
    order.orderStatus = "Partially Return Approved";
  } else if (statusCounts.returnRequested > 0) {
    if (statusCounts.returnRequested === totalItems) {
      order.orderStatus = "Return Requested";
    } else {
      order.orderStatus = "Return Requested";
    }
  } else if (statusCounts.cancelled === totalItems) {
    order.orderStatus = "Cancelled";
  } else if (statusCounts.cancelled > 0) {
    order.orderStatus = "Partially Cancelled";
  } else if (statusCounts.delivered === totalItems) {
    order.orderStatus = "Delivered";
  } else if (statusCounts.delivered > 0) {
    order.orderStatus = "Delivered";
  } else if (statusCounts.shipped > 0) {
    order.orderStatus = "Shipped";
  } else if (statusCounts.placed === totalItems) {
    order.orderStatus = "Placed";
  }
}

export const returnReason = ["Damaged", "Wrong Item", "Quality Issue", "Other"];
