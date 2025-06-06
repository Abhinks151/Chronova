import express from "express";

//Auth routes
import userAuthRoutes from "./auth/userAuthRoute.js"; 

const indexRoutes = express.Router();


indexRoutes.use("/user", userAuthRoutes);

export default indexRoutes;