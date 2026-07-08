import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  listTemplates,
  getTemplate,
  addTemplate,
  editTemplate,
  removeTemplate,
  addLine,
  removeLine,
} from "../controllers/templateController.js";

const router = express.Router();

router.use(protect);

router.get("/", listTemplates);
router.get("/:id", getTemplate);

router.post("/", authorizeRoles("admin", "internal_user"), addTemplate);
router.put("/:id", authorizeRoles("admin", "internal_user"), editTemplate);
router.delete("/:id", authorizeRoles("admin"), removeTemplate);

router.post("/:id/lines", authorizeRoles("admin", "internal_user"), addLine);
router.delete("/:id/lines/:lineId", authorizeRoles("admin", "internal_user"), removeLine);

export default router;
