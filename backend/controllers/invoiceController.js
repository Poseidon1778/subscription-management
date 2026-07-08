import {
  getAllInvoices,
  getInvoiceById,
  generateInvoiceFromSubscription,
  getInvoiceStatus,
  isValidInvoiceTransition,
  updateInvoiceStatus,
  deleteInvoice,
  STATUS_FLOW,
} from "../models/invoiceModel.js";

export const listInvoices = async (req, res) => {
  try {
    const invoices = await getAllInvoices();
    res.json({ success: true, invoices });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching invoices" });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching invoice" });
  }
};

// POST /api/invoices/generate  { "subscriptionId": 1, "dueDate": "2026-08-01" }
export const generateInvoice = async (req, res) => {
  try {
    const { subscriptionId, dueDate } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, message: "subscriptionId is required" });
    }
    const invoice = await generateInvoiceFromSubscription(subscriptionId, { dueDate, createdBy: req.user.id });
    res.status(201).json({ success: true, invoice });
  } catch (err) {
    if (err.message === "SUBSCRIPTION_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }
    if (err.message === "NO_SUBSCRIPTION_LINES") {
      return res.status(400).json({ success: false, message: "Subscription has no order lines to invoice" });
    }
    console.error(err);
    res.status(500).json({ success: false, message: "Error generating invoice" });
  }
};

// PATCH /api/invoices/:id/status  { "status": "confirmed" }  -- confirm/send handled via status; cancel too
export const changeInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;
    const allStatuses = [...STATUS_FLOW, "cancelled"];

    if (!allStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${allStatuses.join(", ")}`,
      });
    }

    const currentStatus = await getInvoiceStatus(id);
    if (!currentStatus) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (!isValidInvoiceTransition(currentStatus, newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from '${currentStatus}' to '${newStatus}'. Flow is: ${STATUS_FLOW.join(" → ")} (or cancel before paid)`,
      });
    }

    const invoice = await updateInvoiceStatus(id, newStatus);
    res.json({ success: true, invoice });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating invoice status" });
  }
};

// GET /api/invoices/:id/print -- returns invoice data formatted for printing (frontend renders it)
export const printInvoice = async (req, res) => {
  try {
    const invoice = await getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, invoice, printReady: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error preparing invoice for print" });
  }
};

export const removeInvoice = async (req, res) => {
  try {
    await deleteInvoice(req.params.id);
    res.json({ success: true, message: "Invoice deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting invoice" });
  }
};
