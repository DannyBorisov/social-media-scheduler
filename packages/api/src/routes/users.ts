import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const connectedChannels = {
      facebook: !!user.facebook,
      instagram: !!user.instagram,
      linkedin: !!user.linkedin,
    };

    res.json({
      ...user,
      connectedChannels,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or update user
router.post("/", async (req, res) => {
  try {
    const { id, ...params } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Firebase UID (id) is required" });
    }

    const user = await prisma.user.upsert({
      where: { id },
      update: { ...params },
      create: { id, ...params },
    });

    const connectedChannels = {
      facebook: !!user.facebook,
      instagram: !!user.instagram,
      linkedin: !!user.linkedin,
    };

    res.json({ ...user, connectedChannels });
  } catch (error) {
    console.error("Error creating/updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/channels/:channel", async (req, res) => {
  try {
    const { id, channel } = req.params;
    const { token } = req.body;

    if (!["facebook", "instagram", "linkedin"].includes(channel)) {
      return res.status(400).json({ error: "Invalid channel" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        [channel]: token,
      },
    });

    const connectedChannels = {
      facebook: !!user.facebook,
      instagram: !!user.instagram,
      linkedin: !!user.linkedin,
    };

    res.json({
      ...user,
      connectedChannels,
    });
  } catch (error) {
    console.error("Error connecting channel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Disconnect a channel for a user
router.delete("/:id/channels/:channel", async (req, res) => {
  try {
    const { id, channel } = req.params;

    if (!["facebook", "instagram", "linkedin"].includes(channel)) {
      return res.status(400).json({ error: "Invalid channel" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        [channel]: null,
      },
    });

    const connectedChannels = {
      facebook: !!user.facebook,
      instagram: !!user.instagram,
      linkedin: !!user.linkedin,
    };

    res.json({
      ...user,
      connectedChannels,
    });
  } catch (error) {
    console.error("Error disconnecting channel:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
