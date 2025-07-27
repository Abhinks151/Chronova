import { Order } from "../../models/order.js"
import { Products } from "../../models/products.js"
import Wallet from "../../models/wallet.js"
import { logStockChange } from "../../utils/logStockRegistry.js"
import {
  updateOrderPaymentStatus as updateOrderPaymentStatusService,
  updateItemPaymentStatus as updateItemPaymentStatusService,
  getOrderPaymentStatus as getOrderPaymentStatusService,
} from '../../services/adminOrderManagementService/orderService.js';


export const getOrders = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ""
    const status = req.query.status || ""
    const sortBy = req.query.sortBy || "createdAt"
    const sortOrder = req.query.sortOrder || "desc"

    const searchQuery = {}
    if (search) {
      searchQuery.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "items.productName": { $regex: search, $options: "i" } },
        { "items.brand": { $regex: search, $options: "i" } },
      ]
    }

    if (status) {
      if (status === "Return Requested") {
        searchQuery.items = {
          $elemMatch: {
            status: "Return Requested",
          },
        }
      } else {
        searchQuery.orderStatus = status
      }
    }

    const sortObj = {}
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1

    const orders = await Order.find(searchQuery).populate("userId", "name email").sort(sortObj).skip(skip).limit(limit)

    const totalOrders = await Order.countDocuments(searchQuery)
    const totalPages = Math.ceil(totalOrders / limit)

    const statuses = [
      "Pending",
      "Placed",
      "Cancelled",
      "Partially Cancelled",
      "Shipped",
      "Delivered",
      "Return Requested",
      "Partially Returned",
      "Returned",
      "Return Approved",
      "Partially Return Approved",
    ]

    res.render("Layouts/adminDashboard/orders.ejs", {
      orders,
      currentPage: page,
      totalPages,
      totalOrders,
      search,
      status,
      sortBy,
      sortOrder,
      statuses,
      limit,
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).render("error", { message: "Error fetching orders" })
  }
}



