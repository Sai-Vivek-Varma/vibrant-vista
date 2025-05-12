import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  getUserStats,
  getTopUsers,
  getSuggestedUsers,
  getMe,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/top/posters", getTopUsers);
router.get("/:id/posts", getUserPosts);
router.get("/:id", getUserProfile);

// Protected routes - /me routes first
router.get("/me", auth, getMe);
router.put("/me/profile", auth, updateUserProfile);
router.get("/me/stats", auth, getUserStats);

// Other protected routes
router.get("/:id/stats", auth, getUserStats);
router.put("/:id", auth, updateUserProfile);
router.get("/suggested/follow", auth, getSuggestedUsers);

export default router;
