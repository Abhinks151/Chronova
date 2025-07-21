import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import httpStatusCode from '../../utils/httpStatusCode.js';
import { registerUser } from "../../services/auth/userRegisterService.js";
import { verifyUserOTPService } from "../../services/auth/verifyUserService.js";
import { handleResendVerification } from "../../services/auth/resendVerificationCodeService.js";
import { forgotPassword } from "../../services/auth/forgotPasswordService.js";
import { handlePasswordReset, resetPassword } from "../../services/auth/resetPasswordService.js";
import { loginUserService } from '../../services/auth/userLoginService.js';

dotenv.config();

// const SALT = 10;

// const handleResponse = (req, res, status, viewName, data, jsonData = null) => {
//   if (req.xhr || req.get('Content-Type') === 'application/json') {
//     return res.status(status).json(jsonData || {
//       success: status < 400,
//       ...(data.errors && { errors: data.errors }),
//       ...(data.successMessage && { message: data.successMessage }),
//       ...(data.redirect && { redirect: data.redirect })
//     });
//   }
//   return res.status(status).render(viewName, data);
// };

// const createRenderData = (title, errors = {}, formData = {}, successMessage = null) => ({
//   title,
//   errors,
//   formData,
//   successMessage
// });

// const handleValidationErrors = (req, res, errors, viewName, title) => {
//   const errorMap = {};
//   errors.array().forEach(error => {
//     errorMap[error.param || error.path] = error.msg;
//   });

//   const renderData = createRenderData(title, errorMap, req.body);
//   return handleResponse(req, res, 400, viewName, renderData);
// };





export const getUserRegister = async (req, res) => {
  // console.log(renderData)

  try {
    res.status(httpStatusCode.OK.code).render('Layouts/userRegister', {
      title: "Register",
      successMessage: null
    });
  } catch (error) {
    console.log(error);
    res.status(httpStatusCode.BAD_REQUEST.code).json({
      error
    })
  }
};


export const postUserRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach(err => {
        formattedErrors[err.path] = err.msg;
      });
      // console.log('Stored session email:', req.session.emailForVerification);

      return res.status(httpStatusCode.BAD_REQUEST.code).json({
        success: false,
        errors: formattedErrors
      });
    }
    // console.log(req.body);
    const response = await registerUser(req, req.body);
    return res.status(response.status).json(response.body);

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      success: false,
      errors: {
        general: 'Something went wrong. Please try again.'
      }
    });
  }
};



export const getVerifyUserOTP = async (req, res) => {
  const email = req.session.emailForVerification || 'dsfs';
  console.log(email);
  try {
    res.status(httpStatusCode.OK.code).render('Layouts/userVerify', {
      title: "Verify account",
      formData: {
        email,
        otp: ''
      },
      successMessage: null
    })
  } catch (error) {
    console.log(error);
    res.status(httpStatusCode.BAD_REQUEST.code).json({
      error
    })
  }
};




export const postVerifyUserOTP = async (req, res) => {
  try {

    const result = await verifyUserOTPService(req.session, req.body);

    if (result.token) {
      const isProd = process.env.NODE_ENV === 'production';

      res.cookie('token', result.token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'Strict' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
    }

    return res.status(result.status).json({
      message: result.message,
      ...(result.redirect && { redirect: result.redirect })
    });
  } catch (error) {
    console.error('Verify OTP Controller Error:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: 'Internal server error during OTP verification.'
    });
  }
};



export const resendVerificationCode = async (req, res) => {
  try {
    const result = await handleResendVerification(req);

    return res.status(result.status).json({
      message: result.message,
    });

  } catch (error) {
    console.error('Resend Verification Error:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: 'Unable to send verification code. Please try again later.'
    });
  }
};


