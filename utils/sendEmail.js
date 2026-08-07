import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { logger } from '../config/logger.js';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Chronova" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email sent to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    logger.error(`Email sending failed to ${to}: ${error.message}`);
    throw new Error('Email sending failed');
  }
};

export default sendEmail;
