import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query("SELECT id, full_name, email, role, is_active, created_at FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

export const createUser = async ({ fullName, email, passwordHash, role = "portal_user", createdBy = null }) => {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, created_at`,
    [fullName, email, passwordHash, role, createdBy]
  );
  return result.rows[0];
};

export const updateUserPassword = async (userId, passwordHash) => {
  await pool.query(
    "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
    [passwordHash, userId]
  );
};

export const createPasswordResetToken = async (userId, token, expiresAt) => {
  await pool.query(
    "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, token, expiresAt]
  );
};

export const findValidResetToken = async (token) => {
  const result = await pool.query(
    "SELECT * FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
    [token]
  );
  return result.rows[0];
};

export const deleteResetToken = async (token) => {
  await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [token]);
};
