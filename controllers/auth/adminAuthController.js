import { Admin } from "../../models/adminModels.js";
import httpStatusCode from "../../utils/httpStatusCode.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from 'express-validator';
import dotenv from "dotenv";
import { generateToken } from "../../utils/generateToken.js"
// import validate from "../../utils/validateRules.js";

dotenv.config();


export const getAdminLogin = (req, res) => {
  res.status(httpStatusCode.OK.code).render("Layouts/adminLogin", { title: "Admin Login" });
};

export const postAdminLogin = async (req, res) => {
  try {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin || !admin.isAdmin) {
      return res.status(httpStatusCode.UNAUTHORIZED.code).json({ message: 'Unauthorized: Not an admin' });
    }

    const validPass = await bcrypt.compare(password, admin.password);
    // const validPass = password === "Abhin151"
    if (!validPass) {
      return res.status(httpStatusCode.UNAUTHORIZED.code).json({ message: 'Invalid credentials' });
    }

    const adminId = admin._id;
    const token = generateToken(adminId);

    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(httpStatusCode.OK.code).json({ message: 'Admin authenticated', token, redirect: '/admin/dashboard' });

  } catch (err) {
    console.error('Admin login error:', err);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: 'Server error' });
  }
};

