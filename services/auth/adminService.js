import { Admin } from '../../models/adminModels.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../utils/generateToken.js';
import httpStatusCode from '../../utils/httpStatusCode.js';

export const adminLoginService = async (email, password) => {
  const admin = await Admin.findOne({ email });

  if (!admin || !admin.isAdmin) {
    return {
      status: httpStatusCode.UNAUTHORIZED.code,
      success: false,
      message: 'Unauthorized: Not an admin',
    };
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return {
      status: httpStatusCode.UNAUTHORIZED.code,
      success: false,
      message: 'Invalid credentials',
    };
  }

  const token = generateToken(admin._id);

  return {
    status: httpStatusCode.OK.code,
    success: true,
    message: 'Admin authenticated',
    token,
    adminId: admin._id,
  };
};
