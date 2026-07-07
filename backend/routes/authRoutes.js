import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} from "../controllers/authController.js";
import {
  signupValidationRules,
  loginValidationRules,
  validate,
} from "../middleware/validators.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signupValidationRules, validate, signup);
router.post("/login", loginValidationRules, validate, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protect, getMe);

export default router;
