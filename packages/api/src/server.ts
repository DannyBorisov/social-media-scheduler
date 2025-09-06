import express from "express";
import { auth } from "./firebase.js";
import cors from "cors";

const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());
app.use(cors());

export function start() {
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Firebase Auth API is running" });
  });

  app.post("/api/verify-token", async (req, res) => {
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

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
