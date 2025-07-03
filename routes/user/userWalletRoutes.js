import express from 'express';
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js'
import {
  getFilteredWalletHistory,
  getWalletHistory,
  getWalletPage
} from '../../controllers/user/walletmanagement.js';

const userWalletRoutes = express.Router();

userWalletRoutes.get('/wallet', authenticateUser, getWalletPage);
userWalletRoutes.get('/wallet/data', authenticateUser, getWalletHistory);
userWalletRoutes.get('/wallet/filter', authenticateUser, getFilteredWalletHistory);


export default userWalletRoutes;