import pool from "../config/db.js";

export const getAllProducts = async () => {
  const result = await pool.query(
    `SELECT p.*,
       COALESCE(json_agg(
         json_build_object('id', v.id, 'attribute', v.attribute, 'value', v.value, 'extra_price', v.extra_price)
       ) FILTER (WHERE v.id IS NOT NULL), '[]') AS variants
     FROM products p
     LEFT JOIN product_variants v ON v.product_id = p.id
     GROUP BY p.id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

export const getProductById = async (id) => {
  const result = await pool.query(
    `SELECT p.*,
       COALESCE(json_agg(
         json_build_object('id', v.id, 'attribute', v.attribute, 'value', v.value, 'extra_price', v.extra_price)
       ) FILTER (WHERE v.id IS NOT NULL), '[]') AS variants
     FROM products p
     LEFT JOIN product_variants v ON v.product_id = p.id
     WHERE p.id = $1
     GROUP BY p.id`,
    [id]
  );
  return result.rows[0];
};

export const createProduct = async ({ productName, productType, salesPrice, costPrice, createdBy }) => {
  const result = await pool.query(
    `INSERT INTO products (product_name, product_type, sales_price, cost_price, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [productName, productType, salesPrice, costPrice, createdBy]
  );
  return result.rows[0];
};

export const updateProduct = async (id, { productName, productType, salesPrice, costPrice, isActive }) => {
  const result = await pool.query(
    `UPDATE products SET
       product_name = COALESCE($1, product_name),
       product_type = COALESCE($2, product_type),
       sales_price = COALESCE($3, sales_price),
       cost_price = COALESCE($4, cost_price),
       is_active = COALESCE($5, is_active),
       updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [productName, productType, salesPrice, costPrice, isActive, id]
  );
  return result.rows[0];
};

export const deleteProduct = async (id) => {
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
};

export const addVariant = async (productId, { attribute, value, extraPrice }) => {
  const result = await pool.query(
    `INSERT INTO product_variants (product_id, attribute, value, extra_price)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [productId, attribute, value, extraPrice || 0]
  );
  return result.rows[0];
};

export const deleteVariant = async (variantId) => {
  await pool.query("DELETE FROM product_variants WHERE id = $1", [variantId]);
};
