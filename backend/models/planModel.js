import pool from "../config/db.js";

export const getAllPlans = async () => {
  const result = await pool.query(
    "SELECT * FROM recurring_plans ORDER BY created_at DESC"
  );
  return result.rows;
};

export const getPlanById = async (id) => {
  const result = await pool.query("SELECT * FROM recurring_plans WHERE id = $1", [id]);
  return result.rows[0];
};

export const createPlan = async ({
  planName, price, billingPeriod, minimumQuantity,
  startDate, endDate, autoClose, closable, pausable, renewable, createdBy,
}) => {
  const result = await pool.query(
    `INSERT INTO recurring_plans
      (plan_name, price, billing_period, minimum_quantity, start_date, end_date,
       auto_close, closable, pausable, renewable, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      planName, price, billingPeriod, minimumQuantity || 1, startDate || null, endDate || null,
      autoClose || false, closable !== undefined ? closable : true,
      pausable !== undefined ? pausable : true, renewable !== undefined ? renewable : true,
      createdBy,
    ]
  );
  return result.rows[0];
};

export const updatePlan = async (id, fields) => {
  const {
    planName, price, billingPeriod, minimumQuantity,
    startDate, endDate, autoClose, closable, pausable, renewable,
  } = fields;

  const result = await pool.query(
    `UPDATE recurring_plans SET
       plan_name = COALESCE($1, plan_name),
       price = COALESCE($2, price),
       billing_period = COALESCE($3, billing_period),
       minimum_quantity = COALESCE($4, minimum_quantity),
       start_date = COALESCE($5, start_date),
       end_date = COALESCE($6, end_date),
       auto_close = COALESCE($7, auto_close),
       closable = COALESCE($8, closable),
       pausable = COALESCE($9, pausable),
       renewable = COALESCE($10, renewable),
       updated_at = NOW()
     WHERE id = $11
     RETURNING *`,
    [planName, price, billingPeriod, minimumQuantity, startDate, endDate,
     autoClose, closable, pausable, renewable, id]
  );
  return result.rows[0];
};

export const deletePlan = async (id) => {
  await pool.query("DELETE FROM recurring_plans WHERE id = $1", [id]);
};
