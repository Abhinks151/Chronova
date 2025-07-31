import { User } from "../../models/userModels.js";
import bcrypt from "bcrypt";
import { sendVerificationOTP } from "../../utils/sendVerificationOTP.js";
const SALT = 10;
import httpStatusCode from "../../utils/httpStatusCode.js";
import { Coupon } from "../../models/coupon.js";

export const registerUser = async (req, userData) => {
  const {
    firstname,
    lastname,
    email,
    password,
    confirmPassword,
    referralCode,
  } = userData;

  if (password !== confirmPassword) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      body: {
        success: false,
        errors: {
          confirmPassword: "Passwords do not match",
        },
      },
    };
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      body: {
        success: false,
        errors: {
          email: "Email already exists",
        },
      },
    };
  }

  let referredUser;
  if (referralCode != "") {
    referredUser = await User.findOne({ referralCode: referralCode });
    if (!referredUser) {
      return {
        status: httpStatusCode.BAD_REQUEST.code,
        body: {
          success: false,
          errors: {
            referralCode: "Invalid referral code",
          },
        },
      };
    }
  }

  const hashedPassword = await bcrypt.hash(password, SALT);

  const newUser = new User({
    firstname,
    lastname,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  await newUser.save();

  if (referredUser) {
    // console.log(referredUser);
    await Coupon.create({
      discountAmount: 200,
      minimumCartAmount: 500,
      expiryTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: referredUser._id,
      coupon: undefined,
      applicableFor: {
        limit: 1,
        usedBy: [],
      },
    });
  }

  req.session.emailForVerification = newUser.email;
  req.session.save();
  await sendVerificationOTP(newUser, newUser.email);

  return {
    status: httpStatusCode.CREATED.code,
    body: {
      success: true,
      message:
        "Registration successful! Please check your email for the verification OTP.",
      redirect: "/user/verify-otp",
    },
  };
};
