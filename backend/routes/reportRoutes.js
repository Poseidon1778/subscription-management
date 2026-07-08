import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  dashboardSummary,
  subscriptionsByStatus,
  revenueReport,
  paymentsSummaryReport,
  overdueInvoicesReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin", "internal_user"));

router.get("/dashboard", dashboardSummary);
router.get("/subscriptions-by-status", subscriptionsByStatus);
router.get("/revenue", revenueReport);
router.get("/payments-summary", paymentsSummaryReport);
router.get("/overdue-invoices", overdueInvoicesReport);

export default router;
