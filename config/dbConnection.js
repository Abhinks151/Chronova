import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "./logger.js";

dotenv.config();

export const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "chronova",
    });
    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connection;
