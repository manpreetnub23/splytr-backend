import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addFriend, getFriends, removeFriend } from "../controllers/friend.controller.js";

const router = express.Router();

router.post("/", authMiddleware, addFriend);
router.get("/", authMiddleware, getFriends);
router.delete("/:friendId", authMiddleware, removeFriend);

export default router;
