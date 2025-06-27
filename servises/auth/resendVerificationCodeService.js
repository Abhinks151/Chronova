import { validationResult } from 'express-validator';
import { User } from '../../models/userModels.js';
import { sendVerificationOTP } from '../../utils/sendVerificationOTP.js';
import httpStatusCode from '../../utils/httpStatusCode.js';

// import { sendWelcome } from '../../utils/sendVerificationOTP';


export const handleResendVerification = async (req) => {
  const email = req.session.emailForVerification;
  // console.log(email)
  if (!email) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Session expired. Please sign up again.',
    };
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return {
      status: httpStatusCode.NOT_FOUND.code,
      message: 'No user found with this email address.',
    };
  }

  if (user.isVerified) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Account is already verified. Please log in.',
    };
  }

  try {
    await sendVerificationOTP(user,user.email);
    return {
      status: httpStatusCode.OK.code,
      message: 'Verification code sent successfully. Please check your inbox.',
    };
  } catch (err) {
    console.error('Error sending OTP:', err);
    return {
      status: httpStatusCode.INTERNAL_SERVER.code,
      message: 'Failed to send verification code. Please try again later.',
    };
  }
};
