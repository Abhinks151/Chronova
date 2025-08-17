import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 10);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      default: () => `CHRONO-${nanoid()}`,
    },

    shippingAddress: {
      addressName: {
        type: String,
        enum: ["Home", "Work", "Other"],
        required: true,
      },
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String },
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
          required: true,
        },
        productName: { type: String, required: true },
        brand: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
        discount: { type: Number, required: true, default: 0 },
        couponDiscountPerItem: { type: Number, default: 0 },
        totalCouponDiscount: { type: Number, default: 0 },
        netItemTotal: { type: Number, required: false },
        category: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
          },
        ],
        image: {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
        },
        status: {
          type: String,
          enum: [
            "Pending",
            "Placed",
            "Cancelled",
            "Shipped",
            "Delivered",
            "Return Requested",
            "Return Approved",
            "Return Rejected",
          ],
          default: "Placed",
        },
        cancelReason: String,
        returnReason: String,
        returnRejectionReason: String,
        returnRequestedAt: Date,
        returnProcessedAt: Date,
        returnProcessedBy: {
          type: String,
          enum: ["Admin", "System"],
        },
        paymentStatus: {
          type: String,
          enum: ["Pending", "Paid", "Failed", "Refunded", "Cancelled"],
          default: "Pending",
        },
        paymentStatusUpdatedAt: Date,
      },
    ],

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded", "Partially Refunded"],
      default: "Pending",
    },

    paymentDetails: {
      transactionId: String,
      razorpay_order_id: String,
      razorpay_payment_id: String,
      razorpay_signature: String,
      paymentDate: Date,
      paymentProvider: { type: String, default: "Razorpay" },
    },
    razorpay: {
      orderId: String,
      receipt: String,
    },
    paymentHistory: [
      {
        status: String,
        previousStatus: String,
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        changedAt: Date,
        changeType: {
          type: String,
          enum: ["order", "item", "bulk_item"],
        },
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Products",
        },
        itemName: String,
        source: {
          type: String,
          enum: ["Admin", "Webhook", "System"],
        },
      },
    ],

    coupon: {
      code: String,
      discountAmount: { type: Number, default: 0 },
      type: {
        type: String,
        enum: ["REGULAR", "REFERRAL"],
        default: "REGULAR",
      },
      appliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },

    subtotal: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    refundedAmount: {
      type: Number,
      default: 0,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Placed",
        "Cancelled",
        "Partially Cancelled",
        "Shipped",
        "Delivered",
        "Return Requested",
        "Partially Returned",
        "Returned",
        "Return Approved",
        "Partially Return Approved",
      ],
      default: "Placed",
    },

    cancellation: {
      cancelledAt: Date,
      cancelledBy: {
        type: String,
        enum: ["User", "Admin"],
      },
      reason: String,
    },

    returnInfo: {
      returnedAt: Date,
      reason: String,
      approved: {
        type: Boolean,
        default: false,
      },
      totalReturnRequests: {
        type: Number,
        default: 0,
      },
      approvedReturns: {
        type: Number,
        default: 0,
      },
      rejectedReturns: {
        type: Number,
        default: 0,
      },
    },

    invoiceGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);
