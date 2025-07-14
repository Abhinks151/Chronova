import Razorpay from "razorpay";
import httpStatusCode from "../../utils/httpStatusCode.js";
import dotenv from 'dotenv';

dotenv.config();


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(httpStatusCode.BAD_REQUEST.code)
        .json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt,
    };

    const razorpayOrder = await razorpay.orders.create(options);
    res
      .status(httpStatusCode.OK.code)
      .json({ success: true, order: razorpayOrder });
  } catch (error) {
    console.error("Razorpay create order error", error);
    res
      .status(httpStatusCode.INTERNAL_SERVER_ERROR.code)
      .json({ success: false, message: "Failed to create Razorpay order" });
  }
};
