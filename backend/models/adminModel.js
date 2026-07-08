import pool from "../config/db.js";

export const createInternalUser = async ({ fullName, email, passwordHash, createdBy }) => {
  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, created_by)
     VALUES ($1, $2, $3, 'internal_user', $4)
     RETURNING id, full_name, email, role, created_at`,
    [fullName, email, passwordHash, createdBy]
  );
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, full_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
  );
  return result.rows;
};
