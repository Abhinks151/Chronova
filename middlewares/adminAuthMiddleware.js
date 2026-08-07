import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModels.js";
import httpStatusCode from "../utils/httpStatusCode.js";
import { logger } from '../config/logger.js';

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
    logger.error('Error authenticating admin:', error.message);
    if (req.xhr || req.get('Content-Type') === 'application/json') {
      return res.status(httpStatusCode.UNAUTHORIZED.code).json({ error: 'Session expired or invalid. Please login again.' });
    }
    return res.redirect('/admin/login?error=unauthorized');
  }
}

