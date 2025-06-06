import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const URI = process.env.MONGO_URI;

export const connection = async () => {
  mongoose.connect(
    URI,
    {
      dbName: "chronova",
    }
  ).then(() => {
    console.log('DB connected');
  }).catch((value) => {
    console.log(`DB connection error: ${value}`);
  });
};

export default connection;
