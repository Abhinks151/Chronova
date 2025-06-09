import express from "express";


//Auth routes
import userAuthRoutes from "./auth/userAuthRoute.js";
import adminAuthRoutes from "./auth/adminAuthRoutes.js";

//usermanagemnt
import adminUserManagementRouter from "./adminDashboardRoutes/adminUserManagementRoute.js"


import adminProductManagement from "./adminDashboardRoutes/adminProductManagement.js"


const indexRoutes = express.Router();


indexRoutes.use("/user", userAuthRoutes);
indexRoutes.use('/admin', adminAuthRoutes)


indexRoutes.use('/admin', adminUserManagementRouter)
indexRoutes.use('/admin', adminProductManagement);




export default indexRoutes;