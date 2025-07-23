import { Order } from "../../models/order.js";
import { getCartedProducts } from "../../services/user/cartServices.js";
import {
  getSingleOrderService,
  orderListByUserId,
  placeOrderService,
  generateInvoiceService,
  verifyRazorpayPaymentService,
  cancelEntireOrderService,
  cancelSingleItemService,
  returnOrderItemService,
  returnEntireOrderService,
  viewInvoiceService,
} from "../../services/user/orderService.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import { returnReason } from "../../utils/returnReason.js";
import { logger } from '../../config/logger.js';
import dotenv from "dotenv";

dotenv.config();


export const verifyRazorpayPayment = async (req, res) => {
  try {
    const result = await verifyRazorpayPaymentService(req.body);
    return res.status(httpStatusCode.OK.code).json(result);
  } catch (err) {
    console.error("Error verifying Razorpay payment:", err);
    return res
      .status(err.statusCode || httpStatusCode.INTERNAL_SERVER_ERROR.code)
      .json({
        success: false,
        message: err.message || "Internal Server Error",
      });
  }
};


export const getCheckoutPage = (req, res) => {
  try {
    res.render("Layouts/users/checkout", {
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      user: req.user,
    });
  } catch (error) {
    console.error("Error rendering checkout page:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong while rendering the checkout page.",
    });
  }
};

export const getCheckoutPageData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const checkoutData = await getCartedProducts(userId);

    if (!checkoutData || checkoutData.items.length === 0) {
      return res.status(httpStatusCode.OK.code).json({
        success: true,
        message: "Your cart is empty.",
        checkoutData: { items: [] },
      });
    }

    res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Checkout page data fetched successfully.",
      checkoutData,
    });
  } catch (error) {
    logger.error('Error fetching checkout page data:', error);
    console.error("Error fetching checkout page data:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong while fetching checkout page data.",
    });
  }
};

export const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const isVerifiedOnline = req.body?.isVerifiedOnline || false;

    const orderData = {
      ...req.body,
      paymentStatus: isVerifiedOnline ? "Paid" : "Pending",
      isPaid: isVerifiedOnline,
    };

    const order = await placeOrderService(userId, orderData, req, isVerifiedOnline);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Order placed successfully.",
      data: {
        orderId: order.orderId,
        razorpay_order_id: order.paymentDetails?.razorpay_order_id || null,
      },
    });
  } catch (error) {
    logger.error("Error placing order:", error);
    console.log("Error placing order:", error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong while placing the order.",
      error: error.message || "Internal Server Error",
    });
  }
};


export const getConformPage = (req, res) => {
  try {
    const { orderId } = req.query;
    res.status(httpStatusCode.OK.code).render("Layouts/users/orderConform", {
      orderId,
    });
  } catch (error) {
    logger.error('Error rendering order confirmation page:', error);
    console.error("Error rendering order confirmation page:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message:
        "Something went wrong while rendering the order confirmation page.",
    });
  }
};

export const getOrderMangementPage = (req, res) => {
  try {
    res.render("Layouts/users/orders");
  } catch (error) {
    logger.error('Error rendering order management page:', error);
    console.error("Error rendering order management page:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message:
        "Something went wrong while rendering the order management page.",
    });
  }
};

export const getOrderMangementPageData = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    if (!userId) {
      return res.status(httpStatusCode.UNAUTHORIZED.code).json({
        success: false,
        message: "User not authenticated.",
      });
    }

    const orders = await orderListByUserId(userId);

    res.json({
      success: true,
      orders,
      returnReason,
    });
  } catch (error) {
    logger.error('Error fetching orders:', error);
    console.error("Error fetching orders:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: "Something went wrong while fetching orders.",
    });
  }
};

export const getSingleOrderController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const orderId = req.params.orderId;

    if (!userId || !orderId) {
      logger.warn("User ID and Order ID are required.");
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "User ID and Order ID are required.",
      });
    }

    const order = await getSingleOrderService(userId, orderId);

    res.status(httpStatusCode.OK.code).json({
      success: true,
      order,
    });
  } catch (error) {
    logger.error('Error fetching single order:', error);
    console.error("Error fetching single order:", error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelEntireOrderController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId } = req.params;

    const result = await cancelEntireOrderService(userId, orderId);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Order cancelled successfully.",
      order: result,
    });
  } catch (error) {
    logger.error("Cancel Entire Order Controller Error:", error);

    const status = error.statusCode || httpStatusCode.INTERNAL_SERVER_ERROR.code;
    return res.status(status).json({
      success: false,
      message: error.message || "Server error while cancelling order.",
    });
  }
};



export const cancelSingleItemController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId, itemId } = req.params;

    const updatedOrder = await cancelSingleItemService(userId, orderId, itemId);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Item cancelled successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    logger.error("Cancel Single Item Controller Error:", error);
    const status = error.statusCode || httpStatusCode.INTERNAL_SERVER_ERROR.code;
    return res.status(status).json({
      success: false,
      message: error.message || "Server error while cancelling item.",
    });
  }
};



export const returnOrderItemController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId, itemId } = req.params;
    const { returnReason } = req.body;

    const updatedOrder = await returnOrderItemService(userId, orderId, itemId, returnReason);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Return request submitted successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    logger.error("Return Order Item Controller Error:", error);
    const status = error.statusCode || httpStatusCode.INTERNAL_SERVER_ERROR.code;
    return res.status(status).json({
      success: false,
      message: error.message || "Server error while requesting return.",
    });
  }
};

export const returnEntireOrderController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId } = req.params;
    const { returnReason } = req.body;

    const updatedOrder = await returnEntireOrderService(userId, orderId, returnReason);

    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Return request submitted successfully.",
      order: updatedOrder,
    });
  } catch (error) {
    logger.error("Return Entire Order Controller Error:", error);
    const status = error.statusCode || httpStatusCode.INTERNAL_SERVER_ERROR.code;
    return res.status(status).json({
      success: false,
      message: error.message || "Server error while submitting return request.",
    });
  }
};

export const viewInvoiceController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId } = req.params;

    const order = await viewInvoiceService(userId, orderId);

    return res
      .status(httpStatusCode.OK.code)
      .render("Layouts/PDFs/userOrderInvoice", { order });
  } catch (error) {
    logger.error("View Invoice Controller Error:", error);

    const status = error.statusCode || httpStatusCode.INTERNAL_SERVER_ERROR.code;
    return res.status(status).json({
      success: false,
      message:
        error.message || "Something went wrong while generating the invoice.",
    });
  }
};

export const downloadInvoiceController = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { orderId } = req.params;

    const pdfBuffer = await generateInvoiceService(userId, orderId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.status(httpStatusCode.OK.code).send(pdfBuffer);
  } catch (error) {
    logger.error("Download Invoice Controller Error:", error);
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR.code)
      .send("Error generating invoice");
  }
};


import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});


export const retryPaymentController = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user._id;

    const order = await Order.findOne({ orderId, userId }).populate("userId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Order already paid" });
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalAmount * 100,
      currency: "INR",
      receipt: `retry_${Date.now()}`,
    });

    order.razorpay = {
      orderId: razorpayOrder.id,
      receipt: razorpayOrder.receipt,
    };
    await order.save();

    res.status(200).json({
      success: true,
      order: {
        orderId: order.orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      user: {
        name: order.userId.name,
        email: order.userId.email,
        phone: order.userId.phone,
      },
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Retry Payment Error:", err);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
