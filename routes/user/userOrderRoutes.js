import express from 'express';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js';
import {
  getCheckoutPage,
  getCheckoutPageData,
  getConformPage,
  getOrderMangementPage,
  getOrderMangementPageData,
  getSingleOrderController,
  placeOrder
} from '../../controllers/user/orderManagement.js';
const userOrderRoutes = express.Router();



userOrderRoutes.get('/checkout', authenticateUser, getCheckoutPage);
userOrderRoutes.get('/checkout/data', authenticateUser, getCheckoutPageData);
userOrderRoutes.post('/order/place', authenticateUser, placeOrder);
userOrderRoutes.get('/order/conform', authenticateUser, getConformPage);
userOrderRoutes.get('/orders', authenticateUser, getOrderMangementPage)
userOrderRoutes.get('/orders/data', authenticateUser, getOrderMangementPageData)
userOrderRoutes.get('/orders/:orderId', authenticateUser, getSingleOrderController)


export default userOrderRoutes;