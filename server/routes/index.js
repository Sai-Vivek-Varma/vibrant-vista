
import express from "express";
import authRoutes from "./authRoutes.js";
import postRoutes from "./postRoutes.js";
import userRoutes from "./userRoutes.js";
import commentRoutes from "./commentRoutes.js";
import likeRoutes from "./likeRoutes.js";

const router = express.Router();

// Register all routes
router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/users", userRoutes);
router.use("/", commentRoutes); // Note: This route includes /posts/:id/comments
router.use("/", likeRoutes);

export default router;