export const getOrdersData = async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder || "desc";

    const searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "shippingAddress.fullName": { $regex: search, $options: "i" } },
        { "items.productName": { $regex: search, $options: "i" } },
        { "items.brand": { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      if (status === "Return Requested") {
        searchQuery.items = {
          $elemMatch: { status: "Return Requested" },
        };
      } else {
        searchQuery.orderStatus = status;
      }
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    const orders = await Order.find(searchQuery)
      .populate("userId", "name email")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalOrders / limit);

    res.status(200).json({
      orders,
      totalOrders,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error("Error fetching orders (API):", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};




export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" })
    }

    const order = await Order.findById(orderId)
      .populate("userId", "name email phone")
      .populate("items.productId", "name description")
      .populate("items.category", "name")

    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    const returnRequestedItems = order.items.filter((item) => item.status === "Return Requested")

    res.json({
      order,
      returnRequestedItems,
    })
  } catch (error) {
    console.error("Error fetching order details:", error)
    res.status(500).json({ error: "Error fetching order details" })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    if (!orderId || !status) {
      return res.status(400).json({ error: "Order ID and status are required" })
    }

    const validStatuses = [
      "Pending",
      "Placed",
      "Cancelled",
      "Partially Cancelled",
      "Shipped",
      "Delivered",
      "Return Requested",
      "Partially Returned",
      "Returned",
      "Return Approved",
      "Partially Return Approved",
    ]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    if (status === "Shipped" || status === "Delivered") {
      order.items.forEach((item) => {
        if (item.status === "Placed" || item.status === "Shipped") {
          item.status = status
        }
      })
    }

    if (status === "Cancelled") {
      order.items.forEach((item) => {
        if (item.status !== "Delivered" && !item.status.includes("Return")) {
          item.status = "Cancelled"
          item.cancelReason = "Order cancelled by admin"
        }
      })

      order.cancellation = {
        cancelledAt: new Date(),
        cancelledBy: "Admin",
        reason: "Cancelled entire order from admin panel",
      }
    }

    order.orderStatus = status
    order.updatedAt = new Date()
    await order.save()

    return res.json({
      message: "Order status and items updated successfully",
      updatedStatus: status,
      order,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return res.status(500).json({ error: "Internal server error while updating order status" })
  }
}

export const updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params
    const { status, reason } = req.body

    if (!orderId || !itemId) {
      return res.status(400).json({ error: "Order ID and Item ID are required" })
    }

    if (!status) {
      return res.status(400).json({ error: "Status is required" })
    }

    const validItemStatuses = [
      "Placed",
      "Cancelled",
      "Shipped",
      "Delivered",
      "Return Requested",
      "Return Approved",
      "Return Rejected",
    ]
    if (!validItemStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid item status" })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    const item = order.items.find((item) => item._id.toString() === itemId)
    if (!item) {
      return res.status(404).json({ error: "Item not found in order" })
    }

    item.status = status

    if (status === "Cancelled" && reason) {
      item.cancelReason = reason
    }

    if (status === "Return Requested" && reason) {
      item.returnReason = reason
      item.returnRequestedAt = new Date()
    }

    await updateOrderStatusBasedOnItems(order)

    order.updatedAt = new Date()
    await order.save()

    res.json({ message: "Item status updated successfully", order })
  } catch (error) {
    console.error("Error updating item status:", error)
    res.status(500).json({ error: "Error updating item status" })
  }
}

export const approveReturn = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    
    // console.log("Incoming orderId:", orderId, "| itemId:", itemId);

    if (!orderId || !itemId) {
      return res.status(400).json({ error: "Order ID and Item ID are required" });
    }

    const order = await Order.findById(orderId).populate("userId", "name email");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const item = order.items.find((item) => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ error: "Item not found in order" });
    }

    if (item.status !== "Return Requested") {
      return res.status(400).json({ error: "Item is not in return request state" });
    }

    await Products.findByIdAndUpdate(item.productId, {
      $inc: { stockQuantity: item.quantity },
    });

    await logStockChange({
      productId: item.productId,
      action: "stock_in",
      quantity: item.quantity,
      reason: "Return Approved",
      updatedBy: "admin",
      userId: order.userId._id,
    });

    item.status = "Return Approved";
    item.returnProcessedAt = new Date();
    item.returnProcessedBy = "Admin";

    if (!order.returnInfo) {
      order.returnInfo = {
        totalReturnRequests: 0,
        approvedReturns: 0,
        rejectedReturns: 0,
      };
    }
    order.returnInfo.approvedReturns += 1;

    await updateOrderStatusBasedOnItems(order);

    await order.save();


    // console.log(item.price, item.discount, item.quantity,item.finalPrice);

    const refundAmount = item.netItemTotal * item.quantity;
    let wallet = await Wallet.findOne({ userId: order.userId._id });

    const transaction = {
      amount: refundAmount,
      type: "credit",
      description: `Refund for returned item: ${item.productName} (Order: ${order.orderId})`,
      timestamp: new Date(),
    };

    if (!wallet) {
      wallet = new Wallet({
        userId: order.userId._id,
        balance: refundAmount,
        transactions: [transaction],
      });
    } else {
      wallet.balance += refundAmount;
      wallet.transactions.push(transaction);
    }

    await wallet.save();

    order.refundedAmount = (order.refundedAmount || 0) + refundAmount;

    if (order.refundedAmount >= order.totalAmount) {
      order.paymentStatus = "Refunded";
    } else if (order.refundedAmount > 0) {
      order.paymentStatus = "Partially Refunded";
    }

    await order.save();

    return res.json({
      message: `Return approved successfully! ₹${refundAmount.toLocaleString("en-IN")} refunded to customer's wallet.`,
      refundAmount,
      itemStatus: item.status,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error("Error approving return:", error);
    return res.status(500).json({ error: "Internal server error during return approval" });
  }
};


export const rejectReturn = async (req, res) => {
  try {
    const { orderId, itemId } = req.params
    const { rejectionReason } = req.body

    if (!orderId || !itemId) {
      return res.status(400).json({ error: "Order ID and Item ID are required" })
    }

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({ error: "Rejection reason is required" })
    }

    const order = await Order.findById(orderId).populate("userId", "name email")
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    const item = order.items.find((item) => item._id.toString() === itemId)
    if (!item) {
      return res.status(404).json({ error: "Item not found in order" })
    }

    if (item.status !== "Return Requested") {
      return res.status(400).json({ error: "Item is not in return request state" })
    }

    item.status = "Return Rejected"
    item.returnRejectionReason = rejectionReason.trim()
    item.returnProcessedAt = new Date()
    item.returnProcessedBy = "Admin"

    if (!order.returnInfo) {
      order.returnInfo = {
        totalReturnRequests: 0,
        approvedReturns: 0,
        rejectedReturns: 0,
      }
    }
    order.returnInfo.rejectedReturns += 1

    // Auto-update order status
    await updateOrderStatusBasedOnItems(order)

    order.updatedAt = new Date()
    await order.save()

    return res.json({
      message: `Return request rejected successfully.`,
      itemStatus: item.status,
      orderStatus: order.orderStatus,
      rejectionReason: rejectionReason,
    })
  } catch (error) {
    console.error("Error rejecting return:", error)
    return res.status(500).json({ error: "Internal server error during return rejection" })
  }
}

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params
    const { reason } = req.body

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" })
    }

    if (!reason) {
      return res.status(400).json({ error: "Cancellation reason is required" })
    }

    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ error: "Order not found" })
    }

    if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
      return res.status(400).json({ error: "Cannot cancel delivered or already cancelled orders" })
    }

    order.orderStatus = "Cancelled"
    order.cancellation = {
      cancelledAt: new Date(),
      cancelledBy: "Admin",
      reason: reason,
    }

    order.items.forEach((item) => {
      if (item.status !== "Delivered" && !item.status.includes("Return")) {
        item.status = "Cancelled"
        item.cancelReason = reason
      }
    })

    await logStockChange({
      productId: item.productId,
      action: 'stock_in',
      quantity: item.quantity,
      reason: 'Product Returned',
      updatedBy: 'system',
      userId: req.user._id
    });


    order.updatedAt = new Date()
    await order.save()

    res.json({ message: "Order cancelled successfully", order })
  } catch (error) {
    console.error("Error cancelling order:", error)
    res.status(500).json({ error: "Error cancelling order" })
  }
}


