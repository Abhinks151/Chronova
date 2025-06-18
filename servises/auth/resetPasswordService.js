import { User } from "../../models/userModels.js";
import httpStatusCode from '../../utils/httpStatusCode.js';
import bcrypt from 'bcrypt';
const SALT = 10;


export const resetPassword = async ({ body }) => {
  // console.log(body)
  const { token } = body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      error: "Reset link is invalid or has expired."
    };
  }

  return {
    status: httpStatusCode.OK.code,
    error: null,
    token: { token }
  };

}




export const handlePasswordReset = async (body) => {
  const { token, password, confirmPassword } = body;
  if (!token || !password || !confirmPassword) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      view: 'Layouts/userResetPassword',
      data: {
        token,
        error: 'All fields are required.'
      }
    }
  };


  if (password !== confirmPassword) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      view: 'Layouts/userResetPassword',
      data: {
        token,
        error: 'Passwords do not match.'
      }
    }
  };

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      view: 'Layouts/userResetPassword',
      data: { token, error: 'Reset link is invalid or has expired.' }
    };
  }

  user.password = await bcrypt.hash(password, SALT);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return {
    status: httpStatusCode.OK.code,
    view: 'Layouts/userLogin',
    data: { successMessage: 'Password reset successfully. Please login.' }
  };

}