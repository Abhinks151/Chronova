// services/emailService.js
import sendEmail from '../utils/sendEmail.js';
import { otpTemplate, resentTemplate, welcomeTemplate } from '../utils/emailTemplates.js';

export const sendOTPEmail = async (to, otp, firstname = 'User') => {
  await sendEmail({
    to,
    subject: 'Your OTP Code - Chronova',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    html: otpTemplate(otp, firstname),
  });
};

export const sendWelcomeEmail = async (to, firstname) => {
  await sendEmail({
    to,
    subject: 'Welcome to Chronova!',
    text: `Welcome to Chronova, ${firstname}!`,
    html: welcomeTemplate(firstname),
  });
};

export const sendResetPasswordEmail = async (to, resetLink, firstname) => {
  await sendEmail({
    to,
    subject: 'Reset Your Chronova Password',
    text: `Reset your password using the following link: ${resetLink}`,
    html: resentTemplate(firstname, resetLink),
  });
};


