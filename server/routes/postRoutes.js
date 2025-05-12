
import express from "express";
import auth from "../middleware/auth.js";
import {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  getPopularCategories,
  getPostsByCategory,
  searchPosts,
  getFeaturedPosts,
  getLatestPosts,
  getTrendingPosts,
  getPostsByTag,
  getPopularTags
} from "../controllers/postController.js";

const router = express.Router();

// Public routes
router.get("/", getPosts);
router.get("/search", searchPosts);
router.get("/categories", getCategories);
router.get("/popular-categories", getPopularCategories);
router.get("/categories/:name/posts", getPostsByCategory);
router.get("/featured", getFeaturedPosts);
router.get("/latest", getLatestPosts);
router.get("/trending", getTrendingPosts);
router.get("/tags/:tag", getPostsByTag);
router.get("/popular-tags", getPopularTags);
router.get("/:id", getPost);

// Protected routes
router.post("/", auth, createPost);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);

export default router;
