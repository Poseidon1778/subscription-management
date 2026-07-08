import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  listDiscounts,
  getDiscount,
  addDiscount,
  editDiscount,
  removeDiscount,
  linkProduct,
  unlinkProduct,
  linkSubscription,
  unlinkSubscription,
} from "../controllers/discountController.js";

const router = express.Router();

router.use(protect);

router.get("/", listDiscounts);
router.get("/:id", getDiscount);

router.use(authorizeRoles("admin"));

router.post("/", addDiscount);
router.put("/:id", editDiscount);
router.delete("/:id", removeDiscount);

router.post("/:id/products", linkProduct);
router.delete("/:id/products/:productId", unlinkProduct);
router.post("/:id/subscriptions", linkSubscription);
router.delete("/:id/subscriptions/:subscriptionId", unlinkSubscription);

export default router;
