import { Router } from "express";
import {
  deleteImage,
  getMessages,
  messageRed,
  sendMessage,
  uploadImage,
} from "../controllers/messages.controller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";

const router = new Router();
const upload = multer({ dest: "uploads/images" });

router.post("/send-message", AuthMiddleware, sendMessage);
router.post("/message-read", AuthMiddleware, messageRed);
router.post(
  "/upload-image",
  AuthMiddleware,
  upload.single("image"),
  uploadImage
);

router.delete("/delete-image/:image", AuthMiddleware, deleteImage);
router.get("/:recipientId", AuthMiddleware, getMessages);

export default router;
