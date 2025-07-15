import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 6);

const applicableForSchema = new mongoose.Schema(
  {
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    usageCount: {
      type: Number,
      default: 0,
    },
    limit: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const couponSchema = new mongoose.Schema(
  {
    coupon: {
      type: String,
      required: true,
      unique: true,
      default: () => `COUPON-${nanoid()}`,
    },
    discountAmount: {
      type: Number,
      required: true,
    },
    minimumCartAmount: {
      type: Number,
      default: 0,
    },
    expiryTime: {
      type: Date,
      required: true,
    },
    applicableFor: {
      type: applicableForSchema,
      default: () => ({}),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Coupon = mongoose.model("Coupon", couponSchema);
