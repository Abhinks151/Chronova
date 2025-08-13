import passport from "passport";
import { generateToken } from "../../utils/generateToken.js";
import httpStatusCode from "../../utils/httpStatusCode.js"
import { logger } from "../../config/logger.js";
import { completeGoogleAuthService, getUserByIdServiceForGoolge } from "../../services/auth/getUserByIdServiceForGoolge.js";
import dotenv from 'dotenv'

dotenv.config();

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const googleCallback = async (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        console.error('Passport error:', err);
        return res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render('Layouts/userLogin', {
          title: "Login",
          success: false,
          errors: 'Something went wrong. Please try again.'
        });
      }

      if (!user) {
        return res.status(httpStatusCode.BAD_REQUEST.code).render('Layouts/userLogin', {
          title: "Login",
          success: false,
          errors: { email: 'user is blocked by admin' }
        });
      }

      if (!user.isRegistrationCompleted) {
        req.session.googleUserId = user._id;
        return res.redirect('/user/google/register/complete');
      }

      const token = generateToken(user._id);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect('/user/products');
    } catch (err) {
      console.error('OAuth error:', err);
      res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).render('Layouts/userLogin', {
        title: "Login",
        success: false,
        errors: 'Something went wrong. Please try again.'
      });
    }
  })(req, res, next);
};


export const completeGoogleAuthPage = (req, res) => {
  try {
    res.status(httpStatusCode.OK.code).render('Layouts/googleRegisterComplete');
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: error.message
    });
  }
}

export const completeGoogleAuthPageData = async (req, res) => {
  try {
    const userId = req.session.googleUserId;
    const result = await getUserByIdServiceForGoolge(userId);

    res.status(httpStatusCode.OK.code).json({
      success: true,
      data: result,
      message: 'User data fetched successfully'
    });
  } catch (error) {
    logger.error(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: error.message
    });
  }
}


export const completeGoogleAuth = async (req, res) => {
  try {
    const userId = req.session.googleUserId;
    const result = await completeGoogleAuthService(userId, req);

    if (result.status !== httpStatusCode.OK.code) {
      return res.status(result.status).json(result.body);
    }
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'Strict' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

    res.status(httpStatusCode.OK.code).json({
      success: true,
      data: result.body.data,
      message: 'Registration complete',
      redirect: '/user/home'
    });
  } catch (error) {
    logger.error(error);
    console.log(error);
    res.status(httpStatusCode.INTERNAL_SERVER_ERROR.code).json({
      message: error.message
    });
  }
};