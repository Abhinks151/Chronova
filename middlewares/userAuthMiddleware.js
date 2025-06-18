import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "../models/userModels.js";
import httpStatusCode from "../utils/httpStatusCode.js";


dotenv.config();

const createRenderData = (title, errors = {}, formData = {}, successMessage = null) => ({
  title,
  errors,
  formData,
  successMessage
});

const handleResponse = (req, res, status, viewName, data, jsonData = null) => {
  if (req.xhr || req.get('Content-Type') === 'application/json') {
    return res.status(status).json(jsonData || {
      success: status < 400,
      ...(data.errors && { errors: data.errors }),
      ...(data.successMessage && { message: data.successMessage }),
      ...(data.redirect && { redirect: data.redirect })
    });
  }
  return res.status(status).render(viewName, data);
};




export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      const renderData = createRenderData(
        'Login',
        { email: 'Login to your account to continue' },
        {},
        null
      );
      return handleResponse(req, res, httpStatusCode.UNAUTHORIZED.code, 'Layouts/userLogin', renderData);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      const renderData = createRenderData(
        'Login',
        { email: 'Login to your account to continue' },
        {},
        null
      );
      return handleResponse(req, res, httpStatusCode.UNAUTHORIZED.code, 'Layouts/userLogin', renderData);
    }

    if (!user.isVerified) {
      const renderData = createRenderData(
        'Login',
        { email: 'Please verify your email before logging in' },
        {}, // formData
        null
      );
      return handleResponse(req, res, httpStatusCode.UNAUTHORIZED.code, 'Layouts/userLogin', renderData);
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("JWT Auth Error:", error.message);

    const renderData = createRenderData(
      'Login',
      { email: 'Session expired or invalid. Please login again.' },
      {},
      null
    );
    return handleResponse(req, res, httpStatusCode.UNAUTHORIZED.code, 'Layouts/userLogin', renderData);
  }
}


