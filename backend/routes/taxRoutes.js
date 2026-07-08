import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { listTaxes, getTax, addTax, editTax, removeTax } from "../controllers/taxController.js";

const router = express.Router();

router.use(protect);

router.get("/", listTaxes);
router.get("/:id", getTax);

router.post("/", authorizeRoles("admin"), addTax);
router.put("/:id", authorizeRoles("admin"), editTax);
router.delete("/:id", authorizeRoles("admin"), removeTax);

export default router;
