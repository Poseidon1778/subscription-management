import pool from "../config/db.js";

const STATUS_FLOW = ["draft", "confirmed", "paid"];

export const generateInvoiceNumber = async () => {
  const result = await pool.query("SELECT COUNT(*) FROM invoices");
  const count = parseInt(result.rows[0].count, 10) + 1;
  return `INV-${String(count).padStart(5, "0")}`;
};

export const getAllInvoices = async () => {
  const result = await pool.query(
    `SELECT i.*, u.full_name AS customer_name, s.subscription_number
     FROM invoices i
     JOIN users u ON u.id = i.customer_id
     JOIN subscriptions s ON s.id = i.subscription_id
     ORDER BY i.created_at DESC`
  );
  return result.rows;
};

export const getInvoiceById = async (id) => {
  const invoiceResult = await pool.query(
    `SELECT i.*, u.full_name AS customer_name, u.email AS customer_email, s.subscription_number
     FROM invoices i
     JOIN users u ON u.id = i.customer_id
     JOIN subscriptions s ON s.id = i.subscription_id
     WHERE i.id = $1`,
    [id]
  );
  const invoice = invoiceResult.rows[0];
  if (!invoice) return null;

  const linesResult = await pool.query(
    `SELECT il.*, p.product_name
     FROM invoice_lines il
     JOIN products p ON p.id = il.product_id
     WHERE il.invoice_id = $1`,
    [id]
  );
  invoice.lines = linesResult.rows;
  return invoice;
};

// Generate an invoice automatically from a subscription's lines
export const generateInvoiceFromSubscription = async (subscriptionId, { dueDate, createdBy }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const subResult = await client.query(
      "SELECT * FROM subscriptions WHERE id = $1",
      [subscriptionId]
    );
    const subscription = subResult.rows[0];
    if (!subscription) {
      throw new Error("SUBSCRIPTION_NOT_FOUND");
    }

    const linesResult = await client.query(
      "SELECT * FROM subscription_lines WHERE subscription_id = $1",
      [subscriptionId]
    );
    const subLines = linesResult.rows;
    if (subLines.length === 0) {
      throw new Error("NO_SUBSCRIPTION_LINES");
    }

    const countResult = await client.query("SELECT COUNT(*) FROM invoices");
    const invoiceNumber = `INV-${String(parseInt(countResult.rows[0].count, 10) + 1).padStart(5, "0")}`;

    const totalAmount = subLines.reduce((sum, line) => sum + parseFloat(line.amount), 0);

    const invoiceResult = await client.query(
      `INSERT INTO invoices (invoice_number, subscription_id, customer_id, total_amount, due_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [invoiceNumber, subscriptionId, subscription.customer_id, totalAmount, dueDate || null, createdBy]
    );
    const invoice = invoiceResult.rows[0];

    for (const line of subLines) {
      await client.query(
        `INSERT INTO invoice_lines (invoice_id, product_id, quantity, unit_price, tax_percent)
         VALUES ($1,$2,$3,$4,$5)`,
        [invoice.id, line.product_id, line.quantity, line.unit_price, line.tax_percent]
      );
    }

    await client.query("COMMIT");
    return invoice;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getInvoiceStatus = async (id) => {
  const result = await pool.query("SELECT status FROM invoices WHERE id = $1", [id]);
  return result.rows[0]?.status;
};

export const isValidInvoiceTransition = (current, next) => {
  if (next === "cancelled") return current !== "paid"; // can cancel unless already paid
  const currentIndex = STATUS_FLOW.indexOf(current);
  const nextIndex = STATUS_FLOW.indexOf(next);
  return nextIndex === currentIndex + 1;
};

export const updateInvoiceStatus = async (id, newStatus) => {
  const result = await pool.query(
    "UPDATE invoices SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
    [newStatus, id]
  );
  return result.rows[0];
};

export const deleteInvoice = async (id) => {
  await pool.query("DELETE FROM invoices WHERE id = $1", [id]);
};

export { STATUS_FLOW };
