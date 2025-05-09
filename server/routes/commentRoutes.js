import express from "express";
import auth from "../middleware/auth.js";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.get("/:id/comments", getComments);

// Protected routes
router.post("/:id/comments", auth, addComment);
router.put("/:postId/comments/:commentId", auth, updateComment);
router.delete("/:postId/comments/:commentId", auth, deleteComment);

export default router;
