import express from "express";

import userAuthRoutes from "./auth/userAuthRoute.js";
import googleAuthRouter from "./auth/googleRouter.js";
import userProductPageRoutes from "./user/userProductPageRoutes.js";
import userAccountRoutes from "./user/userAccountRoutes.js";
import userLandingRoutes from "./user/userLandingRoutes.js";
import userOrderRoutes from "./user/userOrderRoutes.js";
import userWalletRoutes from "./user/userWalletRoutes.js";

import adminAuthRoutes from "./auth/adminAuthRoutes.js";
import adminUserManagementRouter from "./adminDashboardRoutes/adminUserManagementRoute.js";
import adminProductManagement from "./adminDashboardRoutes/adminProductManagement.js";
import categoryRouter from "./adminDashboardRoutes/adminCategoryRoutes.js";
import adminOrderRouter from './adminDashboardRoutes/orderRoutes.js';
import adminStockRouter from "./adminDashboardRoutes/adminStockManagementRoutes.js";
import offerRouter from "./adminDashboardRoutes/adminOfferRoutes.js";
import couponRouter from "./adminDashboardRoutes/adminCouponRoutes.js";
import userRazorpayRoutes from "./user/userRazorpayRoutes.js";

const indexRoutes = express.Router();

indexRoutes.use("/user", userAuthRoutes);
indexRoutes.use("/user", userProductPageRoutes);
indexRoutes.use("/user", userLandingRoutes);
indexRoutes.use("/user", userAccountRoutes);
indexRoutes.use("/user", userOrderRoutes);
indexRoutes.use("/user", userWalletRoutes);

indexRoutes.use("/", googleAuthRouter);

indexRoutes.use("/admin", adminAuthRoutes);
indexRoutes.use("/admin", adminUserManagementRouter);
indexRoutes.use("/admin", adminProductManagement);
indexRoutes.use("/admin", categoryRouter);
indexRoutes.use("/admin", adminOrderRouter);
indexRoutes.use("/admin", adminStockRouter);
indexRoutes.use('/admin', offerRouter);
indexRoutes.use('/admin', couponRouter);


indexRoutes.use('/api',userRazorpayRoutes)

export default indexRoutes;
