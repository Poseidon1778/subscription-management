import pool from "../config/db.js";

export const getAllTemplates = async () => {
  const result = await pool.query(
    `SELECT t.*, rp.plan_name,
       COALESCE(json_agg(
         json_build_object(
           'id', l.id, 'product_id', l.product_id, 'product_name', pr.product_name,
           'quantity', l.quantity, 'unit_price', l.unit_price
         )
       ) FILTER (WHERE l.id IS NOT NULL), '[]') AS lines
     FROM quotation_templates t
     LEFT JOIN recurring_plans rp ON rp.id = t.recurring_plan_id
     LEFT JOIN quotation_template_lines l ON l.template_id = t.id
     LEFT JOIN products pr ON pr.id = l.product_id
     GROUP BY t.id, rp.plan_name
     ORDER BY t.created_at DESC`
  );
  return result.rows;
};

export const getTemplateById = async (id) => {
  const result = await pool.query(
    `SELECT t.*, rp.plan_name,
       COALESCE(json_agg(
         json_build_object(
           'id', l.id, 'product_id', l.product_id, 'product_name', pr.product_name,
           'quantity', l.quantity, 'unit_price', l.unit_price
         )
       ) FILTER (WHERE l.id IS NOT NULL), '[]') AS lines
     FROM quotation_templates t
     LEFT JOIN recurring_plans rp ON rp.id = t.recurring_plan_id
     LEFT JOIN quotation_template_lines l ON l.template_id = t.id
     LEFT JOIN products pr ON pr.id = l.product_id
     WHERE t.id = $1
     GROUP BY t.id, rp.plan_name`,
    [id]
  );
  return result.rows[0];
};

export const createTemplate = async ({ templateName, validityDays, recurringPlanId, createdBy }) => {
  const result = await pool.query(
    `INSERT INTO quotation_templates (template_name, validity_days, recurring_plan_id, created_by)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [templateName, validityDays || 30, recurringPlanId || null, createdBy]
  );
  return result.rows[0];
};

export const updateTemplate = async (id, { templateName, validityDays, recurringPlanId }) => {
  const result = await pool.query(
    `UPDATE quotation_templates SET
       template_name = COALESCE($1, template_name),
       validity_days = COALESCE($2, validity_days),
       recurring_plan_id = COALESCE($3, recurring_plan_id),
       updated_at = NOW()
     WHERE id = $4 RETURNING *`,
    [templateName, validityDays, recurringPlanId, id]
  );
  return result.rows[0];
};

export const deleteTemplate = async (id) => {
  await pool.query("DELETE FROM quotation_templates WHERE id = $1", [id]);
};

export const addTemplateLine = async (templateId, { productId, quantity, unitPrice }) => {
  const result = await pool.query(
    `INSERT INTO quotation_template_lines (template_id, product_id, quantity, unit_price)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [templateId, productId, quantity || 1, unitPrice || 0]
  );
  return result.rows[0];
};

export const deleteTemplateLine = async (lineId) => {
  await pool.query("DELETE FROM quotation_template_lines WHERE id = $1", [lineId]);
};
