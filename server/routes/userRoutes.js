import express from "express";
import auth from "../middleware/auth.js";
import { getMe, updateProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/me", auth, getMe);
router.put("/profile", auth, updateProfile);

export default router;
