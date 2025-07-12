import { Order } from "../../models/order.js";
import { Products } from "../../models/products.js";
import { getCartedProducts } from "../../servises/user/cartServices.js";
import {
  getSingleOrderService,
  orderListByUserId,
  placeOrderService,
  returnOrderItemService,
  returnEntireOrderService,
  generateInvoiceService,
} from "../../servises/user/orderService.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import { logStockChange } from "../../utils/logStockRegistry.js";
import { returnReason } from "../../utils/returnReason.js";

export const getCheckoutPage = (req, res) => {
  try {
    res.render("Layouts/users/checkout");
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
    const data = await placeOrderService(userId, req.body, req);
    return res.status(httpStatusCode.OK.code).json({
      success: true,
      message: "Order placed successfully.",
      data,
    });
  } catch (error) {
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

    const order = await Order.findOne({ userId, orderId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    if (order.orderStatus === "Cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Order already cancelled." });
    }

    const allItemsPlaced = order.items.every(
      (item) => item.status === "Placed"
    );
    if (!allItemsPlaced) {
      return res.status(400).json({
        success: false,
        message:
          "Only orders with all items in 'Placed' status can be cancelled.",
      });
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

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Error cancelling entire order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while cancelling entire order.",
    });
  }
};

export const cancelSingleItemController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId, itemId } = req.params;

    const order = await Order.findOne({ userId, orderId });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in order." });
    }

    if (item.status !== "Placed") {
      return res
        .status(400)
        .json({ success: false, message: "Item cannot be cancelled." });
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

    const allItemsCancelled = order.items.every(
      (i) => i.status === "Cancelled"
    );
    if (allItemsCancelled) {
      order.orderStatus = "Cancelled";
      order.cancellation = {
        cancelledAt: new Date(),
        cancelledBy: "User",
        reason: "All items cancelled",
      };
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Item cancelled successfully.",
      order,
    });
  } catch (error) {
    console.error("Error cancelling item:", error);
    return res.status(500).json({
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

    if (!returnReason?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Return reason is required." });
    }

    const order = await Order.findOne({ userId, orderId });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });

    const item = order.items.id(itemId);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });

    if (item.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Only delivered items can be returned.",
      });
    }

    item.status = "Return Requested";
    item.returnReason = returnReason.trim();

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Return request submitted successfully.",
      order,
    });
  } catch (error) {
    console.error("Error returning item:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Return failed." });
  }
};

export const returnEntireOrderController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId } = req.params;
    const { returnReason } = req.body;

    if (!returnReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Return reason is required.",
      });
    }

    const order = await Order.findOne({ userId, orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const allEligible = order.items.every(
      (item) => item.status === "Delivered"
    );
    if (!allEligible) {
      return res.status(400).json({
        success: false,
        message: "Only delivered orders can be returned.",
      });
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

    return res.status(200).json({
      success: true,
      message: "Return request submitted successfully.",
      order,
    });
  } catch (error) {
    console.error("Error returning entire order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Return failed.",
    });
  }
};

export const ViewInvoiceController = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { orderId } = req.params;

    if (!userId || !orderId) {
      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        message: "User ID and Order ID are required.",
      });
    }

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res
      .status(httpStatusCode.OK.code)
      .render("Layouts/PDFs/userOrderInvoice", { order });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      message:
        error.message || "Something went wrong while generating the invoice.",
    });
  }
};

export const downloadInvoiceController = async (req, res) => {
  try {
    const pdfBuffer = await generateInvoiceService(
      req.user.id || req.user._id,
      req.params.orderId
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating invoice");
  }
};
