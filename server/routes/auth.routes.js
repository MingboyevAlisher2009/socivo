import { Router } from "express";
import {
  deleteAvatar,
  getMe,
  getSuggestedUsers,
  login,
  logout,
  search,
  sendOtp,
  signUp,
  updateAvatar,
  updateUser,
  verifyOtp,
} from "../controllers/auth.controller.js";
import AuthMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";

const router = new Router();
const upload = multer({ dest: "uploads/avatars" });

router.get("/suggested-users", AuthMiddleware, getSuggestedUsers);
router.get("/search/:identify", AuthMiddleware, search);
router.get("/:id", AuthMiddleware, getMe);
router.post("/login", login);
router.post("/verify", verifyOtp);
router.post("/send-otp", sendOtp);
router.post("/sign-up", signUp);
router.post("/logout", AuthMiddleware, logout);
router.post(
  "/upload-avatar",
  AuthMiddleware,
  upload.single("avatar"),
  updateAvatar
);
router.put("/update/:id", AuthMiddleware, updateUser);
router.delete("/avatar/:id", AuthMiddleware, deleteAvatar);

export default router;
