import express from "express";
import { auth, storage } from "./firebase";
import { prisma } from "./lib/prisma";
import { Channel } from "@prisma/client";
import crypto, { randomUUID } from "crypto";
import {
  facebookApi,
  FacebookAPI,
  FacebookScope,
  InstagramScope,
} from "./plugins/facebook";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const authenticate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  auth.verifyIdToken(token).catch((error) => {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Unauthorized" });
  });
  const decoded = await auth.verifyIdToken(token);
  (req as any).userId = decoded.uid;
  next();
};

enum Provider {
  Facebook = "facebook",
  Tiktok = "tiktok",
  Instagram = "instagram",
}

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

router.get("/user/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  const user = await prisma.user.findUnique({
    where: { id },
    include: { facebook: true },
  });

  if (!user) {
    return;
  }

  if (user.facebook && user.facebook.pages) {
    const pages = user.facebook.pages.map((pageStr) => JSON.parse(pageStr));
    user.facebook = { ...user.facebook, pages };
  }

  res.json(user);
});

router.post("/user", async (req, res) => {
  const user = req.body;
  await prisma.user.create({ data: user });
  res.json(user);
});

router.get("/channel/auth/:provider", authenticate, async (req, res) => {
  const { provider } = req.params as { provider: Provider };
  if (provider === Provider.Facebook) {
    const authURL = await facebookApi.getAuthUrl(FacebookScope);
    res.json({ url: authURL });
  }
  if (provider === Provider.Instagram) {
    const authURL = await facebookApi.getAuthUrl(InstagramScope);
    res.json({ url: authURL });
  }

  if (provider === Provider.Tiktok) {
    const queryParams = new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY as string,
      redirect_uri: process.env.TIKTOK_REDIRECT_URI as string,
      response_type: "code",
      scope: "user.info.basic,video.list,video.upload",
      state: randomUUID(),
      code_challenge: crypto
        .createHash("sha256")
        .update(process.env.TIKTOK_CODE_VERIFIER as string)
        .digest("hex"),
      code_challenge_method: "S256",
    });
    const authURL = `https://www.tiktok.com/v2/auth/authorize/?${queryParams.toString()}`;
    res.json({ url: authURL });
  }
});

router.get(
  "/channel/auth/:provider/callback",
  authenticate,
  async (req, res) => {
    const { provider } = req.params as { provider: Provider };
    const { code } = req.query as { code: string };

    if (provider === Provider.Facebook) {
      const result = await facebookApi.handleCallback(
        code,
        req.userId as string
      );
      res.json(result);
    }
  }
);

router.post("/channel/:provider/post", authenticate, async (req, res) => {
  const { provider } = req.params as { provider: Provider };
  const { params } = req.body;
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { facebook: true },
  });

  if (!user) {
    return;
  }

  if (provider === Provider.Facebook) {
    try {
      const data = await facebookApi.createPost(params, req.userId!);

      const newPost = await prisma.post.create({
        data: {
          id: randomUUID(),
          userId: req.userId!,
          channelId: data.id,
          channel: Channel.FACEBOOK,
          text: params.message,
          scheduleTime: params.time ? new Date(params.time) : new Date(),
          medias: params.images,
        },
      });

      res.json({ success: true, newPost });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
});

router.get("/posts", authenticate, async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { userId: (req as any).userId },
  });

  const postsWithMedia = [];
  for (const post of posts) {
    if (post.medias) {
      const mediaGcsPaths = post.medias;
      const mediaPromises = [];
      for (const gcsPath of mediaGcsPaths) {
        const promise = storage
          .bucket(process.env.MEDIA_BUCKET_NAME)
          .file(gcsPath, {})
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000,
          })
          .then(([url]) => url)

          .catch((err) => {
            console.error(`Error getting download URL for ${gcsPath}:`, err);
            return null;
          });
        mediaPromises.push(promise);
      }

      const urls = await Promise.all(mediaPromises);
      post.medias = urls.filter((url) => url);
      postsWithMedia.push(post);
    }
  }

  res.json(postsWithMedia);
});

export default router;