async function updateOrderStatusBasedOnItems(order) {
  const itemStatuses = order.items.map((item) => item.status)
  const totalItems = order.items.length

  const statusCounts = {
    placed: itemStatuses.filter((s) => s === "Placed").length,
    cancelled: itemStatuses.filter((s) => s === "Cancelled").length,
    shipped: itemStatuses.filter((s) => s === "Shipped").length,
    delivered: itemStatuses.filter((s) => s === "Delivered").length,
    returnRequested: itemStatuses.filter((s) => s === "Return Requested").length,
    returnApproved: itemStatuses.filter((s) => s === "Return Approved").length,
    returnRejected: itemStatuses.filter((s) => s === "Return Rejected").length,
  }

  if (statusCounts.returnApproved === totalItems) {
    order.orderStatus = "Return Approved"
    order.returnInfo = {
      ...order.returnInfo,
      returnedAt: new Date(),
      approved: true,
      reason: "All items returned and approved",
    }
  } else if (statusCounts.returnApproved > 0) {
    order.orderStatus = "Partially Return Approved"
  } else if (statusCounts.returnRequested > 0) {
    if (statusCounts.returnRequested === totalItems) {
      order.orderStatus = "Return Requested"
    } else {
      order.orderStatus = "Return Requested" 
    }
  } else if (statusCounts.cancelled === totalItems) {
    order.orderStatus = "Cancelled"
  } else if (statusCounts.cancelled > 0) {
    order.orderStatus = "Partially Cancelled"
  } else if (statusCounts.delivered === totalItems) {
    order.orderStatus = "Delivered"
  } else if (statusCounts.delivered > 0) {
    order.orderStatus = "Delivered"
  } else if (statusCounts.shipped > 0) {
    order.orderStatus = "Shipped"
  } else if (statusCounts.placed === totalItems) {
    order.orderStatus = "Placed"
  }

  if (!order.returnInfo) {
    order.returnInfo = {
      totalReturnRequests: 0,
      approvedReturns: 0,
      rejectedReturns: 0,
    }
  }

  order.returnInfo.totalReturnRequests =
    statusCounts.returnRequested + statusCounts.returnApproved + statusCounts.returnRejected
}



export const updateOrderPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params
    const { paymentStatus } = req.body
    const adminId = req.admin?._id || "admin";

    const validStatuses = ["Pending", "Paid", "Failed", "Refunded", "Cancelled"]
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment status provided",
      })
    }

    if (!orderId || !paymentStatus) {
      return res.status(400).json({
        success: false,
        error: "Order ID and payment status are required",
      })
    }

    const result = await updateOrderPaymentStatusService(orderId, paymentStatus, adminId)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      })
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        orderId: orderId,
        oldPaymentStatus: result.oldPaymentStatus,
        newPaymentStatus: paymentStatus,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating order payment status:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error while updating payment status",
    })
  }
}

export const updateItemPaymentStatus = async (req, res) => {
  try {
    const { orderId, itemId } = req.params
    const { paymentStatus } = req.body
    const adminId = req.admin?._id || "admin"

    const validStatuses = ["Pending", "Paid", "Failed", "Refunded", "Cancelled"]
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        error: "Invalid payment status provided",
      })
    }

    if (!orderId || !itemId || !paymentStatus) {
      return res.status(400).json({
        success: false,
        error: "Order ID, item ID, and payment status are required",
      })
    }

    const result = await updateItemPaymentStatusService(orderId, itemId, paymentStatus, adminId)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      })
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        orderId: orderId,
        itemId: itemId,
        oldPaymentStatus: result.oldPaymentStatus,
        newPaymentStatus: paymentStatus,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error updating item payment status:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error while updating item payment status",
    })
  }
}

export const getOrderPaymentStatusController = async (req, res) => {
  try {
    const { orderId } = req.params

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: "Order ID is required",
      })
    }

    const result = await getOrderPaymentStatusService(orderId)

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      })
    }

    res.status(200).json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error("Error fetching order payment status:", error)
    res.status(500).json({
      success: false,
      error: "Internal server error while fetching payment status",
    })
  }
}