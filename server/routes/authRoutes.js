const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const Otp = require("../models/Otp");

const router = express.Router();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Send OTP email
async function sendOTPEmail(email, otp, purpose) {
  const subject = purpose === "register"
    ? "Smart Restaurant - Verify Your Email"
    : "Smart Restaurant - Login OTP";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:30px;background:#1a1a1a;border-radius:16px;color:#fff;">
      <h2 style="color:#f59e0b;text-align:center;">Smart Restaurant</h2>
      <p style="text-align:center;font-size:16px;">Your OTP for ${purpose === "register" ? "registration" : "login"} is:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#f59e0b;background:#333;padding:12px 24px;border-radius:12px;">${otp}</span>
      </div>
      <p style="text-align:center;color:#999;font-size:13px;">This OTP expires in 5 minutes. Do not share it with anyone.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Smart Restaurant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html
  });
}

// Send login success email
async function sendLoginSuccessEmail(email, userName) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:30px;background:#1a1a1a;border-radius:16px;color:#fff;">
      <h2 style="color:#f59e0b;text-align:center;">Smart Restaurant</h2>
      <p style="text-align:center;font-size:18px;margin:20px 0;">Welcome Back, <strong>${userName}!</strong></p>
      <div style="background:#333;padding:20px;border-radius:12px;text-align:center;margin:20px 0;">
        <p style="font-size:16px;margin:0;">You have successfully logged in to your account.</p>
      </div>
      <p style="text-align:center;color:#999;font-size:13px;margin-top:20px;">If this wasn't you, please change your password immediately.</p>
      <p style="text-align:center;color:#f59e0b;font-size:12px;">Thank you for choosing Smart Restaurant!</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Smart Restaurant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Smart Restaurant - Login Successful",
    html
  });
}

// ==================== REGISTER FLOW ====================

// Step 1: Send OTP for registration
router.post("/register/send-otp", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const hashed = await bcrypt.hash(password, 10);

    // Remove old OTPs for this email
    await Otp.deleteMany({ email, purpose: "register" });

    // Save OTP with user data
    await Otp.create({
      email,
      otp,
      purpose: "register",
      name,
      password: hashed,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOTPEmail(email, otp, "register");

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Register OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Step 2: Verify OTP and complete registration
router.post("/register/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await Otp.findOne({ email, otp, purpose: "register" });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email, purpose: "register" });
      return res.status(400).json({ message: "OTP expired, please try again" });
    }

    // Create user
    const user = new User({
      name: otpRecord.name,
      email: otpRecord.email,
      password: otpRecord.password
    });
    await user.save();

    // Clean up OTP
    await Otp.deleteMany({ email, purpose: "register" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Verify register OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== LOGIN FLOW ====================

// Step 1: Verify credentials and send OTP
router.post("/login/send-otp", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const otp = generateOTP();

    // Remove old OTPs
    await Otp.deleteMany({ email, purpose: "login" });

    await Otp.create({
      email,
      otp,
      purpose: "login",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOTPEmail(email, otp, "login");

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Login OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Step 2: Verify OTP and complete login
router.post("/login/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpRecord = await Otp.findOne({ email, otp, purpose: "login" });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email, purpose: "login" });
      return res.status(400).json({ message: "OTP expired, please try again" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Clean up OTP
    await Otp.deleteMany({ email, purpose: "login" });

    // Send login success email
    try {
      await sendLoginSuccessEmail(email, user.name);
    } catch (emailErr) {
      console.error("Failed to send login success email:", emailErr);
      // Continue with login even if email fails
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Verify login OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==================== LEGACY ROUTES (kept for compatibility) ====================

// Direct Register (no OTP)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Direct Login (no OTP)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get current user profile
router.get("/me", async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
