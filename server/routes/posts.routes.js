import { Router } from "express";
import AuthMiddleware from "../middleware/auth.middleware.js";
import {
  comment,
  createPost,
  deletePost,
  getPostById,
  getPosts,
  like,
  toggleFollow,
} from "../controllers/posts.controller.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/posts" });

router.get("/", AuthMiddleware, getPosts);
router.get("/:id", AuthMiddleware, getPostById);
router.post("/", AuthMiddleware, upload.single("post"), createPost);
router.post("/follow", AuthMiddleware, toggleFollow);
router.post("/like", AuthMiddleware, like);
router.post("/comment", AuthMiddleware, comment);
router.delete("/:id", AuthMiddleware, deletePost);

export default router;
