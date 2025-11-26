// routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import dotenv from "dotenv";
import User from "../models/User.js";
import { registerValidator, loginValidator } from "../validators/auth.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();
const router = express.Router();

// =====================================================
// REGISTER  (Send OTP)
// =====================================================
router.post("/register", registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      verified: false,
    });

    // Send OTP Email
    await sendEmail(
      email,
      "Verify Your Email - Notes App",
      `<h2>Your OTP Code</h2>
       <h1 style="font-size: 32px;">${otp}</h1>
       <p>This OTP expires in 5 minutes.</p>`
    );

    return res.json({
      success: true,
      message: "OTP sent to your email. Please verify.",
    });
  } catch (err) {
    console.error("Register Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================================================
// VERIFY OTP
// =====================================================
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (user.otpExpires < Date.now())
      return res.status(400).json({ success: false, message: "OTP expired" });

    user.verified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.json({
      success: true,
      message: "Email Verified Successfully!",
    });
  } catch (err) {
    console.error("OTP Verify Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =====================================================
// LOGIN  (Only verified users allowed)
// =====================================================
router.post("/login", loginValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    // ❌ Block if not verified
    if (!user.verified)
      return res.status(400).json({
        success: false,
        message: "Please verify your email before login",
      });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
