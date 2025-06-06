import { Resend } from 'resend';
import crypto from 'crypto';
import { User } from '../models/userModels.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationOTP = async (user) => {
  // 1. Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // 2. Hash OTP for secure storage
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  const expiry = Date.now() + 10 * 60 * 1000; // 10 mins

  // 3. Store token info in user doc
  user.verificationToken = hash;
  user.verificationTokenExpireAt = expiry;
  await user.save(); // make sure this succeeds

  // 4. Debug logging (optional in production)
  console.log("📧 Sending OTP to:", user.email);
  console.log("🔒 Hashed OTP:", hash);
  console.log("⏳ Expires:", new Date(expiry));

  // 5. Send OTP using Resend
  try {
    const res = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: user.email,
      subject: 'Your OTP Code - Chronova',
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Your OTP Code is <strong>${otp}</strong></h2>
          <p>This OTP is valid for 10 minutes. Please don’t share it with anyone.</p>
          <p>Thanks, <br />Team Chronova</p>
        </div>
      `
    });

    console.log("✅ OTP email sent:", res.id || res);
    return otp;

  } catch (err) {
    console.error("❌ Failed to send OTP:", err?.response?.data || err.message);
    throw new Error("Failed to send OTP email.");
  }
};

export const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email }).select('+verificationToken +verificationTokenExpireAt');
  if (!user) return false;

  if (user.verificationTokenExpireAt < Date.now()) return false;

  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  if (hash !== user.verificationToken) return false;

  return user;
};