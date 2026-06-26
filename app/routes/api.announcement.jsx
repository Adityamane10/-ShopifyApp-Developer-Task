import { authenticate } from "../shopify.server";
import { saveAnnouncementAndSyncMetafield } from "../services/announcement.server";

function json(data, init = {}) {
  const body = JSON.stringify(data);
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  return new Response(body, { ...init, headers });
}

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ success: false, message: "Method not allowed." }, { status: 405 });
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: "Invalid JSON body." }, { status: 400 });
  }

  const announcement = body?.announcement?.trim();

  if (!announcement) {
    return json({ success: false, message: "Announcement text cannot be empty." }, { status: 400 });
  }

  try {
    const { admin, session } = await authenticate.admin(request);
    await saveAnnouncementAndSyncMetafield({ announcement, admin });
    return json({ success: true, message: "Announcement saved successfully." });
  } catch (error) {
    console.error("Failed to save announcement:", error);
    const message = error instanceof Error ? error.message : "Failed to save announcement.";
    return json({ success: false, message }, { status: 500 });
  }
};
