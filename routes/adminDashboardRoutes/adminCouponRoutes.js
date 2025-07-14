import express from "express";
import { authenticateAdmin } from "../../middlewares/adminAuthMiddleware.js";
import {
  addCoupon,
  deleteCoupon,
  editCoupon,
  getCouponManagementPage,
  getCouponManagementPageData,
  toggleCouponStatus,
} from "../../controllers/adminDashboard/adminCoupionManagementController.js";

const couponRouter = express.Router();

couponRouter.get("/coupon", authenticateAdmin, getCouponManagementPage);
couponRouter.get("/coupon/data", authenticateAdmin, getCouponManagementPageData);
couponRouter.post("/coupon/add", authenticateAdmin, addCoupon);
couponRouter.put("/coupon/edit/:id", authenticateAdmin, editCoupon);
couponRouter.patch("/coupon/toggle/:id", authenticateAdmin, toggleCouponStatus);
couponRouter.patch("/coupon/delete/:id", authenticateAdmin, deleteCoupon);

export default couponRouter;
