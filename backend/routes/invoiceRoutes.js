import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  listInvoices,
  getInvoice,
  generateInvoice,
  changeInvoiceStatus,
  printInvoice,
  removeInvoice,
} from "../controllers/invoiceController.js";

const router = express.Router();

router.use(protect);

router.get("/", listInvoices);
router.get("/:id", getInvoice);
router.get("/:id/print", printInvoice);

router.post("/generate", authorizeRoles("admin", "internal_user"), generateInvoice);
router.patch("/:id/status", authorizeRoles("admin", "internal_user"), changeInvoiceStatus);
router.delete("/:id", authorizeRoles("admin"), removeInvoice);

export default router;
