import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import { calculateBalances } from "../utils/balance.js";

const isGroupMember = (group, userId) =>
	group.members.some((memberId) => memberId.equals(userId));

export const addExpense = async (req, res) => {
	try {
		const { groupId, amount, description, splits, paidBy } = req.body;

		if (!groupId || !amount || !Array.isArray(splits) || splits.length === 0) {
			return res.status(400).json({ message: "groupId, amount and splits are required" });
		}

		const numericAmount = Number(amount);
		if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
			return res.status(400).json({ message: "Amount must be a positive number" });
		}

		const currentUser = await User.findOne({
			firebaseUid: req.user.uid,
		});

		if (!currentUser) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		const group = await Group.findById(groupId);

		if (!group) {
			return res.status(404).json({ message: "Group not found" });
		}

		if (!isGroupMember(group, currentUser._id)) {
			return res.status(403).json({ message: "You are not a member of this group" });
		}

		const memberIdSet = new Set(group.members.map((id) => String(id)));

		// Resolve who paid — defaults to the current user, but any group member
		// can be recorded as the payer.
		const payerId = paidBy ? String(paidBy) : String(currentUser._id);
		if (!memberIdSet.has(payerId)) {
			return res.status(400).json({ message: "Payer must be a member of the group" });
		}

		// Validate every split belongs to the group and has a sane amount.
		let splitTotal = 0;
		for (const split of splits) {
			const splitUserId = split?.user ? String(split.user) : "";
			const splitAmount = Number(split?.amount);

			if (!splitUserId || !memberIdSet.has(splitUserId)) {
				return res.status(400).json({ message: "Every split must belong to a group member" });
			}
			if (!Number.isFinite(splitAmount) || splitAmount < 0) {
				return res.status(400).json({ message: "Split amounts must be valid numbers" });
			}
			splitTotal += splitAmount;
		}

		// Allow a couple of cents of rounding slack between the total and splits.
		if (Math.abs(splitTotal - numericAmount) > 0.02) {
			return res
				.status(400)
				.json({ message: "Split amounts must add up to the total amount" });
		}

		const expense = await Expense.create({
			group: groupId,
			paidBy: payerId,
			amount: numericAmount,
			description: description?.trim() || "",
			splits: splits.map((split) => ({
				user: split.user,
				amount: Number(split.amount),
			})),
		});

		const populated = await Expense.findById(expense._id)
			.populate("paidBy", "name email photoURL")
			.populate("splits.user", "name email photoURL");

		res.status(201).json(populated);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getGroupExpenses = async (req, res) => {
	try {
		const { groupId } = req.params;

		const currentUser = await User.findOne({ firebaseUid: req.user.uid });
		if (!currentUser) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		const group = await Group.findById(groupId);
		if (!group) {
			return res.status(404).json({ message: "Group not found" });
		}
		if (!isGroupMember(group, currentUser._id)) {
			return res.status(403).json({ message: "You are not a member of this group" });
		}

		const expenses = await Expense.find({ group: groupId })
			.populate("paidBy", "name email photoURL")
			.populate("splits.user", "name email photoURL")
			.sort({ createdAt: -1 });

		res.json(expenses);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getGroupBalances = async (req, res) => {
	try {
		const { groupId } = req.params;

		const currentUser = await User.findOne({ firebaseUid: req.user.uid });
		if (!currentUser) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		const group = await Group.findById(groupId);
		if (!group) {
			return res.status(404).json({ message: "Group not found" });
		}
		if (!isGroupMember(group, currentUser._id)) {
			return res.status(403).json({ message: "You are not a member of this group" });
		}

		const expenses = await Expense.find({ group: groupId });

		const balances = calculateBalances(expenses);

		res.json(balances);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
