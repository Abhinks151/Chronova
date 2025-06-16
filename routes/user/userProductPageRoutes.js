import express from 'express';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js'
import { getFilteredProducts, getProductListingPage } from '../../controllers/user/userProductPageController.js'
import { featuredProducts, productDetails } from '../../controllers/user/userProductDetailsController.js';
const userProductPageRoutes = express.Router();



userProductPageRoutes.get('/products',authenticateUser,getProductListingPage);
userProductPageRoutes.get('/products/filter',authenticateUser,getFilteredProducts);
userProductPageRoutes.get('/product/:id',authenticateUser,productDetails);
userProductPageRoutes.get('/product/filter/:id',authenticateUser,featuredProducts);



export default userProductPageRoutes;