import { Router } from "express";
import {
  deleteAvatar,
  getMe,
  login,
  search,
  sendOtp,
  signUp,
  updateAvatar,
  updateUser,
  verifyOtp,
} from "../controllers/auth.controller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/avatars" });

router.get("/:id", AuthMiddleware, getMe);
router.get("/search/:identify", AuthMiddleware, search)
router.post("/login", login);
router.post("/verify", verifyOtp);
router.post("/send-otp", sendOtp);
router.post("/sign-up", signUp);
router.post("/upload-avatar", AuthMiddleware, upload.single("avatar"), updateAvatar);
router.put("/update/:id", AuthMiddleware, updateUser)
router.delete("/avatar/:id", AuthMiddleware, deleteAvatar);


export default router;
