import express from "express"
import {
  approveReturn,
  cancelOrder,
  getOrderDetails,
  getOrders,
  updateItemStatus,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateItemPaymentStatus,
  getOrderPaymentStatusController,
  rejectReturn,
  getOrdersData,
} from "../../controllers/adminDashboard/orderController.js"
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js"

const adminOrderRouter = express.Router()


adminOrderRouter.get("/orders/", authenticateAdmin, getOrders)
adminOrderRouter.get("/orders/data", authenticateAdmin, getOrdersData)
adminOrderRouter.get("/orders/:orderId", authenticateAdmin, getOrderDetails)
adminOrderRouter.put("/orders/:orderId/status", authenticateAdmin, updateOrderStatus)
adminOrderRouter.put("/orders/:orderId/items/:itemId/status", authenticateAdmin, updateItemStatus)
adminOrderRouter.post("/orders/:orderId/items/:itemId/approve-return", authenticateAdmin, approveReturn)
adminOrderRouter.post("/orders/:orderId/items/:itemId/reject-return", authenticateAdmin, rejectReturn)
adminOrderRouter.put("/orders/:orderId/cancel", authenticateAdmin, cancelOrder)
adminOrderRouter.put("/orders/:orderId/payment-status", authenticateAdmin, updateOrderPaymentStatus)
adminOrderRouter.put("/orders/:orderId/items/:itemId/payment-status", authenticateAdmin, updateItemPaymentStatus)
adminOrderRouter.get("/orders/:orderId/payment-status", authenticateAdmin, getOrderPaymentStatusController)

export default adminOrderRouter
