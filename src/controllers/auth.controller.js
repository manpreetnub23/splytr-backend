import User from "../models/User.js";

export const syncUser = async (req, res) => {
	try {
		const { uid, email, name, picture } = req.user;

		if (!uid || !email) {
			return res.status(400).json({ message: "Invalid auth payload" });
		}

		let user = await User.findOne({ firebaseUid: uid });

		if (!user) {
			user = await User.findOne({ email });
		}

		if (!user) {
			user = new User({
				firebaseUid: uid,
				email,
			});
		}

		user.firebaseUid = uid;
		user.email = email;
		user.name = name || user.name;
		user.photoURL = picture || user.photoURL;
		await user.save();

		res.json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findOne({ firebaseUid: req.user.uid });

		if (!user) {
			return res.status(404).json({ message: "User not found. Please sign in again." });
		}

		res.json(user);
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};
