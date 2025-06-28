import express from 'express';
const userAccountRoutes = express.Router();
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js'
import {
  addAddress,
  deleteAddress,
  editAddress,
  editDefaultById,
  getAddress,
  getAddressMangemnt,
  getChangeEmail,
  getProfile,
  postChangeEmail,
  sentPasswordReset,
  updateUserData
} from '../../controllers/user/userProfileController.js';
import {
  getWishlistController,
  getWishlistCount,
  getWishlistData,
  toggleWishlistController
} from '../../controllers/user/wishlistManagementController.js';
import {
  getCartCount,
  getCartPage,
  getCartProducts,
  postAddToCart,
  removeFormCart,
  updateCartCount
} from '../../controllers/user/cartManagement.js';



userAccountRoutes.get('/profile', authenticateUser, getProfile);
userAccountRoutes.get('/send-reset-link', authenticateUser, sentPasswordReset)
userAccountRoutes.patch('/profile/update', authenticateUser, updateUserData)
userAccountRoutes.get('/profile/change-email', authenticateUser, getChangeEmail)
userAccountRoutes.post('/profile/changeEmialVerificationCode', authenticateUser, postChangeEmail)

userAccountRoutes.get('/profile/address', authenticateUser, getAddressMangemnt)
userAccountRoutes.get('/profile/get-address', authenticateUser, getAddress)
userAccountRoutes.post('/profile/address/add', authenticateUser, addAddress)
userAccountRoutes.put('/profile/address/edit/:id', authenticateUser, editAddress)
userAccountRoutes.patch('/profile/address/set-default/:id', authenticateUser, editDefaultById)
userAccountRoutes.delete('/profile/address/delete/:id', authenticateUser, deleteAddress)

userAccountRoutes.get('/profile/wishlist', authenticateUser, getWishlistController)
userAccountRoutes.post('/profile/wishlist/toggle', authenticateUser, toggleWishlistController)
userAccountRoutes.get('/profile/wishlist/count', authenticateUser, getWishlistCount)
userAccountRoutes.get('/profile/wishlist/data', authenticateUser, getWishlistData);

userAccountRoutes.get('/cart', authenticateUser,getCartPage);
userAccountRoutes.get('/cart/count', authenticateUser, getCartCount);
userAccountRoutes.get('/cart/products', authenticateUser, getCartProducts);
userAccountRoutes.patch('/cart',authenticateUser,updateCartCount);
userAccountRoutes.post('/cart/add', authenticateUser, postAddToCart);
userAccountRoutes.delete('/cart/remove',authenticateUser,removeFormCart)

export default userAccountRoutes;