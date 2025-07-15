import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    referralCode: {
      type: String,
      unique: true,
      required: true,
      default: () => `REFERRAL-${nanoid()}`,
    },
    referredBy: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: Number,
    },
    newEmail: {
      type: String,
    },
    avatar: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verificationToken: String,
    verificationTokenExpireAt: Date,
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);

