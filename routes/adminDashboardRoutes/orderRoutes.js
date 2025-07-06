import express from "express";

import {
  approveReturn,
  cancelOrder,
  getOrderDetails,
  getOrders,
  updateItemStatus,
  updateOrderStatus,
} from "../../controllers/adminDashboard/orderController.js";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";

const adminOrderRouter = express.Router();

adminOrderRouter.get("/orders/", authenticateAdmin, getOrders);
adminOrderRouter.get("/orders/:orderId", authenticateAdmin, getOrderDetails);
adminOrderRouter.put("/orders/:orderId/status", authenticateAdmin, updateOrderStatus);
adminOrderRouter.put("/orders/:orderId/items/:itemId/status", authenticateAdmin, updateItemStatus);
adminOrderRouter.post("/orders/:orderId/items/:itemId/approve-return", authenticateAdmin, approveReturn);
adminOrderRouter.put("/orders/:orderId/cancel", authenticateAdmin, cancelOrder);

export default adminOrderRouter;
