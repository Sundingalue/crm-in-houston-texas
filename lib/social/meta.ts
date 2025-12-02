export type SocialDmPayload = {
  recipientId: string;
  message: string;
  platform: "instagram" | "facebook";
};

export type SocialConfig = {
  accessToken: string;
  pageId?: string;
  appId?: string;
  appSecret?: string;
};

export const readMetaConfig = (): SocialConfig | null => {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) return null;
  return {
    accessToken,
    pageId: process.env.META_PAGE_ID,
    appId: process.env.META_APP_ID,
    appSecret: process.env.META_APP_SECRET,
  };
};

export async function sendSocialDm(config: SocialConfig, payload: SocialDmPayload) {
  // Minimal Graph API call for page messages; for IG, recipientId should be IG user ID
  const pageId = config.pageId;
  if (!pageId) {
    return {
      id: `mock-${Date.now()}`,
      to: payload.recipientId,
      status: "queued",
    };
  }

  const url = `https://graph.facebook.com/v20.0/${pageId}/messages`;
  const body = {
    messaging_type: "MESSAGE_TAG",
    tag: "ACCOUNT_UPDATE",
    recipient: { id: payload.recipientId },
    message: { text: payload.message },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}
