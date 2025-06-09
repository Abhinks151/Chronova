import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModels.js";
import httpStatusCode from "../utils/httpStatusCode.js";



dotenv.config();



export const authenticateAdmin = async (req, res, next) => {
  try {
    const adminToken = req.cookies?.adminToken || req.header('Authorization')?.replace('Bearer ', '');
    if (!adminToken) {
      return res.redirect('/admin/login?error=unauthorized');
    }

    


    const decoded = jwt.verify(adminToken, process.env.JWT_SECRET_KEY);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.redirect('/admin/login?error=unauthorized');
    }


    if (!admin.isAdmin) {
      return res.redirect('/admin/login?error=notAdmin');
    }

    req.admin = admin;

    next();
  } catch (error) {
    console.error('Error authenticating admin:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ error: 'Internal Server Error' });
  }
}
