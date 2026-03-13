import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { syncUser, getMe } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/sync", authMiddleware, syncUser);
router.get("/me", authMiddleware, getMe);

export default router;
