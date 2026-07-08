import pool from "../config/db.js";

export const getAllDiscounts = async () => {
  const result = await pool.query(
    `SELECT d.*,
       COALESCE(json_agg(DISTINCT dp.product_id) FILTER (WHERE dp.product_id IS NOT NULL), '[]') AS product_ids,
       COALESCE(json_agg(DISTINCT ds.subscription_id) FILTER (WHERE ds.subscription_id IS NOT NULL), '[]') AS subscription_ids
     FROM discounts d
     LEFT JOIN discount_products dp ON dp.discount_id = d.id
     LEFT JOIN discount_subscriptions ds ON ds.discount_id = d.id
     GROUP BY d.id
     ORDER BY d.created_at DESC`
  );
  return result.rows;
};

export const getDiscountById = async (id) => {
  const result = await pool.query(
    `SELECT d.*,
       COALESCE(json_agg(DISTINCT dp.product_id) FILTER (WHERE dp.product_id IS NOT NULL), '[]') AS product_ids,
       COALESCE(json_agg(DISTINCT ds.subscription_id) FILTER (WHERE ds.subscription_id IS NOT NULL), '[]') AS subscription_ids
     FROM discounts d
     LEFT JOIN discount_products dp ON dp.discount_id = d.id
     LEFT JOIN discount_subscriptions ds ON ds.discount_id = d.id
     WHERE d.id = $1
     GROUP BY d.id`,
    [id]
  );
  return result.rows[0];
};

export const createDiscount = async (fields, createdBy) => {
  const {
    discountName, discountType, value, minimumPurchase,
    minimumQuantity, startDate, endDate, limitUsage,
  } = fields;

  const result = await pool.query(
    `INSERT INTO discounts
      (discount_name, discount_type, value, minimum_purchase, minimum_quantity, start_date, end_date, limit_usage, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [discountName, discountType, value, minimumPurchase || 0, minimumQuantity || 1,
     startDate || null, endDate || null, limitUsage || null, createdBy]
  );
  return result.rows[0];
};

export const updateDiscount = async (id, fields) => {
  const {
    discountName, discountType, value, minimumPurchase,
    minimumQuantity, startDate, endDate, limitUsage, isActive,
  } = fields;

  const result = await pool.query(
    `UPDATE discounts SET
       discount_name = COALESCE($1, discount_name),
       discount_type = COALESCE($2, discount_type),
       value = COALESCE($3, value),
       minimum_purchase = COALESCE($4, minimum_purchase),
       minimum_quantity = COALESCE($5, minimum_quantity),
       start_date = COALESCE($6, start_date),
       end_date = COALESCE($7, end_date),
       limit_usage = COALESCE($8, limit_usage),
       is_active = COALESCE($9, is_active),
       updated_at = NOW()
     WHERE id = $10
     RETURNING *`,
    [discountName, discountType, value, minimumPurchase, minimumQuantity,
     startDate, endDate, limitUsage, isActive, id]
  );
  return result.rows[0];
};

export const deleteDiscount = async (id) => {
  await pool.query("DELETE FROM discounts WHERE id = $1", [id]);
};

export const attachProduct = async (discountId, productId) => {
  await pool.query(
    "INSERT INTO discount_products (discount_id, product_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [discountId, productId]
  );
};

export const attachSubscription = async (discountId, subscriptionId) => {
  await pool.query(
    "INSERT INTO discount_subscriptions (discount_id, subscription_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [discountId, subscriptionId]
  );
};

export const detachProduct = async (discountId, productId) => {
  await pool.query(
    "DELETE FROM discount_products WHERE discount_id = $1 AND product_id = $2",
    [discountId, productId]
  );
};

export const detachSubscription = async (discountId, subscriptionId) => {
  await pool.query(
    "DELETE FROM discount_subscriptions WHERE discount_id = $1 AND subscription_id = $2",
    [discountId, subscriptionId]
  );
};
