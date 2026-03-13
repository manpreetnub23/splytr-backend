import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
	addExpense,
	getGroupExpenses,
	getGroupBalances,
} from "../controllers/expense.controller.js";

const router = express.Router();

router.post("/", authMiddleware, addExpense);
router.get("/:groupId", authMiddleware, getGroupExpenses);
router.get("/balances/:groupId", authMiddleware, getGroupBalances);

export default router;
