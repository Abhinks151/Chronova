import express from "express";

import { authenticateUser } from "../../middlewares/userAuthMiddleware.js";
import { createRazorpayOrder } from "../../controllers/user/razorpayController.js";

const userRazorpayRoutes = express.Router();

userRazorpayRoutes.post("/create-razorpay-order", authenticateUser,createRazorpayOrder);


export default userRazorpayRoutes;
