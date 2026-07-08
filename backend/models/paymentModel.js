import pool from "../config/db.js";

export const generatePaymentNumber = async () => {
  const result = await pool.query("SELECT COUNT(*) FROM payments");
  const count = parseInt(result.rows[0].count, 10) + 1;
  return `PAY-${String(count).padStart(5, "0")}`;
};

export const getAllPayments = async () => {
  const result = await pool.query(
    `SELECT p.*, i.invoice_number, i.total_amount AS invoice_total
     FROM payments p
     JOIN invoices i ON i.id = p.invoice_id
     ORDER BY p.created_at DESC`
  );
  return result.rows;
};

export const getPaymentById = async (id) => {
  const result = await pool.query(
    `SELECT p.*, i.invoice_number, i.total_amount AS invoice_total
     FROM payments p
     JOIN invoices i ON i.id = p.invoice_id
     WHERE p.id = $1`,
    [id]
  );
  return result.rows[0];
};

export const getPaymentsForInvoice = async (invoiceId) => {
  const result = await pool.query(
    "SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date",
    [invoiceId]
  );
  return result.rows;
};

export const getInvoiceOutstanding = async (invoiceId) => {
  const invoiceResult = await pool.query("SELECT total_amount FROM invoices WHERE id = $1", [invoiceId]);
  const invoice = invoiceResult.rows[0];
  if (!invoice) return null;

  const paidResult = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = $1",
    [invoiceId]
  );
  const totalPaid = parseFloat(paidResult.rows[0].total_paid);
  const totalAmount = parseFloat(invoice.total_amount);

  return {
    totalAmount,
    totalPaid,
    outstanding: Math.max(totalAmount - totalPaid, 0),
  };
};

// Records a payment, and if the invoice becomes fully paid, flips its status to 'paid'
export const recordPayment = async (invoiceId, { paymentMethod, amount, paymentDate, createdBy }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const invoiceResult = await client.query("SELECT * FROM invoices WHERE id = $1 FOR UPDATE", [invoiceId]);
    const invoice = invoiceResult.rows[0];
    if (!invoice) throw new Error("INVOICE_NOT_FOUND");
    if (invoice.status === "cancelled") throw new Error("INVOICE_CANCELLED");

    const countResult = await client.query("SELECT COUNT(*) FROM payments");
    const paymentNumber = `PAY-${String(parseInt(countResult.rows[0].count, 10) + 1).padStart(5, "0")}`;

    const paymentResult = await client.query(
      `INSERT INTO payments (payment_number, invoice_id, payment_method, amount, payment_date, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [paymentNumber, invoiceId, paymentMethod, amount, paymentDate || new Date(), createdBy]
    );
    const payment = paymentResult.rows[0];

    const paidResult = await client.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE invoice_id = $1",
      [invoiceId]
    );
    const totalPaid = parseFloat(paidResult.rows[0].total_paid);

    if (totalPaid >= parseFloat(invoice.total_amount) && invoice.status !== "paid") {
      await client.query("UPDATE invoices SET status = 'paid', updated_at = NOW() WHERE id = $1", [invoiceId]);
    }

    await client.query("COMMIT");
    return payment;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const deletePayment = async (id) => {
  await pool.query("DELETE FROM payments WHERE id = $1", [id]);
};
