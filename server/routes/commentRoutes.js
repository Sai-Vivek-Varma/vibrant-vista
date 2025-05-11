
import express from "express";
import auth from "../middleware/auth.js";
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  addReplyToComment,
  likeReply
} from "../controllers/commentController.js";

const router = express.Router();

// Public routes
router.get("/:id/comments", getComments);

// Protected routes
router.post("/:id/comments", auth, addComment);
router.put("/:postId/comments/:commentId", auth, updateComment);
router.delete("/:postId/comments/:commentId", auth, deleteComment);
router.post("/:postId/comments/:commentId/like", auth, likeComment);
router.post("/:postId/comments/:commentId/reply", auth, addReplyToComment);
router.post("/:postId/comments/:commentId/replies/:replyId/like", auth, likeReply);

export default router;
