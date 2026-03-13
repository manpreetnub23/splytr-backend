import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
import User from "../models/User.js";

export const createGroup = async (req, res) => {
	try {
		const { name, memberIds = [] } = req.body;

		if (!name) {
			return res.status(400).json({ message: "Group name required" });
		}

		const currentUser = await User.findOne({
			firebaseUid: req.user.uid,
		});

		if (!currentUser) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		const members = [
			currentUser._id,
			...memberIds.filter((id) => id !== String(currentUser._id)),
		];

		const group = await Group.create({
			name,
			createdBy: currentUser._id,
			members,
		});

		res.status(201).json(group);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getMyGroups = async (req, res) => {
	try {
		const currentUser = await User.findOne({
			firebaseUid: req.user.uid,
		});

		if (!currentUser) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		const groups = await Group.find({
			members: currentUser._id,
		})
			.populate("members", "name email photoURL")
			.sort({ createdAt: -1 });

		res.json(groups);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getGroupById = async (req, res) => {
	try {
		const group = await Group.findById(req.params.groupId).populate(
			"members",
			"name email photoURL",
		);

		if (!group) {
			return res.status(404).json({ message: "Group not found" });
		}

		res.json(group);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const addGroupMembers = async (req, res) => {
	try {
		const { groupId } = req.params;
		const { memberIds = [] } = req.body;

		if (!Array.isArray(memberIds) || memberIds.length === 0) {
			return res.status(400).json({ message: "memberIds are required" });
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

		const isMember = group.members.some((memberId) => memberId.equals(currentUser._id));

		if (!isMember) {
			return res.status(403).json({ message: "You are not a member of this group" });
		}

		const existing = new Set(group.members.map((id) => String(id)));
		for (const memberId of memberIds) {
			existing.add(String(memberId));
		}

		group.members = Array.from(existing);
		await group.save();

		const updatedGroup = await Group.findById(groupId).populate("members", "name email photoURL");
		res.json(updatedGroup);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const deleteGroup = async (req, res) => {
	try {
		const { groupId } = req.params;

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

		// Only the group creator can delete it.
		if (!group.createdBy.equals(currentUser._id)) {
			return res.status(403).json({ message: "Only the group creator can delete this group" });
		}

		// Remove the group and all of its expenses so nothing is orphaned.
		await Expense.deleteMany({ group: group._id });
		await group.deleteOne();

		res.json({ message: "Group deleted", groupId });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
