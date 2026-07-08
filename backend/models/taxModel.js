import pool from "../config/db.js";

export const getAllTaxes = async () => {
  const result = await pool.query("SELECT * FROM taxes ORDER BY created_at DESC");
  return result.rows;
};

export const getTaxById = async (id) => {
  const result = await pool.query("SELECT * FROM taxes WHERE id = $1", [id]);
  return result.rows[0];
};

export const createTax = async ({ taxName, taxType, taxPercent, createdBy }) => {
  const result = await pool.query(
    `INSERT INTO taxes (tax_name, tax_type, tax_percent, created_by)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [taxName, taxType || "percentage", taxPercent, createdBy]
  );
  return result.rows[0];
};

export const updateTax = async (id, { taxName, taxType, taxPercent, isActive }) => {
  const result = await pool.query(
    `UPDATE taxes SET
       tax_name = COALESCE($1, tax_name),
       tax_type = COALESCE($2, tax_type),
       tax_percent = COALESCE($3, tax_percent),
       is_active = COALESCE($4, is_active),
       updated_at = NOW()
     WHERE id = $5 RETURNING *`,
    [taxName, taxType, taxPercent, isActive, id]
  );
  return result.rows[0];
};

export const deleteTax = async (id) => {
  await pool.query("DELETE FROM taxes WHERE id = $1", [id]);
};
