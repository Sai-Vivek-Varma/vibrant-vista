
import express from "express";
import auth from "../middleware/auth.js";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

// Public routes
router.get("/posts/:id/comments", getComments);

// Protected routes
router.post("/posts/:id/comments", auth, addComment);
router.put("/posts/:postId/comments/:commentId", auth, updateComment);
router.delete("/posts/:postId/comments/:commentId", auth, deleteComment);

export default router;
