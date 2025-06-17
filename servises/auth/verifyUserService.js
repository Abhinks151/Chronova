import crypto from 'crypto';
import { User } from '../../models/userModels.js';
import { sendWelcome } from '../../utils/sendVerificationOTP.js';
import httpStatusCode from '../../utils/httpStatusCode.js';

export const verifyUserOTPService = async ({ email, otp }) => {
  if (!email || !otp) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Email and OTP are required.'
    };
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    return {
      status: httpStatusCode.NOT_FOUND.code,
      message: 'No account found with this email address.'
    };
  }

  if (user.isVerified) {
    return {
      status: httpStatusCode.OK.code,
      message: 'Account already verified. Please log in.',
      redirect: '/user/login'
    };
  }

  if (!user.verificationToken || !user.verificationTokenExpireAt) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'No verification code found. Please request a new one.'
    };
  }

  if (new Date() > user.verificationTokenExpireAt) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Verification code has expired. Please request a new one.'
    };
  }

  const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');
  if (user.verificationToken !== hashedOTP) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Invalid verification code. Please try again.'
    };
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpireAt = undefined;

  await user.save();
  sendWelcome(user);

  return {
    status: httpStatusCode.OK.code,
    message: 'Account verified successfully.',
    redirect: '/user/login'
  };
};
