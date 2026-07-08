import {
  getSubscriptionsByStatus,
  getTotalRevenue,
  getPaymentsSummary,
  getOverdueInvoices,
  getDashboardSummary,
} from "../models/reportModel.js";

// GET /api/reports/dashboard
export const dashboardSummary = async (req, res) => {
  try {
    const summary = await getDashboardSummary();
    res.json({ success: true, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching dashboard summary" });
  }
};

// GET /api/reports/subscriptions-by-status
export const subscriptionsByStatus = async (req, res) => {
  try {
    const data = await getSubscriptionsByStatus();
    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching subscription report" });
  }
};

// GET /api/reports/revenue?startDate=2026-01-01&endDate=2026-12-31
export const revenueReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const totalRevenue = await getTotalRevenue({ startDate, endDate });
    res.json({ success: true, totalRevenue, startDate: startDate || null, endDate: endDate || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching revenue report" });
  }
};

// GET /api/reports/payments-summary?startDate=...&endDate=...
export const paymentsSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const summary = await getPaymentsSummary({ startDate, endDate });
    res.json({ success: true, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching payments summary" });
  }
};

// GET /api/reports/overdue-invoices
export const overdueInvoicesReport = async (req, res) => {
  try {
    const invoices = await getOverdueInvoices();
    res.json({ success: true, invoices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching overdue invoices" });
  }
};
