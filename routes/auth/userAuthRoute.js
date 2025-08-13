import express from "express";
import {
  getUserRegister,
  postUserRegister,
  postVerifyUserOTP,
  getVerifyUserOTP,
  resendVerificationCode,
  postForgotPassword,
  postResetPassword,
  getUserLogin,
  postUserLogin,
  userLogout,
  getForgotPassord,
  getResetPassword
} from "../../controllers/auth/userAuthController.js";

import validate from '../../utils/validationRules.js';
import { preventLoggedInAccess } from '../../middlewares/userAuthMiddleware.js';
import { completeGoogleAuth, completeGoogleAuthPage, completeGoogleAuthPageData } from "../../controllers/auth/googleAuth.js";



const userAuthRouter = express.Router();

userAuthRouter.get('/register',preventLoggedInAccess, getUserRegister);
userAuthRouter.post('/register', validate(['firstname', 'lastname', 'email', 'password', 'confirmPassword']), postUserRegister);

userAuthRouter.get('/verify-otp', preventLoggedInAccess, getVerifyUserOTP);
userAuthRouter.post('/verify-otp', postVerifyUserOTP);

userAuthRouter.get('/resend-otp', getVerifyUserOTP);
userAuthRouter.post('/resend-otp', validate(['email']), resendVerificationCode);

userAuthRouter.get('/login', preventLoggedInAccess, getUserLogin);
userAuthRouter.post('/login', validate(['email', 'password']), postUserLogin);

userAuthRouter.get('/forgot-password', getForgotPassord);
userAuthRouter.post('/forgot-password', postForgotPassword);

userAuthRouter.get('/reset-password/:token', getResetPassword);
userAuthRouter.post('/reset-password', postResetPassword);

//google completion
userAuthRouter.get('/google/register/complete',completeGoogleAuthPage)
userAuthRouter.patch('/google/register/complete',completeGoogleAuth)
userAuthRouter.get('/google/register/complete/data',completeGoogleAuthPageData)


userAuthRouter.get('/logout', userLogout);




// userAuthRouter.get('/home', authenticateUser, (req, res) => res.status(httpStatusCode.OK.code).render('Layouts/home'));
// userAuthRouter.get('/', (req, res) => res.status(httpStatusCode.OK.code).render('Layouts/home'));

export default userAuthRouter;

