import express from "express"
import {
  getCheckoutPage,
  getCheckoutPageData,
  placeOrder,
  getConformPage,
  getOrderMangementPage,
  getOrderMangementPageData,
  getSingleOrderController,
  returnOrderItemController,
  returnEntireOrderController,
  downloadInvoiceController,
  cancelSingleItemController,
  cancelEntireOrderController,
  verifyRazorpayPayment,
  retryPaymentController,
  viewInvoiceController,
} from "../../controllers/user/orderManagement.js"
import { authenticateUser } from "../../middlewares/userAuthMiddleware.js"
import { getAllActiveCoupons } from "../../controllers/adminDashboard/adminCoupionManagementController.js"
import { createRazorpayOrder } from "../../controllers/user/razorpayController.js"

const router = express.Router()


// Checkout routes
router.get("/checkout", authenticateUser, getCheckoutPage)
router.get("/checkout/data", authenticateUser, getCheckoutPageData)
router.get("/checkout/coupon/data", authenticateUser, getAllActiveCoupons)
router.post("/order/place", authenticateUser, placeOrder)
router.get("/order/conform", authenticateUser, getConformPage)

// Order management 
router.get("/orders", authenticateUser, getOrderMangementPage)
router.get("/orders/data", authenticateUser, getOrderMangementPageData)
router.get("/orders/:orderId", authenticateUser, getSingleOrderController)

router.post("/orders/:orderId/cancel", authenticateUser, cancelEntireOrderController);
router.post("/orders/:orderId/cancel/:itemId", authenticateUser, cancelSingleItemController);
router.post("/orders/:orderId/return/:itemId", authenticateUser, returnOrderItemController)
router.post("/orders/:orderId/return", authenticateUser, returnEntireOrderController)

router.get("/orders/invoice/:orderId", authenticateUser, viewInvoiceController)
router.get("/orders/invoice/download/:orderId", authenticateUser, downloadInvoiceController)



router.post("/verify-payment", authenticateUser, verifyRazorpayPayment);
router.post("/create-razorpay-order", authenticateUser, createRazorpayOrder);
router.post("/retry-payment", authenticateUser, retryPaymentController);


export default router
