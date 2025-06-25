import crypto from 'crypto';
import { User } from '../../models/userModels.js';
import { sendWelcome } from '../../utils/sendVerificationOTP.js';
import httpStatusCode from '../../utils/httpStatusCode.js';
import { generateToken } from '../../utils/generateToken.js';

export const verifyUserOTPService = async (session, body) => {
  const { emailForVerification, userIdForVerification } = session;
  const { otp } = body;

  if (!emailForVerification || !otp) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Session expired or missing email/OTP.',
    };
  }

  let user;

  if (userIdForVerification) {
    user = await User.findById(userIdForVerification);

    if (!user) {
      return {
        status: httpStatusCode.NOT_FOUND.code,
        message: 'User not found.',
      };
    }

    if (user.newEmail !== emailForVerification) {
      return {
        status: httpStatusCode.BAD_REQUEST.code,
        message: 'Invalid email change attempt.',
      };
    }
  } else {
    user = await User.findOne({ email: emailForVerification.trim().toLowerCase() });

    if (!user) {
      return {
        status: httpStatusCode.NOT_FOUND.code,
        message: 'No account found with this email.',
      };
    }

    if (user.isVerified) {
      return {
        status: httpStatusCode.OK.code,
        message: 'Account already verified. Please log in.',
        redirect: '/user/login',
      };
    }
  }

  const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex');

  if (
    user.verificationToken !== hashedOTP ||
    !user.verificationTokenExpireAt ||
    new Date() > user.verificationTokenExpireAt
  ) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Invalid or expired OTP.',
    };
  }

  if (userIdForVerification) {
    user.email = user.newEmail;
    user.newEmail = undefined;
  } else {
    user.isVerified = true;
    sendWelcome(user);
  }

  user.verificationToken = undefined;
  user.verificationTokenExpireAt = undefined;
  await user.save();

  session.emailForVerification = null;
  session.userIdForVerification = null;

  if (userIdForVerification) {
    return {
      status: httpStatusCode.OK.code,
      message: 'Email updated successfully.',
      redirect: '/user/profile',
    };
  }

  const token = generateToken(user._id);
  return {
    status: httpStatusCode.OK.code,
    message: 'Account verified successfully.',
    redirect: '/user/home',
    token,
  };
};

