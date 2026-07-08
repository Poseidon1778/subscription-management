import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { listPlans, getPlan, addPlan, editPlan, removePlan } from "../controllers/planController.js";

const router = express.Router();

router.use(protect);

router.get("/", listPlans);
router.get("/:id", getPlan);

router.post("/", authorizeRoles("admin"), addPlan);
router.put("/:id", authorizeRoles("admin"), editPlan);
router.delete("/:id", authorizeRoles("admin"), removePlan);

export default router;
