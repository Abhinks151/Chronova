import { User } from "../../models/userModels.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../../utils/generateToken.js";

export const loginUserService = async (email, password) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user.isGoogleUser) {
      return {
        success: false,
        errors: { email: 'Please login with Google' }
      };
    }
    if (!user) {
      return {
        success: false,
        errors: { email: 'Invalid email or password' }
      };
    }

    if (!user.isVerified) {
      return {
        success: false,
        errors: { email: 'Please verify your email before logging in' }
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

    return {
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      errors: {}
    };

  } catch (error) {
    console.error('Service error during login:', error);
    return {
      success: false,
      errors: { general: 'Internal server error. Please try again.' }
    };
  }
};