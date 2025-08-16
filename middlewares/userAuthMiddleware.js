import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../models/userModels.js";
import httpStatusCode from "../utils/httpStatusCode.js";

dotenv.config();

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      const renderData = {
        title: 'Login',
        errors: { email: 'Login to your account to continue' },
        formData: {},
        successMessage: null
      };

      if (req.xhr || req.get('Content-Type') === 'application/json') {
        return res.status(httpStatusCode.UNAUTHORIZED.code).json({
          success: false,
          errors: renderData.errors
        });
      }

      return res.status(httpStatusCode.UNAUTHORIZED.code).render('Layouts/userLogin', renderData);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      const renderData = {
        title: 'Login',
        errors: { email: 'Login to your account to continue' },
        formData: {},
        successMessage: null
      };

      if (req.xhr || req.get('Content-Type') === 'application/json') {
        return res.status(httpStatusCode.UNAUTHORIZED.code).json({
          success: false,
          errors: renderData.errors
        });
      }

      return res.status(httpStatusCode.UNAUTHORIZED.code).render('Layouts/userLogin', renderData);
    }

    if (!user.isVerified) {
      const renderData = {
        title: 'Login',
        errors: { email: 'Please verify your email before logging in' },
        formData: {},
        successMessage: null
      };

      if (req.xhr || req.get('Content-Type') === 'application/json') {
        return res.status(httpStatusCode.UNAUTHORIZED.code).json({
          success: false,
          errors: renderData.errors
        });
      }

      return res.status(httpStatusCode.UNAUTHORIZED.code).render('Layouts/userLogin', renderData);
    }

    if (user.isBlocked) {
      const renderData = {
        title: 'Login',
        errors: { email: 'Your account has been blocked. Please contact the admin.' },
        formData: {},
        successMessage: null
      };

      if (req.xhr || req.get('Content-Type') === 'application/json') {
        return res.status(httpStatusCode.UNAUTHORIZED.code).json({
          success: false,
          errors: renderData.errors
        });
      }

      return res.status(httpStatusCode.UNAUTHORIZED.code).render('Layouts/userLogin', renderData);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Auth Error:", error.message);

    const renderData = {
      title: 'Login',
      errors: { email: 'Session expired or invalid. Please login again.' },
      formData: {},
      successMessage: null
    };

    if (req.xhr || req.get('Content-Type') === 'application/json') {
      return res.status(httpStatusCode.UNAUTHORIZED.code).json({
        success: false,
        errors: renderData.errors
      });
    }

    return res.status(httpStatusCode.UNAUTHORIZED.code).render('Layouts/userLogin', renderData);
  }
};

export const preventLoggedInAccess = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (decoded) {
      return res.redirect('/user/home');
    }
  } catch (error) {
    console.log(error);
  }

  next();
};
