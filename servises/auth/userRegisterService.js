import { User } from '../../models/userModels.js';
import bcrypt from 'bcrypt';
import { sendVerificationOTP } from "../../utils/sendVerificationOTP.js";
const SALT = 10;
import httpStatusCode from '../../utils/httpStatusCode.js';


export const registerUser = async (userData) => {
  const { firstname, lastname, email, password, confirmPassword } = userData;

  if (password !== confirmPassword) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      body: {
        success: false,
        errors: {
          confirmPassword: 'Passwords do not match'
        }
      }
    };
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      body: {
        success: false,
        errors: {
          email: 'Email already exists'
        }
      }
    };
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

  return {
    status: httpStatusCode.CREATED.code,
    body: {
      success: true,
      message: 'Registration successful! Please check your email for the verification OTP.',
      redirect: '/user/verify-otp'
    }
  };
};


