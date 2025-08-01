import { Order } from "../../models/order.js"
import Wallet from "../../models/wallet.js"

export const updateOrderPaymentStatus = async (orderId, paymentStatus, adminId) => {
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      }
    }

    const oldPaymentStatus = order.paymentStatus

    const isValidTransition = validatePaymentStatusTransition(oldPaymentStatus, paymentStatus)
    if (!isValidTransition) {
      return {
        success: false,
        error: `Invalid payment status transition from ${oldPaymentStatus} to ${paymentStatus}`,
      }
    }

    order.paymentStatus = paymentStatus
    order.updatedAt = new Date()

    switch (paymentStatus) {
      case "Paid":
        order.isPaid = true
        order.items.forEach((item) => {
          if (item.paymentStatus !== "Refunded" && item.paymentStatus !== "Cancelled") {
            item.paymentStatus = "Paid"
          }
        })
        break

      case "Failed":
        order.isPaid = false
        order.items.forEach((item) => {
          if (item.paymentStatus !== "Refunded" && item.paymentStatus !== "Cancelled") {
            item.paymentStatus = "Failed"
          }
        })
        break

      case "Refunded":
        order.isPaid = false
        if (!order.refundedAmount || order.refundedAmount === 0) {
          order.refundedAmount = order.totalAmount
        }
        order.items.forEach((item) => {
          item.paymentStatus = "Refunded"
        })
        break

      case "Cancelled":
        order.isPaid = false
        order.items.forEach((item) => {
          item.paymentStatus = "Cancelled"
        })
        break
    }

    if (!order.paymentHistory) {
      order.paymentHistory = []
    }
    order.paymentHistory.push({
      status: paymentStatus,
      previousStatus: oldPaymentStatus,
      changedBy: adminId,
      changedAt: new Date(),
      changeType: "order",
    })

    await order.save()

    if (paymentStatus === "Refunded" && order.userId) {
      await processWalletRefund(order.userId, order.refundedAmount, orderId, "Order refund")
    }

    return {
      success: true,
      message: `Order payment status updated to ${paymentStatus} successfully`,
      oldPaymentStatus: oldPaymentStatus,
    }
  } catch (error) {
    console.error("Error in updateOrderPaymentStatus:", error)
    return {
      success: false,
      error: "Failed to update order payment status",
    }
  }
}

export const updateItemPaymentStatus = async (orderId, itemId, paymentStatus, adminId) => {
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      }
    }

    const item = order.items.find((item) => item._id.toString() === itemId)
    if (!item) {
      return {
        success: false,
        error: "Item not found in order",
      }
    }

    const oldPaymentStatus = item.paymentStatus || "Pending"

    const isValidTransition = validatePaymentStatusTransition(oldPaymentStatus, paymentStatus)
    if (!isValidTransition) {
      return {
        success: false,
        error: `Invalid payment status transition from ${oldPaymentStatus} to ${paymentStatus}`,
      }
    }

    item.paymentStatus = paymentStatus;
    item.paymentStatusUpdatedAt = new Date();

    if (paymentStatus === "Refunded") {
      const refundAmount = item.price * item.quantity

      order.refundedAmount = (order.refundedAmount || 0) + refundAmount

      if (order.userId) {
        await processWalletRefund(order.userId, refundAmount, orderId, `Item refund: ${item.productName}`)
      }
    }

    await updateOrderPaymentStatusBasedOnItems(order)

    if (!order.paymentHistory) {
      order.paymentHistory = []
    }
    order.paymentHistory.push({
      status: paymentStatus,
      previousStatus: oldPaymentStatus,
      changedBy: adminId,
      changedAt: new Date(),
      changeType: "item",
      itemId: itemId,
      itemName: item.productName,
    })

    await order.save()

    return {
      success: true,
      message: `Item payment status updated to ${paymentStatus} successfully`,
      oldPaymentStatus: oldPaymentStatus,
    }
  } catch (error) {
    console.error("Error in updateItemPaymentStatus:", error)
    return {
      success: false,
      error: "Failed to update item payment status",
    }
  }
}

export const getOrderPaymentStatus = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
    if (!order) {
      return {
        success: false,
        error: "Order not found",
      }
    }

    const paymentData = {
      orderPaymentStatus: order.paymentStatus,
      isPaid: order.isPaid,
      refundedAmount: order.refundedAmount || 0,
      totalAmount: order.totalAmount,
      items: order.items.map((item) => ({
        itemId: item._id,
        productName: item.productName,
        paymentStatus: item.paymentStatus || "Pending",
        price: item.price,
        quantity: item.quantity,
      })),
    }

    return {
      success: true,
      data: paymentData,
    }
  } catch (error) {
    console.error("Error in getOrderPaymentStatus:", error)
    return {
      success: false,
      error: "Failed to fetch order payment status",
    }
  }
}
   
const validatePaymentStatusTransition = (currentStatus, newStatus) => {
  const invalidTransitions = {
    Paid: ["Pending"],
    Refunded: ["Pending", "Paid"],
    Failed: ["Pending", "Paid", "Refunded"],
    Cancelled: ["Pending", "Paid", "Refunded"],
  }

  if (currentStatus === newStatus) {
    return true
  }

  if (invalidTransitions[currentStatus] && invalidTransitions[currentStatus].includes(newStatus)) {
    return false
  }

  return true
}

const updateOrderPaymentStatusBasedOnItems = async (order) => {
  const items = order.items
  const totalItems = items.length

  const paidItems = items.filter((item) => item.paymentStatus === "Paid").length
  const refundedItems = items.filter((item) => item.paymentStatus === "Refunded").length
  const failedItems = items.filter((item) => item.paymentStatus === "Failed").length
  const cancelledItems = items.filter((item) => item.paymentStatus === "Cancelled").length

  if (paidItems === totalItems) {
    order.paymentStatus = "Paid"
    order.isPaid = true
  } else if (refundedItems === totalItems) {
    order.paymentStatus = "Refunded"
    order.isPaid = false
  } else if (failedItems === totalItems) {
    order.paymentStatus = "Failed"
    order.isPaid = false
  } else if (cancelledItems === totalItems) {
    order.paymentStatus = "Cancelled"
    order.isPaid = false
  } else if (refundedItems > 0 || failedItems > 0) {
    order.paymentStatus = "Partially Refunded"
    order.isPaid = paidItems > 0
  } else {
    order.paymentStatus = "Pending"
    order.isPaid = false
  }
}

const processWalletRefund = async (userId, amount, orderId, description) => {
  try {
    let wallet = await Wallet.findOne({ userId: userId })

    const transaction = {
      amount: amount,
      type: "credit",
      description: description,
      timestamp: new Date(),
    }

    if (!wallet) {
      wallet = new Wallet({
        userId: userId,
        balance: amount,
        transactions: [transaction],
      })
    } else {
      wallet.balance += amount
      wallet.transactions.push(transaction)
    }

    await wallet.save()
  } catch (error) {
    console.error("Error processing wallet refund:", error)
    throw error
  }
}
