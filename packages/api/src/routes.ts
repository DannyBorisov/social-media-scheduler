import express from "express";
import { auth } from "./firebase";
import { prisma } from "./lib/prisma";

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
  req.userId = decoded.uid;
  next();
};

enum Provider {
  Facebook = "facebook",
}

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});

router.get("/user/:id", async (req, res) => {
  const { id } = req.params as { id: string };
  const user = await prisma.user.findUnique({ where: { id } });
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
        {
          method: "GET",
        }
      );
      const data = await response.json();
      if (data.access_token) {
        await prisma.user.update({
          where: { id: req.userId },
          data: { facebook: data.access_token },
        });
        res.json({ success: true });
      }
    }
  }
);

router.get("/facebook/pages", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user || !user.facebook) {
    return res
      .status(400)
      .json({ error: "User not found or Facebook not connected" });
  }
  const response = await fetch(
    `https://graph.facebook.com/v23.0/me/accounts?access_token=${user.facebook}`
  );
  const data = await response.json();
  res.json(data);
});

router.post("/channel/:provider/post", authenticate, async (req, res) => {
  const { provider } = req.params as { provider: Provider };
  const { params } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user) {
    return;
  }

  if (provider === Provider.Facebook) {
    if (!user.facebook) {
      return res
        .status(400)
        .json({ error: "Facebook not connected for this user" });
    }

    if (params.images) {
    }
    let url = `https://graph.facebook.com/v23.0/${params.page.id}/feed`;
    let queryParams = new URLSearchParams({
      access_token: params.page.access_token,
      message: params.message,
      published: "true",
    }).toString();

    if (params.images) {
      if (params.images.length === 1) {
        url = `https://graph.facebook.com/v23.0/${params.page.id}/photos`;
        queryParams = new URLSearchParams({
          access_token: params.page.access_token,
          url: params.images[0],
          caption: params.message,
          published: "true",
        }).toString();
      } else {
        const ids = [];
        for (const imageUrl of params.images) {
          const photoUrl = `https://graph.facebook.com/v23.0/${params.page.id}/photos`;
          const photoQueryParams = new URLSearchParams({
            access_token: params.page.access_token,
            url: imageUrl,
            published: "false",
            temporary: "true",
          }).toString();
          const response = await fetch(`${photoUrl}?${photoQueryParams}`, {
            method: "POST",
          });
          const data = await response.json();
          ids.push(data.id);
        }
        url = `https://graph.facebook.com/v23.0/${params.page.id}/feed`;
        queryParams = new URLSearchParams({
          access_token: params.page.access_token,
          message: params.message,
          attached_media: JSON.stringify(
            ids.map((id: string) => ({ media_fbid: id }))
          ),
          published: "true",
        }).toString();
      }
    }

    const response = await fetch(`${url}?${queryParams}`, { method: "POST" });
    const data = await response.json();
    console.log(data);
  }
  res.json({ success: true });
});

router.post("/verify-token", async (req, res) => {
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
