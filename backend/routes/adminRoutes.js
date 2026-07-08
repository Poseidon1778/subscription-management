import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { createInternalUserHandler, listUsersHandler } from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.post("/internal-users", createInternalUserHandler);
router.get("/users", listUsersHandler);

export default router;
