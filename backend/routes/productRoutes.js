import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  listProducts,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
  addProductVariant,
  removeProductVariant,
} from "../controllers/productController.js";

const router = express.Router();

router.use(protect);

router.get("/", listProducts);
router.get("/:id", getProduct);

router.post("/", authorizeRoles("admin"), addProduct);
router.put("/:id", authorizeRoles("admin"), editProduct);
router.delete("/:id", authorizeRoles("admin"), removeProduct);

router.post("/:id/variants", authorizeRoles("admin"), addProductVariant);
router.delete("/:id/variants/:variantId", authorizeRoles("admin"), removeProductVariant);

export default router;
