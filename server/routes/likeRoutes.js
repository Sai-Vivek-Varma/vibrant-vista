
import express from "express";
import auth from "../middleware/auth.js";
import {
  getPostLikes,
  toggleLike,
  checkLikeStatus,
} from "../controllers/likeController.js";

const router = express.Router();

// Get all likes for a post - public
router.get("/posts/:postId/likes", getPostLikes);

// Protected routes
router.post("/posts/:postId/likes", auth, toggleLike);
router.get("/posts/:postId/likes/check", auth, checkLikeStatus);

export default router;
