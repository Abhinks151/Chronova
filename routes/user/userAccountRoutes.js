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
  getWishlistCount,
  toggleWishlistController
} from '../../controllers/user/wishlistManagementController.js';



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

userAccountRoutes.post('/profile/wishlist/toggle', authenticateUser, toggleWishlistController)
userAccountRoutes.get('/profile/wishlist/count', authenticateUser, getWishlistCount)

export default userAccountRoutes;
