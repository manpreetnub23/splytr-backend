import mongoose from "mongoose";

const friendSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		friendId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true },
);

// same friend twice add na ho
friendSchema.index({ userId: 1, friendId: 1 }, { unique: true });

export default mongoose.model("Friend", friendSchema);
