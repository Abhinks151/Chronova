import { validationResult } from 'express-validator';
import { User } from '../../models/userModels.js';
import { sendVerificationOTP } from '../../utils/sendVerificationOTP.js';
import httpStatusCode from '../../utils/httpStatusCode.js';

// import { sendWelcome } from '../../utils/sendVerificationOTP';


export const handleResendVerification = async (req) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMsg = errors.array()[0].msg || 'Validation error';
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: errorMsg,
    };
  }

  const { email } = req.body;

  if (!email) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Email is required.',
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

  // await sendWelcome(user);
  await sendVerificationOTP(user);

  return {
    status: httpStatusCode.OK.code,
    message: 'Verification code sent successfully. Please check your inbox.',
  };
};

