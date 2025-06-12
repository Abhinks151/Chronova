import crypto from 'crypto';

export const generateNumericOTP = (length = 6) => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return crypto.randomInt(min, max).toString();
};

export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};
