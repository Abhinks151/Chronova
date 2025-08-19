import { customAlphabet } from "nanoid";
import { Coupon } from "../../models/coupon.js";
import { User } from "../../models/userModels.js";
import { generateToken } from "../../utils/generateToken.js";
import httpStatusCode from "../../utils/httpStatusCode.js";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

export const getUserByIdServiceForGoolge = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const completeGoogleAuthService = async (userId, req) => {
  if (!userId) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      body: {
        success: false,
        errors: { userId: "User ID not found in session" },
      },
    };
  }

  const { firstname, lastname, referralCode } = req.body;

  // console.log(req.body);
  

  if (!/^[a-zA-Z]+$/.test(firstname)) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      body: {
        success: false,
        errors: { firstName: "First name must contain only letters" },
      },
    };
  }

  if(lastname){
    if (!/^[a-zA-Z]+$/.test(lastname)) {
      return {
        status: httpStatusCode.BAD_REQUEST.code,
        body: {
          success: false,
          errors: { lastName: "Last name must contain only letters" },
        },
      };
    }
  }


  const user = await User.findById(userId);

  if (!user) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      body: {
        success: false,
        errors: { user: "User not found" },
      },
    };
  }

  let referredUser;
  if (referralCode && referralCode.trim() !== "") {
    referredUser = await User.findOne({ referralCode: referralCode.trim() });
    if (!referredUser) {
      return {
        status: httpStatusCode.BAD_REQUEST.code,
        body: {
          success: false,
          errors: { referralCode: "Invalid referral code" },
        },
      };
    }
  }

  const updatedFields = {
    isRegistrationComplete: true,
  };

  if (firstname && firstname !== user.firstname) {
    updatedFields.firstname = firstname;
  }
  if (lastname && lastname !== user.lastname) {
    updatedFields.lastname = lastname;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: updatedFields },
    { new: true }
  );

  if (referredUser) {
    await Coupon.create({
      coupon: `REF-${nanoid()}`,
      discountAmount: 200,
      minimumCartAmount: 500,
      expiryTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      userId: referredUser._id,
      applicableFor: {
        limit: 1,
        usedBy: [],
      },
    });
  }

  user.isRegistrationCompleted = true;
  await user.save();

  const token = generateToken(user._id);

  return {
    status: httpStatusCode.OK.code,
    body: {
      success: true,
      data: updatedUser,
    },
    token,
  };
};
