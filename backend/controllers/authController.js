import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  findUserByEmail,
  createUser,
  updateUserPassword,
  createPasswordResetToken,
  findValidResetToken,
  deleteResetToken,
  findUserById,
} from "../models/userModel.js";

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ fullName, email, passwordHash });

    const token = generateToken(user);
    res.status(201).json({ success: true, user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during signup" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: "Account is deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    res.status(200).json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    // Always respond the same way to avoid leaking which emails exist
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a reset link has been sent",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await createPasswordResetToken(user.id, token, expiresAt);

    // TODO: integrate real email sending (e.g. Nodemailer/SendGrid) later
    console.log(`Password reset link: http://localhost:5173/reset-password/${token}`);

    res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during forgot password" });
  }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetRecord = await findValidResetToken(token);
    if (!resetRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await updateUserPassword(resetRecord.user_id, passwordHash);
    await deleteResetToken(token);

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error during password reset" });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
