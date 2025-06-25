import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function () {
      return !this.isGoogleUser;
    }
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String
  },
  phone: {
    type: String
  },
  address: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address"
    }
  ],
  phoneNumber: {
    type: Number
  },
  newEmail: {
    type: String
  },
  avatar: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  verificationToken: String,
  verificationTokenExpireAt: Date
}, {
  timestamps: true,
});




export const User = mongoose.model("User", userSchema);
