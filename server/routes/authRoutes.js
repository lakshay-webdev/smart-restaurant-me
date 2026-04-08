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
    ? "LaCasa — Verify Your Email"
    : purpose === "forgot-password"
    ? "LaCasa — Reset Your Password"
    : "LaCasa — Login OTP";

  const purposeText = purpose === "register"
    ? "complete your registration"
    : purpose === "forgot-password"
    ? "reset your password"
    : "log in to your account";

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:500px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1a1a1a,#111);padding:28px;text-align:center;">
        <h1 style="color:#f59e0b;font-size:30px;margin:0;font-family:Georgia,'Times New Roman',serif;letter-spacing:1px;">LaCasa</h1>
        <p style="color:#888;font-size:11px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase;">Fine Dining Experience</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 30px;">
        <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 8px;text-align:center;font-weight:600;">Your Verification Code</h2>
        <p style="color:#666;font-size:14px;text-align:center;margin:0 0 28px;line-height:1.5;">
          Use the code below to ${purposeText}
        </p>

        <!-- OTP Box -->
        <div style="text-align:center;margin:0 0 28px;">
          <div style="display:inline-block;background:#fffbeb;border:2px solid #f59e0b;border-radius:14px;padding:16px 36px;">
            <span style="font-size:38px;font-weight:800;letter-spacing:10px;color:#1a1a1a;font-family:'Courier New',monospace;">${otp}</span>
          </div>
        </div>

        <!-- Timer Info -->
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;background:#f3f4f6;border-radius:20px;padding:6px 16px;font-size:12px;color:#888;">
            ⏱ Expires in 5 minutes
          </span>
        </div>

        <!-- Warning -->
        <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:24px;">
          <p style="color:#92400e;font-size:12px;margin:0;line-height:1.6;">
            <strong>Security Tip:</strong> Never share this code with anyone. LaCasa staff will never ask for your OTP.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:18px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#999;font-size:11px;margin:0;">© ${new Date().getFullYear()} LaCasa Restaurant. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"LaCasa Restaurant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html
  });
}

// Send login success email
async function sendLoginSuccessEmail(email, userName) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:500px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1a1a1a,#111);padding:28px;text-align:center;">
        <h1 style="color:#f59e0b;font-size:30px;margin:0;font-family:Georgia,'Times New Roman',serif;letter-spacing:1px;">LaCasa</h1>
        <p style="color:#888;font-size:11px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase;">Fine Dining Experience</p>
      </div>

      <!-- Body -->
      <div style="padding:32px 30px;">
        <!-- Success Icon -->
        <div style="text-align:center;margin-bottom:20px;">
          <div style="display:inline-block;background:#ecfdf5;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">✓</div>
        </div>

        <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 6px;text-align:center;font-weight:600;">Welcome Back!</h2>
        <p style="color:#666;font-size:14px;text-align:center;margin:0 0 24px;">
          Hi <strong style="color:#1a1a1a;">${userName}</strong>, you've successfully logged in.
        </p>

        <!-- Login Details -->
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
          <table style="width:100%;font-size:13px;">
            <tr>
              <td style="color:#888;padding:4px 0;">📅 Date</td>
              <td style="color:#333;text-align:right;padding:4px 0;font-weight:500;">${dateStr}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:4px 0;">🕐 Time</td>
              <td style="color:#333;text-align:right;padding:4px 0;font-weight:500;">${timeStr}</td>
            </tr>
            <tr>
              <td style="color:#888;padding:4px 0;">📧 Email</td>
              <td style="color:#333;text-align:right;padding:4px 0;font-weight:500;">${email}</td>
            </tr>
          </table>
        </div>

        <!-- Warning -->
        <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;padding:12px 16px;">
          <p style="color:#991b1b;font-size:12px;margin:0;line-height:1.6;">
            <strong>Not you?</strong> If you didn't log in, please change your password immediately or contact our support.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background:#f9fafb;padding:18px 30px;text-align:center;border-top:1px solid #eee;">
        <p style="color:#f59e0b;font-size:12px;margin:0 0 4px;font-weight:600;">Thank you for choosing LaCasa! 🍽️</p>
        <p style="color:#999;font-size:11px;margin:0;">© ${new Date().getFullYear()} LaCasa Restaurant. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"LaCasa Restaurant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "LaCasa — Login Successful ✓",
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

// ==================== FORGOT PASSWORD FLOW ====================

// Step 1: Send OTP for password reset
router.post("/forgot-password/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    if (user.role === "blocked") {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    const otp = generateOTP();

    // Remove old OTPs
    await Otp.deleteMany({ email, purpose: "forgot-password" });

    await Otp.create({
      email,
      otp,
      purpose: "forgot-password",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    await sendOTPEmail(email, otp, "forgot-password");

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Forgot password OTP error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Step 2: Verify OTP and reset password
router.post("/forgot-password/verify-otp", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const otpRecord = await Otp.findOne({ email, otp, purpose: "forgot-password" });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      await Otp.deleteMany({ email, purpose: "forgot-password" });
      return res.status(400).json({ message: "OTP expired, please try again" });
    }

    // Hash new password and update
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    // Clean up OTP
    await Otp.deleteMany({ email, purpose: "forgot-password" });

    res.json({ message: "Password reset successfully! You can now login." });
  } catch (err) {
    console.error("Reset password error:", err);
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
