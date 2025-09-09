import express from "express";
import { auth, storage } from "./firebase";
import { prisma } from "./lib/prisma";
import { Channel } from "@prisma/client";
import crypto, { randomUUID } from "crypto";

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
}

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

router.get("/user/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  const user = await prisma.user.findUnique({
    where: { id },
    include: { facebook: true },
  });
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
    const queryParams = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID as string,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI as string,
      scope:
        "pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,pages_manage_metadata,pages_manage_engagement",
      response_type: "code",
    });
    const authURL = `https://www.facebook.com/v23.0/dialog/oauth?${queryParams.toString()}`;
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
      const queryParams = new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID as string,
        client_secret: process.env.FACEBOOK_APP_SECRET as string,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI as string,
        code,
      }).toString();
      const response = await fetch(
        `https://graph.facebook.com/v23.0/oauth/access_token?${queryParams}`,
        { method: "GET" }
      );
      const data = await response.json();
      if (data.access_token) {
        await prisma.facebookIntegration.create({
          data: {
            id: randomUUID(),
            userId: req.userId as string,
            accessToken: data.access_token,
            pages: [],
          },
        });
        res.json({ success: true });
      }
    }
  }
);

router.get("/facebook/pages", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { facebook: true },
  });

  if (!user || !user.facebook) {
    return res
      .status(400)
      .json({ error: "User not found or Facebook not connected" });
  }
  const response = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?access_token=${user.facebook}`
  );
  const data = await response.json();

  for (const page of data.data) {
    const picture = await fetch(
      `https://graph.facebook.com/v23.0/${page.id}/picture?redirect=false`
    );
    const pictureData = await picture.json();
    page.picture = pictureData.data.url;
  }

  await prisma.facebookIntegration.update({
    where: { userId: req.userId },
    data: { pages: data.data },
  });

  res.json(data);
});

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
    if (!user.facebook) {
      return res
        .status(400)
        .json({ error: "Facebook not connected for this user" });
    }

    const postPayload = {
      message: params.message,
      access_token: params.page.access_token,
      published: !params.time,
    };

    if (params.time) {
      const scheduledDate = new Date(params.time);
      const toTime = scheduledDate.getTime();
      postPayload.scheduled_publish_time = Math.floor(toTime / 1000);
    }

    if (params.images) {
      const ids = [];

      for (const imageUrl of params.images) {
        const url = `https://graph.facebook.com/v23.0/${params.page.id}/photos`;
        const payload = {
          access_token: params.page.access_token,
          url: imageUrl,
          published: "false",
          temporary: "true",
        };
        const response = await fetch(
          `${url}?${new URLSearchParams(payload).toString()}`,
          { method: "POST" }
        );
        const data = await response.json();
        ids.push(data.id);
        postPayload.attached_media = JSON.stringify(
          ids.map((id: string) => ({ media_fbid: id }))
        );
      }
    }

    const url = `https://graph.facebook.com/v23.0/${params.page.id}/feed`;
    const query = new URLSearchParams(postPayload).toString();
    const response = await fetch(`${url}?${query}`, { method: "POST" });
    const data = await response.json();

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
  }
});

router.get("/posts", authenticate, async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { userId: (req as any).userId },
  });

  const postsWithMedia = [];
  for (const post of posts) {
    if (post.medias) {
      const mediaGcsPaths = post.medias.split(",");
      const mediaPromises = [];
      for (const gcsPath of mediaGcsPaths) {
        console.log({ gcsPath });
        const promise = storage
          .bucket(process.env.MEDIA_BUCKET_NAME)
          .file(gcsPath, {})
          .getSignedUrl({
            action: "read",
            expires: Date.now() + 60 * 60 * 1000, // 1 hour
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
