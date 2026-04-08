import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP, 3 = new password
  const [loading, setLoading] = useState(false);
  const otpInputRefs = useRef([]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password/send-otp", { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtpDigits = [...otpDigits];
    newOtpDigits[index] = value;
    setOtpDigits(newOtpDigits);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const otp = otpDigits.join("");

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter all 6 digits");
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password/verify-otp", {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successful! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await axios.post("/api/auth/forgot-password/send-otp", { email });
      toast.success("OTP resent to your email!");
      setOtpDigits(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 sm:p-8 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-serif mb-2 text-center text-white">
            Forgot Password
          </h2>
          <p className="text-center text-gray-400 text-sm mb-6">
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && "Enter the OTP sent to your email"}
            {step === 3 && "Set your new password"}
          </p>

          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="border border-white/30 rounded-xl px-4 py-3">
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <p className="text-center text-gray-300 text-sm mb-4">
                OTP sent to <span className="text-amber-400">{email}</span>
              </p>

              <div className="flex justify-center gap-1.5 sm:gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-bold bg-white/10 border-2 border-amber-500/50 rounded-lg text-white focus:border-amber-400 focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-amber-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-50"
              >
                Verify OTP
              </button>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpDigits(["", "", "", "", "", ""]); }}
                  className="text-gray-400 text-sm hover:text-white transition"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-amber-400 text-sm hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="border border-white/30 rounded-xl px-4 py-3">
                <input
                  type="password"
                  placeholder="New password (min 6 chars)"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="border border-white/30 rounded-xl px-4 py-3">
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full bg-transparent outline-none text-white placeholder-gray-400"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-black py-3 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-gray-400 text-sm hover:text-white transition text-center"
              >
                ← Back to OTP
              </button>
            </form>
          )}

          <p className="text-center text-gray-400 mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-amber-400 hover:underline">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
