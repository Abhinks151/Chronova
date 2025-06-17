import passport from "passport";
import { generateToken } from "../../utils/generateToken.js";


export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
});

export const googleCallback = [
  passport.authenticate('google', {
    failureRedirect: '/user/login',
    session: false,
  }),
  async (req, res) => {
    try {
      const user = req.user;
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
      res.redirect('/user/login');
    }
  },
];