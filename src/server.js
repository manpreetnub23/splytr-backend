import dotenv from "dotenv";
dotenv.config();
import "./config/firebase.js";
import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 8000;

connectDB();

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
