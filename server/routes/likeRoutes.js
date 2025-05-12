
import express from "express";
import auth from "../middleware/auth.js";
import {
  getPostLikes,
  toggleLike,
  checkLikeStatus,
  getLikeUsers,
  getLikedPosts
} from "../controllers/likeController.js";

const router = express.Router();

// Public routes
router.get("/posts/:postId/likes", getPostLikes);
router.get("/posts/:postId/likes/users", getLikeUsers);

// Protected routes
router.post("/posts/:postId/likes", auth, toggleLike);
router.get("/posts/:postId/likes/check", auth, checkLikeStatus);
router.get("/users/:userId/liked-posts", auth, getLikedPosts);
router.get("/users/me/liked-posts", auth, getLikedPosts);

export default router;
