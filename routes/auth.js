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

// =========================================
// WARMUP (for Render cold start)
// GET /api/auth/warmup
// =========================================
router.get("/warmup", (req, res) => {
  return res.json({ success: true, message: "Auth service live" });
});

// =========================================
// REGISTER  (new user only)
// POST /api/auth/register
// =========================================
router.post("/register", registerValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.verified) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // If user exists but not verified, we can either:
    // - overwrite password & resend OTP
    // OR
    // - force them to use /resend-otp
    //
    // To keep it simple, we force use of /resend-otp:
    if (existingUser && !existingUser.verified) {
      return res.status(400).json({
        success: false,
        message:
          "User already registered but not verified. Please check email or resend OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOTP();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
      verified: false,
      lastOtpSentAt: new Date(),
    });

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

// =========================================
// RESEND OTP
// POST /api/auth/resend-otp
// =========================================
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    if (user.verified)
      return res
        .status(400)
        .json({ success: false, message: "Email already verified" });

    // Limit frequency (e.g., once every 60 seconds)
    if (
      user.lastOtpSentAt &&
      Date.now() - user.lastOtpSentAt.getTime() < 60 * 1000
    ) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting a new OTP",
      });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    user.lastOtpSentAt = new Date();
    await user.save();

    await sendEmail(
      email,
      "Resend OTP - Notes App",
      `<h2>Your New OTP Code</h2>
       <h1 style="font-size: 32px;">${otp}</h1>
       <p>This OTP expires in 5 minutes.</p>`
    );

    return res.json({
      success: true,
      message: "New OTP sent to your email",
    });
  } catch (err) {
    console.error("Resend OTP Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// =========================================
// VERIFY OTP
// POST /api/auth/verify-otp
// =========================================
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    if (!user.otp || user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    if (!user.otpExpires || user.otpExpires < Date.now())
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

// =========================================
// LOGIN (only verified users)
// POST /api/auth/login
// =========================================
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
