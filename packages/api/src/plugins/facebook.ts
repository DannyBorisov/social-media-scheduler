import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";

export const FacebookScope =
  "pages_show_list,pages_read_engagement,pages_manage_posts,pages_read_user_content,pages_manage_metadata,pages_manage_engagement";

export const InstagramScope =
  "instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages,instagram_business_manage_comments";

export class FacebookAPI {
  #baseURL = "https://graph.facebook.com/v23.0";

  async getAuthUrl(scope: string): Promise<string> {
    let clientId = process.env.FACEBOOK_APP_ID;
    if (scope.includes("instagram_business_basic")) {
    }

    const queryParams = new URLSearchParams({
      client_id: clientId as string,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI as string,
      scope,
      response_type: "code",
    });
    return `https://www.facebook.com/v23.0/dialog/oauth?${queryParams.toString()}`;
  }

  async handleCallback(
    code: string,
    userId: string
  ): Promise<{ success: boolean }> {
    const queryParams = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID as string,
      client_secret: process.env.FACEBOOK_APP_SECRET as string,
      redirect_uri: process.env.FACEBOOK_REDIRECT_URI as string,
      code,
    }).toString();

    const response = await fetch(
      `${this.#baseURL}oauth/access_token?${queryParams}`
    );
    const data = await response.json();
    const url = `${this.#baseURL}me/accounts?access_token=${data.access_token}`;
    const pagesResponse = await fetch(url);
    const pagesData = await pagesResponse.json();

    for (const page of pagesData.data) {
      const picture = await fetch(
        `${this.#baseURL}${page.id}/picture?redirect=false`
      );
      const pictureData = await picture.json();
      page.picture = pictureData.data.url;
    }

    if (data.access_token) {
      await prisma.facebookIntegration.upsert({
        where: { userId },
        update: {
          accessToken: data.access_token,
          pages: pagesData.data.map((page: any) =>
            JSON.stringify({
              id: page.id,
              name: page.name,
              access_token: page.access_token,
              picture: page.picture,
            })
          ),
        },
        create: {
          id: randomUUID(),
          userId,
          accessToken: data.access_token,
          pages: pagesData.data.map((page: any) =>
            JSON.stringify({
              id: page.id,
              name: page.name,
              access_token: page.access_token,
              picture: page.picture,
            })
          ),
        },
      });
      return { success: true };
    }

    return { success: false };
  }

  async getPages(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { facebook: true },
    });

    if (!user || !user.facebook) {
      throw new Error("User not found or Facebook not connected");
    }

    const response = await fetch(
      `${this.#baseURL}me/accounts?access_token=${user.facebook}`
    );
    const data = await response.json();

    for (const page of data.data) {
      const picture = await fetch(
        `${this.#baseURL}${page.id}/picture?redirect=false`
      );
      const pictureData = await picture.json();
      page.picture = pictureData.data.url;
    }

    await prisma.facebookIntegration.update({
      where: { userId },
      data: { pages: data.data },
    });

    return data;
  }

  async createPost(params: any, userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { facebook: true },
    });

    if (!user || !user.facebook) {
      throw new Error("Facebook not connected for this user");
    }

    const postPayload = {
      message: params.message,
      access_token: params.page.access_token,
      published: !params.time,
      scheduled_publish_time: "",
    };

    if (params.time) {
      const scheduledDate = new Date(params.time);
      const toTime = scheduledDate.getTime();
      postPayload.scheduled_publish_time = Math.floor(toTime / 1000);
    }

    if (params.images) {
      const ids = [];

      for (const imageUrl of params.images) {
        const url = `${this.#baseURL}${params.page.id}/photos`;
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

    const url = `${this.#baseURL}${params.page.id}/feed`;
    const query = new URLSearchParams(postPayload).toString();
    const response = await fetch(`${url}?${query}`, { method: "POST" });
    const data = await response.json();

    return data;
  }
}

const facebookApi = new FacebookAPI();
export { facebookApi };
