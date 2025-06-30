import express from 'express';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js';
import { getCheckoutPage, getCheckoutPageData } from '../../controllers/user/checkoutManagement.js';
const userOrderRoutes = express.Router();



userOrderRoutes.get('/checkout', authenticateUser, getCheckoutPage);
userOrderRoutes.get('/checkout/data', authenticateUser, getCheckoutPageData);

export default userOrderRoutes;