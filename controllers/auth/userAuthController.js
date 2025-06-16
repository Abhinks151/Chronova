import { User } from "../../models/userModels.js";
import { generateToken } from '../../utils/generateToken.js';
import crypto from "crypto";
import bcrypt from "bcrypt";
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';
import { sendResetPasswordToken, sendVerificationOTP, sendWelcome } from "../../utils/sendVerificationOTP.js";
import { sendWelcomeEmail } from "../../servises/emailService.js";

dotenv.config();

const SALT = 10;

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

const createRenderData = (title, errors = {}, formData = {}, successMessage = null) => ({
  title,
  errors,
  formData,
  successMessage
});

const handleValidationErrors = (req, res, errors, viewName, title) => {
  const errorMap = {};
  errors.array().forEach(error => {
    errorMap[error.param || error.path] = error.msg;
  });

  const renderData = createRenderData(title, errorMap, req.body);
  return handleResponse(req, res, 400, viewName, renderData);
};

export const getUserRegister = async (req, res) => {
  const renderData = createRenderData('Register');
  res.status(200).render('Layouts/userRegister', renderData);
};

export const postUserRegister = async (req, res) => {
  try {



    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationErrors(req, res, errors, 'Layouts/userRegister', 'Register');
    }

    const { firstname, lastname, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      const renderData = createRenderData('Register', { confirmPassword: 'Passwords do not match' }, req.body);
      return handleResponse(req, res, 400, 'Layouts/userRegister', renderData);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const renderData = createRenderData('Register', { email: 'User already exists with this email' }, req.body);
      return handleResponse(req, res, 400, 'Layouts/userRegister', renderData);
    }

    const hashedPassword = await bcrypt.hash(password, SALT);
    const newUser = new User({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();

    await sendVerificationOTP(newUser);

    const successMsg = 'Registration successful! Please check your email for the verification OTP.';
    const renderData = createRenderData('Register', {}, {}, successMsg);
    const jsonData = { success: true, message: successMsg, redirect: '/user/verify-otp' };

    return handleResponse(req, res, 201, 'Layouts/userRegister', renderData, jsonData);

  } catch (error) {
    console.error('Registration error:', error);
    const renderData = createRenderData('Register', { general: 'Something went wrong. Please try again.' }, req.body || {});
    return handleResponse(req, res, 500, 'Layouts/userRegister', renderData);
  }
};

export const getVerifyUserOTP = async (req, res) => {
  const email = req.query.email || '';
  const renderData = createRenderData('Verify Account', {}, { email, otp: '' }, '');
  res.status(200).render('Layouts/userVerify', renderData);
};



export const postVerifyUserOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: 'Account already verified. Please log in.', redirect: '/user/login' });
    }

    if (!user.verificationToken || !user.verificationTokenExpireAt) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    if (new Date() > user.verificationTokenExpireAt) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (user.verificationToken !== hashedOTP) {
      return res.status(400).json({ message: 'Invalid verification code. Please try again.' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpireAt = undefined;
    await user.save();
    sendWelcome(user);
    return res.status(200).json({ message: 'Account verified successfully.', redirect: '/user/login' });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ message: 'Unable to verify account. Please try again later.' });
  }
};


// Resend verification code

export const resendVerificationCode = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Return first error in JSON format
      const errorMsg = errors.array()[0].msg || 'Validation error';
      return res.status(400).json({ message: errorMsg });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'No user found with this email address.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please log in.' });
    }

    await sendWelcome(user);
    return res.status(200).json({
      message: 'Verification code sent successfully. Please check your inbox.'
    });

  } catch (error) {
    console.error('Resend Verification Error:', error);
    return res.status(500).json({
      message: 'Unable to send verification code. Please try again later.'
    });
  }
};


// GET forgot password page
export const getForgotPassord = async (req, res) => {
  const renderData = createRenderData('Forgot Password');
  res.status(200).render('Layouts/userForgotPassword', renderData);
};

export const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await sendResetPasswordToken(user);

    res.status(200).json({ message: 'Password reset email sent successfully' });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
};

// GET reset password page
export const getResetPassword = async (req, res) => {
  const { token } = req.params;

  try {
    // const hashedToken = hashOTP(token);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).render('Layouts/invalidResetToken', {
        error: 'Reset link is invalid or has expired.'
      });
    }

    res.render('Layouts/userResetPassword', { token });

  } catch (error) {
    console.error('Error in getResetPassword:', error);
    res.status(500).render('Layouts/error', {
      error: 'Something went wrong. Please try again later.'
    });
  }
};

export const postResetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;
    console.log(token, password, confirmPassword);
    if (!token || !password || !confirmPassword) {
      return res.status(400).render('Layouts/userResetPassword', {
        token,
        error: 'All fields are required.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).render('Layouts/userResetPassword', {
        token,
        error: 'Passwords do not match.'
      });
    }

    // const hashedToken = hashOTP(token);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).render('Layouts/userResetPassword', {
        token,
        error: 'Reset link is invalid or has expired.'
      });
    }

    user.password = await bcrypt.hash(password, SALT);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const renderData = createRenderData('Login');
    res.render('Layouts/userLogin', renderData);

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).render('Layouts/userResetPassword', {
      token: req.body.token,
      error: 'Something went wrong. Please try again.'
    });
  }
};


// GET login page
export const getUserLogin = async (req, res) => {
  try {
    const renderData = createRenderData('Login');
    res.render('Layouts/userLogin', renderData);
  } catch (error) {
    console.error('Error rendering login page:', error);
    res.status(500).send('Internal Server Error');
  }
};

// POST login
export const postUserLogin = async (req, res) => {
  try {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationErrors(req, res, errors, 'Layouts/userLogin', 'Login');
    }

    const { email, password } = req.body;

    // Find and validate user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const renderData = createRenderData('Login', { email: 'Invalid email or password' }, { email });
      return handleResponse(req, res, 401, 'Layouts/userLogin', renderData);
    }

    if (!user.isVerified) {
      const renderData = createRenderData('Login', { email: 'Please verify your email before logging in' }, { email });
      return handleResponse(req, res, 403, 'Layouts/userLogin', renderData);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const renderData = createRenderData('Login', { password: 'Invalid email or password' }, { email });
      return handleResponse(req, res, 401, 'Layouts/userLogin', renderData);
    }

    // Login successful - generate token and set cookie
    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save();

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'Strict' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Handle response format
    if (req.xhr || req.get('Content-Type') === 'application/json') {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        redirect: '/user/products',
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    }

    return res.redirect('/user');

  } catch (error) {
    console.error('Login error:', error);
    const renderData = createRenderData('Login', { general: 'Something went wrong. Please try again.' }, req.body || {});
    return handleResponse(req, res, 500, 'Layouts/userLogin', renderData);
  }
};

// Logout user
export const userLogout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).redirect('/user/login');
};

// Optional: Show verification page
// export const showVerificationPage = async (req, res) => {
//   const { email } = req.query;
//   const renderData = createRenderData('Verify Account', {}, { email: email || '' }, '');
//   return res.render('Layouts/userVerify', renderData);
// };