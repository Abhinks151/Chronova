import express from "express";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";
import { getCouponManagemntPage } from "../../controllers/adminDashboard/adminCoupionManagementController.js";


const couponRouter = express.Router()


couponRouter.get('/coupon',authenticateAdmin, getCouponManagemntPage);


export default couponRouter;
