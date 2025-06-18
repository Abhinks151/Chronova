import passport from "passport";
import { generateToken } from "../../utils/generateToken.js";
import HttpStatusCode from "../../utils/httpStatusCode.js";

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const googleCallback = async (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    try {
      if (err) {
        console.error('Passport error:', err);
        return res.status(500).render('Layouts/userLogin', {
          title: "Login",
          success: false,
          errors: 'Something went wrong. Please try again.'
        });
      }

      if (!user) {
        return res.status(400).render('Layouts/userLogin', {
          title: "Login",
          success: false,
          errors: {email : 'user is blocked by admin'}
        });
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
      res.status(500).render('Layouts/userLogin', {
        title: "Login",
        success: false,
        errors: 'Something went wrong. Please try again.'
      });
    }
  })(req, res, next);
};
