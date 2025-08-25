import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import { getNotifications } from "../controllers/notifications.controller.js";

const router = Router();

router.get("/", AuthMiddleware, getNotifications);

export default router;
