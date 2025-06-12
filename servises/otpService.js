import { generateNumericOTP, hashOTP } from '../utils/otp.js';
import { sendOTPEmail } from './emailService.js';
import User from '../models/User.js';

export const sendVerificationOTP = async (user) => {
  const otp = generateNumericOTP();
  const hashed = hashOTP(otp);
  const expiry = Date.now() + 10 * 60 * 1000; // 10 min

  user.verificationToken = hashed;
  user.verificationTokenExpireAt = expiry;
  await user.save();

  await sendOTPEmail(user.email, otp);
  // return otp; // for testing/logging only — remove in prod
};

export const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpireAt');
  if (!user) return false;

  if (!user.verificationToken || Date.now() > user.verificationTokenExpireAt) return false;

  const hash = hashOTP(otp);
  if (hash !== user.verificationToken) return false;

  // Optionally clear the token after successful verification
  user.verificationToken = undefined;
  user.verificationTokenExpireAt = undefined;
  await user.save();

  return user;
};
