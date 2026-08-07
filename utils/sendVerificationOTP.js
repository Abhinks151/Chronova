// utils/sendVerificationOTP.js
import { generateNumericOTP, hashOTP } from './otp.js';
import { sendOTPEmail, sendResetPasswordEmail, sendWelcomeEmail } from '../services/emailService.js';
import { User } from '../models/userModels.js';
import { logger } from '../config/logger.js';

export const sendVerificationOTP = async (user,newEmail) => {
  const otp = generateNumericOTP();
  const hashed = hashOTP(otp);
  const expiry = Date.now() + 10 * 60 * 1000;

  user.verificationToken = hashed;
  user.verificationTokenExpireAt = expiry;
  await user.save();
  logger.info(newEmail);
  await sendOTPEmail(newEmail, otp, user.firstname);
};

export const sendResetPasswordToken = async (user) => {
  const resetToken = generateNumericOTP(6);
  const hashedToken = hashOTP(resetToken);
  const expiry = Date.now() + 1000 * 60 * 60;
  // logger.info(hashedToken); 
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = expiry;
  await user.save();

  const resetLink = `https://chronova.abhin.site/user/reset-password/${hashedToken}`;
  await sendResetPasswordEmail(user.email, resetLink, user.firstname);
};

export const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpireAt');
  if (!user) return false;

  if (!user.verificationToken || Date.now() > user.verificationTokenExpireAt) return false;

  const hash = hashOTP(otp);
  if (hash !== user.verificationToken) return false;

  user.verificationToken = undefined;
  user.verificationTokenExpireAt = undefined;
  await user.save();

  return user;
};


export const sendWelcome = async (user) => {
  await sendWelcomeEmail(user.email, user.firstname);
};