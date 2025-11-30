import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose.set("strictQuery", true);

const connectDB = async () => {
  let isConnected = false;

  while (!isConnected) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000, // 🔥 Mongo responds faster
      });

      console.log("MongoDB connected");
      isConnected = true;
    } catch (err) {
      console.error(
        "MongoDB connection failed. Retrying in 3 seconds...",
        err.message
      );

      // 🔥 VERY IMPORTANT:
      // Instead of crashing Render, wait & retry.
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
};

export default connectDB;
