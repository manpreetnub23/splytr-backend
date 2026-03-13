import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
	createGroup,
	getMyGroups,
	getGroupById,
	addGroupMembers,
	deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", authMiddleware, createGroup);
router.get("/", authMiddleware, getMyGroups);
router.get("/:groupId", authMiddleware, getGroupById);
router.patch("/:groupId/members", authMiddleware, addGroupMembers);
router.delete("/:groupId", authMiddleware, deleteGroup);

export default router;
