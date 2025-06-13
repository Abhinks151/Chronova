import express from "express";


//Auth routes
import userAuthRoutes from "./auth/userAuthRoute.js";
import adminAuthRoutes from "./auth/adminAuthRoutes.js";

//usermanagemnt
import adminUserManagementRouter from "./adminDashboardRoutes/adminUserManagementRoute.js"


import adminProductManagement from "./adminDashboardRoutes/adminProductManagement.js"
import googleAuthRouter from "./auth/googleRouter.js";


//category
import categoryRouter from "./adminDashboardRoutes/adminCategoryRoutes.js";

const indexRoutes = express.Router();


indexRoutes.use("/user", userAuthRoutes);
indexRoutes.use('/admin', adminAuthRoutes)

indexRoutes.use('/',googleAuthRouter)

indexRoutes.use('/admin', adminUserManagementRouter)
indexRoutes.use('/admin', adminProductManagement);

indexRoutes.use('/admin', categoryRouter)


export default indexRoutes;