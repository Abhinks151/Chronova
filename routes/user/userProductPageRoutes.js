import express from 'express';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js'
import { getFilteredProducts, getProductListingPage } from '../../controllers/user/userProductPageController.js'
const userProductPageRoutes = express.Router();



userProductPageRoutes.get('/products',authenticateUser,getProductListingPage);
userProductPageRoutes.get('/products/filter',authenticateUser,getFilteredProducts);



export default userProductPageRoutes;