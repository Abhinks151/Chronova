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
  getProfile,
  sentPasswordReset,
  updateUserData
} from '../../controllers/user/userProfileController.js';



userAccountRoutes.get('/profile', authenticateUser, getProfile);
userAccountRoutes.get('/send-reset-link', authenticateUser, sentPasswordReset)
userAccountRoutes.patch('/profile/update', authenticateUser, updateUserData)

userAccountRoutes.get('/profile/address', authenticateUser, getAddressMangemnt)
userAccountRoutes.get('/profile/get-address', authenticateUser, getAddress)
userAccountRoutes.post('/profile/address/add', authenticateUser, addAddress)
userAccountRoutes.put('/profile/address/edit/:id', authenticateUser, editAddress)
userAccountRoutes.patch('/profile/address/set-default/:id', authenticateUser, editDefaultById)
userAccountRoutes.delete('/profile/address/delete/:id', authenticateUser, deleteAddress)

export default userAccountRoutes;
