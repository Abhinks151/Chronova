import express from 'express';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js'
import { getCategories, getLandingPage, getProducts } from '../../controllers/user/userLandingController.js';
const userLandingRoutes = express.Router();

// userLandingRoutes.get('/home', authenticateUser, getLandingPage);
// userLandingRoutes.get('/products/categories', authenticateUser, getCategories);
// userLandingRoutes.get('/products/category/:id', authenticateUser, getProducts);

userLandingRoutes.get('/home',getLandingPage)
userLandingRoutes.get('/products/categories',getCategories);
userLandingRoutes.get('/products/category/:id',getProducts);


export default userLandingRoutes;

