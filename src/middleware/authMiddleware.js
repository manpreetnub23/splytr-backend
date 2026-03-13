import admin from "firebase-admin";

const authMiddleware = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({ message: "No token provided" });
		}

		const token = authHeader.split(" ")[1];
		const decodedToken = await admin.auth().verifyIdToken(token);

		req.user = decodedToken;
		next();
	} catch (error) {
		console.error("Auth verification failed:", error?.code || error?.message || error);
		return res.status(401).json({ message: "Invalid or expired token" });
	}
};

export default authMiddleware;
