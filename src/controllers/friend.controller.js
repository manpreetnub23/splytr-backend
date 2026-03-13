import Friend from "../models/Friend.js";
import User from "../models/User.js";

export const addFriend = async (req, res) => {
	try {
		const { email } = req.body;

		if (!email) {
			return res.status(400).json({ message: "Email required" });
		}

		const currentUser = await User.findOne({
			firebaseUid: req.user.uid,
		});

		if (!currentUser) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		const friendUser = await User.findOne({ email });

		if (!friendUser) {
			return res.status(404).json({ message: "User not found" });
		}

		if (currentUser._id.equals(friendUser._id)) {
			return res.status(400).json({ message: "Cannot add yourself" });
		}

		const friend = await Friend.create({
			userId: currentUser._id,
			friendId: friendUser._id,
		});

		res.status(201).json(friend);
	} catch (error) {
		if (error.code === 11000) {
			return res.status(400).json({ message: "Already added" });
		}
		res.status(500).json({ message: error.message });
	}
};

export const getFriends = async (req, res) => {
	try {
		const currentUser = await User.findOne({
			firebaseUid: req.user.uid,
		});

		if (!currentUser) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		const friends = await Friend.find({ userId: currentUser._id }).populate(
			"friendId",
			"name email photoURL",
		);

		res.json(friends);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const removeFriend = async (req, res) => {
	try {
		const { friendId } = req.params;

		const currentUser = await User.findOne({
			firebaseUid: req.user.uid,
		});

		if (!currentUser) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		// `friendId` here is the friendship document's own _id.
		const friend = await Friend.findById(friendId);

		if (!friend) {
			return res.status(404).json({ message: "Friend not found" });
		}

		if (!friend.userId.equals(currentUser._id)) {
			return res.status(403).json({ message: "You can only remove your own friends" });
		}

		await friend.deleteOne();

		res.json({ message: "Friend removed", friendId });
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
