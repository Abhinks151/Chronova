import { User } from "../../models/userModels.js";
import httpStatusCode from '../../utils/httpStatusCode.js';



export const forgotPassword = async ({ body }) => {
  const { email } = body;

  if (!email || !email.trim()) {
    return {
      status: httpStatusCode.BAD_REQUEST.code,
      message: 'Email is required',
    };
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!user) {
    return {
      status: httpStatusCode.NOT_FOUND.code,
      message: 'User not found',
    };
  }

  await sendResetPasswordToken(user);

  return {
    status: httpStatusCode.OK.code,
    message: 'Password reset email sent successfully.',
  };
};
