import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import {
  getNotifications,
  notificationRead,
} from "../controllers/notifications.controller.js";

const router = Router();

router.get("/", AuthMiddleware, getNotifications);
router.put("/read/:id", AuthMiddleware, notificationRead);

export default router;
