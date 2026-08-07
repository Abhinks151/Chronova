import { User } from "../../models/userModels.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/generateToken.js";
import { logger } from '../../config/logger.js';

export const loginUserService = async (email, password) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return {
        success: false,
        errors: { email: 'Invalid email or password' }
      };
    }

    if (user.isGoogleUser) {
      return {
        success: false,
        errors: { email: 'Please login with Google' }
      };
    }


    if (!user.isVerified) {
      return {
        success: false,
        errors: { email: 'Please verify your email before logging in' }
      };
    }
    if (user.isBlocked) {
      return {
        success: false,
        errors: { email: 'Your account has been blocked' }
      };
    }


    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        errors: { password: 'Invalid email or password' }
      };
    }

    const token = generateToken(user._id);
    user.lastLogin = new Date();
    await user.save();

    // logger.info(user);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email
      },
      errors: {}
    };

  } catch (error) {
    logger.error('Service error during login:', error);
    return {
      success: false,
      errors: { general: 'Internal server error. Please try again.' }
    };
  }
};