
import express from "express";
import auth from "../middleware/auth.js";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  getPostsByCategory,
  searchPosts,
  getFeaturedPosts,
  getLatestPosts,
  getTrendingPosts,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/categories", getCategories);
router.get("/categories/:name/posts", getPostsByCategory);
router.get("/featured", getFeaturedPosts);
router.get("/latest", getLatestPosts);
router.get("/trending", getTrendingPosts); // Add trending posts route
router.get("/:id", getPost);

// Protected routes
router.post("/", auth, createPost);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);

export default router;
