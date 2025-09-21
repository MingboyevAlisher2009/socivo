import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import { getContacts } from "../controllers/contacts.controller.js";

const router = new Router();

router.get("/", AuthMiddleware, getContacts);

export default router;
