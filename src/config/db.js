import mongoose from "mongoose";

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("mongoose connected");
	} catch (e) {
		console.log(e);
	}
};

export default connectDB;
