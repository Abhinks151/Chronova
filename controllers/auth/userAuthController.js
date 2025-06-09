import { User } from "../../models/userModels.js";
import { sendVerificationOTP, verifyOTP } from '../../helpers/otpService.js';
import { generateToken } from '../../utils/generateToken.js';
import { Resend } from 'resend';
import crypto from "crypto";
import bcrypt from "bcrypt";
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const SALT = 10;

// Helper function to handle response format (JSON vs HTML)
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

// Helper function to create render data structure
const createRenderData = (title, errors = {}, formData = {}, successMessage = null) => ({
  title,
  errors,
  formData,
  successMessage
});

// Helper function to handle validation errors
const handleValidationErrors = (req, res, errors, viewName, title) => {
  const errorMap = {};
  errors.array().forEach(error => {
    errorMap[error.param || error.path] = error.msg;
  });

  const renderData = createRenderData(title, errorMap, req.body);
  return handleResponse(req, res, 400, viewName, renderData);
};

// GET user register page
export const getUserRegister = async (req, res) => {
  const renderData = createRenderData('Register');
  res.status(200).render('Layouts/userRegister', renderData);
};

// POST user register page
export const postUserRegister = async (req, res) => {
  try {
    // Validate input errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return handleValidationErrors(req, res, errors, 'Layouts/userRegister', 'Register');
    }

    const { firstname, lastname, email, password, confirmPassword } = req.body;

    // Password match validation
    if (password !== confirmPassword) {
      const renderData = createRenderData('Register', { confirmPassword: 'Passwords do not match' }, req.body);
      return handleResponse(req, res, 400, 'Layouts/userRegister', renderData);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const renderData = createRenderData('Register', { email: 'User already exists with this email' }, req.body);
      return handleResponse(req, res, 400, 'Layouts/userRegister', renderData);
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, SALT);
    const newUser = new User({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await newUser.save();
    await sendVerificationOTP(newUser);

    const successMsg = 'Registration successful! Please check your email for verification OTP.';
    const renderData = createRenderData('Register', {}, {}, successMsg);
    const jsonData = { success: true, message: successMsg, redirect: '/user/verify-otp' };

    return handleResponse(req, res, 201, 'Layouts/userRegister', renderData, jsonData);

  } catch (error) {
    console.error('Registration error:', error);
    const renderData = createRenderData('Register', { general: 'Something went wrong. Please try again.' }, req.body || {});
    return handleResponse(req, res, 500, 'Layouts/userRegister', renderData);
  }
};

// GET verify OTP page
export const getVerifyUserOTP = async (req, res) => {
  const email = req.query.email || '';
  const renderData = createRenderData('Verify Account', {}, { email, otp: '' }, '');
  res.status(200).render('Layouts/userVerify', renderData);
};

// POST verify OTP
export const postVerifyUserOTP = async (req, res) => {
  const { email, otp } = req.body;
  const renderData = createRenderData('Verify Account', {}, { email: email || '', otp: otp || '' }, '');

  try {
    const user = await User.findOne({ email: email?.trim().toLowerCase() });

    if (!user) {
      renderData.errors.email = 'No account found with this email address';
      return res.status(404).render('Layouts/userVerify', renderData);
    }

    if (user.isVerified) {
      return res.redirect('/user/login');
    }

    if (!user.verificationToken || !user.verificationTokenExpireAt) {
      renderData.errors.otp = 'No verification code found. Please request a new one.';
      return res.status(400).render('Layouts/userVerify', renderData);
    }

    if (new Date() > user.verificationTokenExpireAt) {
      renderData.errors.otp = 'Verification code has expired. Please request a new one.';
      return res.status(400).render('Layouts/userVerify', renderData);
    }

    // Verify OTP
    const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');
    if (user.verificationToken !== hashedOTP) {
      renderData.errors.otp = 'Invalid verification code. Please check and try again.';
      return res.status(400).render('Layouts/userVerify', renderData);
    }

    // Mark user as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpireAt = undefined;
    await user.save();

    return res.redirect('/user/login');

  } catch (error) {
    console.error('Verify OTP Error:', error);
    renderData.errors.general = 'Unable to verify account. Please try again later.';
    return res.status(500).render('Layouts/userVerify', renderData);
  }
};

// Resend verification code
export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const renderData = createRenderData('Verify Account', {}, { email: email || '' }, '');

  // Email validation
  if (!email?.trim()) {
    renderData.errors.email = 'Email is required';
    return res.status(400).render('Layouts/userVerify', renderData);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    renderData.errors.email = 'Please enter a valid email address';
    return res.status(400).render('Layouts/userVerify', renderData);
  }

  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      renderData.errors.email = 'No account found with this email address';
      return res.status(404).render('Layouts/userVerify', renderData);
    }

    if (user.isVerified) {
      renderData.errors.general = 'Account is already verified. You can sign in now.';
      return res.status(400).render('Layouts/userVerify', renderData);
    }

    await sendVerificationOTP(user);

    renderData.successMessage = 'Verification code sent successfully! Please check your email and enter the 6-digit code below.';
    renderData.errors = {};

    return res.status(200).render('Layouts/userVerify', renderData);

  } catch (error) {
    console.error('Resend Verification Error:', error);
    renderData.errors.general = 'Unable to send verification code. Please try again later.';
    return res.status(500).render('Layouts/userVerify', renderData);
  }
};

// GET forgot password page
export const getForgotPassord = async (req, res) => {
  const renderData = createRenderData('Forgot Password');
  res.status(200).render('Layouts/userForgotPassword', renderData);
};

// POST forgot password
export const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate and set reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send reset email
    const resetUrl = `http://localhost:3000/user/reset-password/${resetToken}`;
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset. Click this link to reset your password:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none;">Reset Password</a>
        <p>This link expires in 24 hours.</p>
      `
    });

    res.status(200).json({ message: "Password reset email sent" });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};

// GET reset password page
export const getResetPassword = async (req, res) => {
  const { token } = req.params;

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).send('Invalid or expired password reset token');
    }

    res.render('Layouts/userResetPassword', { token });

  } catch (error) {
    console.error('Error in getResetPassword:', error);
    res.status(500).send('Server error');
  }
};

// POST reset password
export const postResetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Find user with valid token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Update password and clear reset token
    user.password = await bcrypt.hash(password, SALT);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful. Please login." });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
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
        redirect: '/user/home',
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