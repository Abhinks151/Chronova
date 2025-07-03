import express from "express"

import {
  approveReturn,
  cancelOrder,
  getOrderDetails,
  getOrders,
  updateItemStatus,
  updateOrderStatus
} from '../../controllers/adminDashboard/orderController.js';

const adminOrderRouter = express.Router()

adminOrderRouter.get("/orders/", getOrders)

adminOrderRouter.get("/orders/:orderId", getOrderDetails)

adminOrderRouter.put("/orders/:orderId/status", updateOrderStatus)

adminOrderRouter.put("/orders/:orderId/items/:itemId/status", updateItemStatus)

adminOrderRouter.post("/orders/:orderId/items/:itemId/approve-return", approveReturn)

adminOrderRouter.put("/orders/:orderId/cancel", cancelOrder)

export default adminOrderRouter
