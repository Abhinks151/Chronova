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
import { authenticateUser } from '../../middlewares/userAuthMiddleware.js'



const userAuthRouter = express.Router();

userAuthRouter.get('/register', getUserRegister)
userAuthRouter.post('/register', validate(['firstname', 'lastname', 'email', 'password', 'confirmPassword']), postUserRegister);

userAuthRouter.get('/verify-otp', getVerifyUserOTP);
userAuthRouter.post('/verify-otp', postVerifyUserOTP);




userAuthRouter.get('/resend-otp', getVerifyUserOTP);
userAuthRouter.post('/resend-otp', validate(['email']), resendVerificationCode);




userAuthRouter.get('/login', getUserLogin)
userAuthRouter.post('/login', validate(['email', 'password']), postUserLogin)




userAuthRouter.get('/forgot-password', getForgotPassord);
userAuthRouter.post('/forgot-password', postForgotPassword);





userAuthRouter.get('/reset-password/:token', getResetPassword);
userAuthRouter.post('/reset-password', postResetPassword);



userAuthRouter.get('/logout', userLogout)




userAuthRouter.get('/home', authenticateUser, (req, res) => res.status(200).render('Layouts/home'));





// userAuthRouter.get('/', (req, res) => res.status(200).render('Layouts/home'));


export default userAuthRouter;