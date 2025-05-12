
import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserPosts,
  getUserStats,
  getTopUsers,
  getSuggestedUsers,
  getMe
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/:id", getUserProfile);
router.get("/:id/posts", getUserPosts);
router.get("/top/posters", getTopUsers);

// Protected routes
router.get("/me", auth, getMe);  // New specific endpoint for current user
router.get("/me/profile", auth, getUserProfile);
router.put("/me/profile", auth, updateUserProfile);
router.put("/:id", auth, updateUserProfile);
router.get("/:id/stats", auth, getUserStats);
router.get("/me/stats", auth, getUserStats);
router.get("/suggested/follow", auth, getSuggestedUsers);

export default router;
