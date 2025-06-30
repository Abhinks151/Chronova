import express from 'express';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js';
import { getCheckoutPage, getCheckoutPageData, getConformPage, placeOrder } from '../../controllers/user/orderManagement.js';
const userOrderRoutes = express.Router();



userOrderRoutes.get('/checkout', authenticateUser, getCheckoutPage);
userOrderRoutes.get('/checkout/data', authenticateUser, getCheckoutPageData);
userOrderRoutes.post('/order/place',authenticateUser,placeOrder);
userOrderRoutes.get('/order/conform',authenticateUser,getConformPage);

export default userOrderRoutes;