import bcrypt from "bcryptjs";
import { findUserByEmail } from "../models/userModel.js";
import { createInternalUser, getAllUsers } from "../models/adminModel.js";

// POST /api/admin/internal-users  (Admin only)
export const createInternalUserHandler = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: "fullName, email and password are required" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createInternalUser({
      fullName,
      email,
      passwordHash,
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error creating internal user" });
  }
};

// GET /api/admin/users  (Admin only)
export const listUsersHandler = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error fetching users" });
  }
};
