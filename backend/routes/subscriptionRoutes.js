import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  listSubscriptions,
  getSubscription,
  addSubscription,
  editSubscription,
  removeSubscription,
  changeSubscriptionStatus,
  addLine,
  removeLine,
} from "../controllers/subscriptionController.js";

const router = express.Router();

router.use(protect);

router.get("/", listSubscriptions);
router.get("/:id", getSubscription);

router.post("/", authorizeRoles("admin", "internal_user"), addSubscription);
router.put("/:id", authorizeRoles("admin", "internal_user"), editSubscription);
router.delete("/:id", authorizeRoles("admin"), removeSubscription);

router.patch("/:id/status", authorizeRoles("admin", "internal_user"), changeSubscriptionStatus);

router.post("/:id/lines", authorizeRoles("admin", "internal_user"), addLine);
router.delete("/:id/lines/:lineId", authorizeRoles("admin", "internal_user"), removeLine);

export default router;
