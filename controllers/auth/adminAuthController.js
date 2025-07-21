import httpStatusCode from "../../utils/httpStatusCode.js";
import { validationResult } from 'express-validator';
import dotenv from "dotenv";
import { adminLoginService } from "../../services/auth/adminService.js";
// import validate from "../../utils/validateRules.js";

dotenv.config();


export const getAdminLogin = (req, res) => {
  try {
    res.status(httpStatusCode.OK.code).render("Layouts/adminLogin", { title: "Admin Login" });
  } catch (error) {
    console.log(error.message);
    res.status(httpStatusCode.NOT_FOUND.code).json({ message: "admin login page not fount" })
  }
};


export const postAdminLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(httpStatusCode.BAD_REQUEST.code)
        .json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const result = await adminLoginService(email, password);

    if (!result.success) {
      return res
        .status(result.status)
        .json({ message: result.message });
    }

    res.cookie('adminToken', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(result.status).json({
      message: result.message,
      token: result.token,
      redirect: '/admin/dashboard',
    });

  } catch (err) {
    console.error('Admin login error:', err);
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR.code)
      .json({ message: 'Server error' });
  }
};


export const adminLogout = async (req, res) => {
  try {
    res.clearCookie("adminToken");
    res.status(httpStatusCode.OK.code).redirect('/admin/login');
  } catch (error) {
    console.log(error.message)
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({ message: "error clearing cookie ie,logout of admi" })
  }
};