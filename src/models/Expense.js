import mongoose from "mongoose";

const splitSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	amount: Number,
});

const expenseSchema = new mongoose.Schema(
	{
		group: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Group",
			required: true,
		},
		paidBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		amount: Number,
		description: String,
		splits: [splitSchema],
	},
	{ timestamps: true },
);

export default mongoose.model("Expense", expenseSchema);
