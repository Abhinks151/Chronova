import express from "express";

import userAuthRoutes from "./auth/userAuthRoute.js";
import adminAuthRoutes from "./auth/adminAuthRoutes.js";
import adminUserManagementRouter from "./adminDashboardRoutes/adminUserManagementRoute.js"
import adminProductManagement from "./adminDashboardRoutes/adminProductManagement.js"
import googleAuthRouter from "./auth/googleRouter.js";
import categoryRouter from "./adminDashboardRoutes/adminCategoryRoutes.js";
import userProductPageRoutes from "./user/userProductPageRoutes.js";
import userAccountRoutes from "./user/userAccountRoutes.js";

const indexRoutes = express.Router();


indexRoutes.use("/user", userAuthRoutes);
indexRoutes.use('/admin', adminAuthRoutes)

indexRoutes.use('/', googleAuthRouter)

indexRoutes.use('/admin', adminUserManagementRouter)
indexRoutes.use('/admin', adminProductManagement);
indexRoutes.use('/admin', categoryRouter)

indexRoutes.use('/user', userProductPageRoutes);

indexRoutes.use('/',userAccountRoutes)


export default indexRoutes;