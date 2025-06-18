import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/userModels.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        const fullName = profile.displayName;
        const googleId = profile.id;

        let user = await User.findOne({ googleId });

        if (!user) {
          user = await User.findOne({ email });

          if (user) {
            user.googleId = googleId;
            user.isGoogleUser = true;
            user.avatar = avatar;
            user.firstname = fullName;
            await user.save();
          } else {
            user = await User.create({
              googleId,
              email,
              firstname: fullName,
              avatar,
              isGoogleUser: true,
              isVerified: true,
            });
          }
        }
        if (user.isBlocked) {
          return done(null, false, { error: 'User is blocked' });
        }

        return done(null, user);
      } catch (err) {
        console.error('Google Strategy Error:', err);
        return done(err, null);
      }
    }
  )
);
