import bcrypt from "bcryptjs";
import pool from "../../config/db.js";
import dotenv from "dotenv";
dotenv.config();

const seedAdmin = async () => {
  try {
    const email = "admin@example.com";
    const plainPassword = "Admin@1234";

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      console.log("Admin already exists. Skipping seed.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, full_name, email, role`,
      ["Super Admin", email, passwordHash]
    );

    console.log("Admin created:", result.rows[0]);
    console.log(`Login with email: ${email} | password: ${plainPassword}`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedAdmin();
