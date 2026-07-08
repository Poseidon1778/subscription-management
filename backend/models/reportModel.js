import pool from "../config/db.js";

export const getActiveSubscriptionsCount = async () => {
  const result = await pool.query(
    "SELECT COUNT(*) AS count FROM subscriptions WHERE status = 'active'"
  );
  return parseInt(result.rows[0].count, 10);
};

export const getSubscriptionsByStatus = async () => {
  const result = await pool.query(
    "SELECT status, COUNT(*) AS count FROM subscriptions GROUP BY status"
  );
  return result.rows;
};

export const getTotalRevenue = async ({ startDate, endDate } = {}) => {
  const params = [];
  let whereClause = "WHERE status = 'paid'";

  if (startDate) {
    params.push(startDate);
    whereClause += ` AND invoice_date >= $${params.length}`;
  }
  if (endDate) {
    params.push(endDate);
    whereClause += ` AND invoice_date <= $${params.length}`;
  }

  const result = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM invoices ${whereClause}`,
    params
  );
  return parseFloat(result.rows[0].total_revenue);
};

export const getPaymentsSummary = async ({ startDate, endDate } = {}) => {
  const params = [];
  let whereClause = "";

  if (startDate) {
    params.push(startDate);
    whereClause += ` ${whereClause ? "AND" : "WHERE"} payment_date >= $${params.length}`;
  }
  if (endDate) {
    params.push(endDate);
    whereClause += ` ${whereClause ? "AND" : "WHERE"} payment_date <= $${params.length}`;
  }

  const result = await pool.query(
    `SELECT payment_method, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
     FROM payments ${whereClause}
     GROUP BY payment_method`,
    params
  );
  return result.rows;
};

export const getOverdueInvoices = async () => {
  const result = await pool.query(
    `SELECT i.*, u.full_name AS customer_name, s.subscription_number
     FROM invoices i
     JOIN users u ON u.id = i.customer_id
     JOIN subscriptions s ON s.id = i.subscription_id
     WHERE i.status IN ('confirmed', 'draft')
       AND i.due_date IS NOT NULL
       AND i.due_date < CURRENT_DATE
     ORDER BY i.due_date ASC`
  );
  return result.rows;
};

export const getDashboardSummary = async () => {
  const [activeSubsResult, revenueResult, outstandingResult, overdueCountResult] = await Promise.all([
    pool.query("SELECT COUNT(*) AS count FROM subscriptions WHERE status = 'active'"),
    pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM invoices WHERE status = 'paid'"),
    pool.query(
      `SELECT COALESCE(SUM(i.total_amount), 0) - COALESCE((
         SELECT SUM(p.amount) FROM payments p
         JOIN invoices ii ON ii.id = p.invoice_id
         WHERE ii.status != 'cancelled'
       ), 0) AS outstanding
       FROM invoices i WHERE i.status != 'cancelled'`
    ),
    pool.query(
      "SELECT COUNT(*) AS count FROM invoices WHERE status IN ('confirmed','draft') AND due_date < CURRENT_DATE"
    ),
  ]);

  return {
    activeSubscriptions: parseInt(activeSubsResult.rows[0].count, 10),
    totalRevenue: parseFloat(revenueResult.rows[0].total),
    outstandingAmount: parseFloat(outstandingResult.rows[0].outstanding),
    overdueInvoicesCount: parseInt(overdueCountResult.rows[0].count, 10),
  };
};
