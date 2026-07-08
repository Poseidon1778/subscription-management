import pool from "../config/db.js";

const STATUS_FLOW = ["draft", "quotation", "confirmed", "active", "closed"];

export const generateSubscriptionNumber = async () => {
  const result = await pool.query("SELECT COUNT(*) FROM subscriptions");
  const count = parseInt(result.rows[0].count, 10) + 1;
  return `SUB-${String(count).padStart(5, "0")}`;
};

export const getAllSubscriptions = async () => {
  const result = await pool.query(
    `SELECT s.*, u.full_name AS customer_name, p.plan_name
     FROM subscriptions s
     JOIN users u ON u.id = s.customer_id
     JOIN recurring_plans p ON p.id = s.plan_id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
};

export const getSubscriptionById = async (id) => {
  const subResult = await pool.query(
    `SELECT s.*, u.full_name AS customer_name, p.plan_name
     FROM subscriptions s
     JOIN users u ON u.id = s.customer_id
     JOIN recurring_plans p ON p.id = s.plan_id
     WHERE s.id = $1`,
    [id]
  );
  const subscription = subResult.rows[0];
  if (!subscription) return null;

  const linesResult = await pool.query(
    `SELECT sl.*, pr.product_name
     FROM subscription_lines sl
     JOIN products pr ON pr.id = sl.product_id
     WHERE sl.subscription_id = $1`,
    [id]
  );
  subscription.lines = linesResult.rows;
  return subscription;
};

export const createSubscription = async ({
  customerId, planId, startDate, expirationDate, paymentTerms, createdBy,
}) => {
  const subscriptionNumber = await generateSubscriptionNumber();
  const result = await pool.query(
    `INSERT INTO subscriptions
      (subscription_number, customer_id, plan_id, start_date, expiration_date, payment_terms, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [subscriptionNumber, customerId, planId, startDate, expirationDate || null, paymentTerms || null, createdBy]
  );
  return result.rows[0];
};

export const addSubscriptionLine = async (subscriptionId, { productId, quantity, unitPrice, taxPercent }) => {
  const result = await pool.query(
    `INSERT INTO subscription_lines (subscription_id, product_id, quantity, unit_price, tax_percent)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [subscriptionId, productId, quantity, unitPrice, taxPercent || 0]
  );
  return result.rows[0];
};

export const deleteSubscriptionLine = async (lineId) => {
  await pool.query("DELETE FROM subscription_lines WHERE id = $1", [lineId]);
};

export const getSubscriptionStatus = async (id) => {
  const result = await pool.query("SELECT status FROM subscriptions WHERE id = $1", [id]);
  return result.rows[0]?.status;
};

export const isValidStatusTransition = (currentStatus, newStatus) => {
  const currentIndex = STATUS_FLOW.indexOf(currentStatus);
  const newIndex = STATUS_FLOW.indexOf(newStatus);
  // Only allow moving forward one step at a time, or staying the same
  return newIndex === currentIndex + 1;
};

export const updateSubscriptionStatus = async (id, newStatus) => {
  const result = await pool.query(
    "UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [newStatus, id]
  );
  return result.rows[0];
};

export const updateSubscriptionDetails = async (id, { startDate, expirationDate, paymentTerms }) => {
  const result = await pool.query(
    `UPDATE subscriptions SET
       start_date = COALESCE($1, start_date),
       expiration_date = COALESCE($2, expiration_date),
       payment_terms = COALESCE($3, payment_terms),
       updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [startDate, expirationDate, paymentTerms, id]
  );
  return result.rows[0];
};

export const deleteSubscription = async (id) => {
  await pool.query("DELETE FROM subscriptions WHERE id = $1", [id]);
};

export { STATUS_FLOW };
