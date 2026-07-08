import {
  getAllPayments,
  getPaymentById,
  getPaymentsForInvoice,
  getInvoiceOutstanding,
  recordPayment,
  deletePayment,
} from "../models/paymentModel.js";

const VALID_METHODS = ["cash", "card", "bank_transfer", "upi", "cheque", "other"];

export const listPayments = async (req, res) => {
  try {
    const payments = await getAllPayments();
    res.json({ success: true, payments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching payments" });
  }
};

export const getPayment = async (req, res) => {
  try {
    const payment = await getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.json({ success: true, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching payment" });
  }
};

// POST /api/payments  { "invoiceId": 1, "paymentMethod": "card", "amount": 500, "paymentDate": "2026-07-08" }
export const addPayment = async (req, res) => {
  try {
    const { invoiceId, paymentMethod, amount, paymentDate } = req.body;

    if (!invoiceId || !paymentMethod || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "invoiceId, paymentMethod and amount are required",
      });
    }
    if (!VALID_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: `paymentMethod must be one of: ${VALID_METHODS.join(", ")}`,
      });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "amount must be greater than 0" });
    }

    const payment = await recordPayment(invoiceId, {
      paymentMethod, amount, paymentDate, createdBy: req.user.id,
    });
    res.status(201).json({ success: true, payment });
  } catch (err) {
    if (err.message === "INVOICE_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    if (err.message === "INVOICE_CANCELLED") {
      return res.status(400).json({ success: false, message: "Cannot pay a cancelled invoice" });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Error recording payment" });
  }
};

// GET /api/payments/invoice/:invoiceId
export const listPaymentsForInvoice = async (req, res) => {
  try {
    const payments = await getPaymentsForInvoice(req.params.invoiceId);
    const outstanding = await getInvoiceOutstanding(req.params.invoiceId);
    if (!outstanding) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, payments, ...outstanding });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching invoice payments" });
  }
};

export const removePayment = async (req, res) => {
  try {
    await deletePayment(req.params.id);
    res.json({ success: true, message: "Payment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting payment" });
  }
};
