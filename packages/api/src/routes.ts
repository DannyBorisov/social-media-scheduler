import express from "express";
import { auth } from "./firebase";

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

router.post("/api/verify-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const decodedToken = await auth.verifyIdToken(token);
    res.json({ uid: decodedToken.uid, email: decodedToken.email });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
