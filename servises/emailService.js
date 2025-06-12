// services/emailService.js
import sendEmail from '../utils/sendEmail.js';

export const sendOTPEmail = async (to, otp, firstname = 'User') => {
  await sendEmail({
    to,
    subject: 'Your OTP Code - Chronova',
    text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${firstname},</h2>
        <p>Your OTP Code is <strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes. Please don’t share it with anyone.</p>
        <p>Thanks, <br />Team Chronova</p>
      </div>
    `,
  });
};

export const sendWelcomeEmail = async (to, firstname) => {
  await sendEmail({
    to,
    subject: 'Welcome to Chronova!',
    text: `Welcome to Chronova, ${firstname}!`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome, ${firstname}!</h2>
        <p>We're excited to have you on board. Enjoy shopping watches with style and precision.</p>
        <p>— Chronova Team</p>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (to, resetLink, firstname) => {
  await sendEmail({
    to,
    subject: 'Reset Your Chronova Password',
    text: `Reset your password using the following link: ${resetLink}`,
    html: `
    <h1>hai ${firstname}</h1>
      <div style="font-family: Arial, sans-serif;">
        <h2>Password Reset Requested</h2>
       <p>You requested a password reset. Click this link to reset your password:</p>
        <a href="${resetLink}" style="padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none;">Reset Password</a>
        <p>This link expires in 24 hours.</p>
      </div>
    `,
  });
};


