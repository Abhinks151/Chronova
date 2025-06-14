

export const otpTemplate = (otp, firstname) => {
  return `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: auto; padding: 30px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 10px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Welcome to <span style="color:rgb(0, 0, 0);">Chronova</span></h1>
    <p style="font-size: 14px; color: #555;">Your trusted watch destination</p>
  </div>

  <h2 style="font-size: 20px; color: #333;">Hello ${firstname},</h2>

  <p style="font-size: 16px; color: #444; line-height: 1.5;">
    We're glad you're here. Use the OTP below to proceed with your verification process.
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <span style="display: inline-block; background-color:rgb(0, 0, 0); color: white; font-size: 24px; padding: 12px 24px; border-radius: 6px; letter-spacing: 4px; font-weight: bold;">
      ${otp}
    </span>
  </div>

  <p style="font-size: 14px; color: #888;">
    This OTP is valid for <strong>10 minutes</strong>. Please do not share it with anyone for your account’s security.
  </p>

  <p style="font-size: 14px; color: #888; margin-top: 40px;">
    Thanks, <br />
    <strong style="color:rgb(0, 0, 0);">Team Chronova</strong>
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin-top: 40px;" />
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    If you didn’t request this, you can safely ignore this email.
  </p>
</div>

`
}

export const welcomeTemplate = (firstname) => {
  return `
    <div style="max-width: 600px; margin: 40px auto; padding: 30px; background-color: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h1 style="color: #0a58ca; margin-bottom: 8px;">Welcome to Chronova!</h1>
    <p style="font-size: 14px; color: #777;">Your destination for timeless elegance</p>
  </div>

  <h2 style="font-size: 22px; color: #333;">Hi ${firstname},</h2>

  <p style="font-size: 16px; line-height: 1.6; margin-top: 10px;">
    We're thrilled to have you on board! Explore our premium collection of watches — crafted for style, designed for precision. Whether you're into classic elegance or modern minimalism, your perfect timepiece is waiting.
  </p>

  <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
    Ready to elevate your time?
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="https://yourwebsite.com" style="text-decoration: none; background-color: #0a58ca; color: #fff; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
      Start Exploring
    </a>
  </div>

  <p style="font-size: 14px; color: #777;">
    — Team Chronova
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

  <p style="font-size: 12px; color: #aaa; text-align: center;">
    Need help? <a href="mailto:abhinca151@chronova.com" style="color: #0a58ca;">Contact us</a>.
  </p>
</div>

  `
}

export const resentTemplate = (firstname, resetLink) => {
  return `
    <div style="max-width: 600px; margin: 40px auto; padding: 30px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333;">
  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="color: #0a58ca; font-size: 26px; margin: 0;">Chronova Password Reset</h1>
    <p style="font-size: 14px; color: #888; margin-top: 8px;">Your time. Your control.</p>
  </div>

  <h2 style="font-size: 20px;">Hi ${firstname},</h2>

  <p style="font-size: 16px; line-height: 1.6;">
    We received a request to reset your Chronova account password. If this was you, click the button below to set a new password.
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" style="padding: 12px 24px; background-color: #0a58ca; color: #fff; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">
      Reset Password
    </a>
  </div>

  <p style="font-size: 14px; color: #666;">
    This link will expire in <strong>24 hours</strong>. If you didn't request this, please ignore this email. No changes will be made to your account.
  </p>

  <p style="font-size: 14px; margin-top: 40px;">
    — Team Chronova
  </p>

  <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0;" />
  <p style="font-size: 12px; color: #aaa; text-align: center;">
    Need help? <a href="mailto:support@chronova.com" style="color: #0a58ca;">Contact Support</a>
  </p>
</div>

  `
}