export const getForgotPassord = async (req, res) => {
  // const renderData = createRenderData('Forgot Password');
  // res.status(200).render('Layouts/userForgotPassword', renderData);

  try {
    res.status(httpStatusCode.OK.code).render('Layouts/userForgotPassword', {
      title: "Forgot Password",
      successMessage: null
    })
  } catch (error) {
    console.log(error);
    res.status(httpStatusCode.BAD_REQUEST.code).json({
      error
    })
  }
};

export const postForgotPassword = async (req, res) => {
  try {

    const email = req.body.email;
    console.log(email)
    await forgotPassword(email);

    return res.status(500).render('Layouts/userLogin', {
      title: 'Login',
      formData: req.body || {},
      errors: { general: "check your email" }
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: 'Something went wrong. Please try again later.'
    });
  }
};



export const getResetPassword = async (req, res) => {
  try {
    const token = req.params.token;

    if (!token) {
      return res.status(400).render("Layouts/userResetPassword", {
        token: '',
        error: "Invalid or missing token."
      });
    }

    const result = await resetPassword({ body: { token } });

    if (!result || result.error) {
      return res.status(result.status || 400).render("Layouts/userResetPassword", {
        token: '',
        error: result.error || "Token is invalid or expired."
      });
    }

    return res.status(200).render("Layouts/userResetPassword", {
      token, 
      error: null
    });

  } catch (error) {
    console.error("Error in getResetPassword:", error);
    return res.status(500).render("Layouts/userResetPassword", {
      token: '',
      error: "Internal server error."
    });
  }
};


export const postResetPassword = async (req, res) => {
  try {
    const result = await handlePasswordReset(req.body);

    return res.status(result.status).render(result.view, {
      ...result.data,
      title: result.view.includes("Login") ? "Login" : "Reset Password"
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render('Layouts/userResetPassword', {
      token: req.body.token,
      error: 'Something went wrong. Please try again later.'
    });
  }
};



export const getUserLogin = async (req, res) => {
  try {
    // const renderData = createRenderData('Login');
    // res.render('Layouts/userLogin', renderData);

    res.status(httpStatusCode.OK.code).render('Layouts/userLogin', {
      title: "Login",
      successMessage: null
    })
  } catch (error) {
    console.error('Error rendering login page:', error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      error: 'Something went wrong. Please try again later.'
    });
  }
};


export const postUserLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    const { email, password } = req.body;

    
    // console.log('Login attempt with email:', email);
    // console.log('Validation errors:', errors.array());
    // console.log(password);


    if (!errors.isEmpty()) {
      const extracted = {};
      errors.array().forEach(err => {
        extracted[err.path] = err.msg;
      });

      if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(400).json({ success: false, errors: extracted });
      }

      return res.status(400).render('Layouts/userLogin', {
        title: 'Login',
        formData: { email },
        errors: extracted
      });
    }

    const { success, token, errors: loginErrors } = await loginUserService(email, password);

    if (!success) {
      if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.status(401).json({ success: false, errors: loginErrors });
      }

      return res.status(401).render('Layouts/userLogin', {
        title: 'Login',
        formData: { email },
        errors: loginErrors
      });
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'Strict' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(200).json({ success: true, redirect: '/user/products' });
    }

    return res.redirect('/user/products');

  } catch (error) {
    console.error('Login error:', error);

    const fallback = {
      success: false,
      errors: { general: 'Something went wrong. Please try again.' }
    };

    if (req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest') {
      return res.status(500).json(fallback);
    }

    return res.status(500).render('Layouts/userLogin', {
      title: 'Login',
      formData: req.body || {},
      errors: fallback.errors
    });
  }
};

// Logout user
export const userLogout = async (req, res) => {
  res.clearCookie("token");
  res.status(httpStatusCode.OK.code).redirect('/user/login');
};

// export const showVerificationPage = async (req, res) => {
//   const { email } = req.query;
//   const renderData = createRenderData('Verify Account', {}, { email: email || '' }, '');
//   return res.render('Layouts/userVerify', renderData);
// };