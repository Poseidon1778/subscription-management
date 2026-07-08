import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  listPayments,
  getPayment,
  addPayment,
  listPaymentsForInvoice,
  removePayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.use(protect);

router.get("/", listPayments);
router.get("/invoice/:invoiceId", listPaymentsForInvoice);
router.get("/:id", getPayment);

router.post("/", authorizeRoles("admin", "internal_user"), addPayment);
router.delete("/:id", authorizeRoles("admin"), removePayment);

export default router;
