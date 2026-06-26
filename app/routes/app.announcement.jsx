import { useState, useCallback, useEffect } from "react";
import { Form, useNavigation, useSearchParams, redirect } from "react-router";
import { authenticate } from "../shopify.server";
import { saveAnnouncementAndSyncMetafield } from "../services/announcement.server";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const announcement = formData.get("announcement")?.trim();

    if (!announcement) {
      return redirect("/app/announcement?error=empty");
    }

    await saveAnnouncementAndSyncMetafield({ announcement, admin });
    return redirect("/app/announcement?success=1");
  } catch (error) {
    console.error("action error:", error);
    return redirect("/app/announcement?error=failed");
  }
};

export default function AnnouncementPage() {
  const [announcement, setAnnouncement] = useState("");
  const [validationError, setValidationError] = useState("");
  const [message, setMessage] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const isLoading = navigation.state === "submitting";

  useEffect(() => {
    if (navigation.state !== "idle") return;
    if (searchParams.get("success") === "1") {
      setAnnouncement("");
      setMessage({ tone: "success", text: "Announcement saved successfully." });
      setSearchParams({}, { replace: true });
    } else if (searchParams.get("error") === "empty") {
      setMessage({ tone: "critical", text: "Announcement text cannot be empty." });
      setSearchParams({}, { replace: true });
    } else if (searchParams.get("error") === "failed") {
      setMessage({ tone: "critical", text: "Failed to save announcement." });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, navigation.state, setSearchParams]);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleTextChange = useCallback((value) => {
    setAnnouncement(value);
    if (validationError) setValidationError("");
  }, [validationError]);

  const handleSave = useCallback(() => {
    const trimmed = announcement.trim();
    if (!trimmed) {
      setValidationError("Announcement text cannot be empty.");
      return false;
    }
    setValidationError("");
  }, [announcement, validationError]);

  return (
    <s-page heading="Announcement Manager">
      {validationError && (
        <s-banner tone="critical">
          <s-paragraph>{validationError}</s-paragraph>
        </s-banner>
      )}

      {message && !validationError && (
        <s-banner tone={message.tone}>
          <s-paragraph>{message.text}</s-paragraph>
        </s-banner>
      )}

      <div
        style={{
          background: "var(--p-color-bg, #fff)",
          borderRadius: "var(--p-border-radius-200, 8px)",
          padding: "var(--p-space-400, 16px)",
          boxShadow: "var(--p-shadow-100, 0 1px 3px rgba(0,0,0,0.12))",
        }}
      >
        <h2
          style={{
            fontSize: "var(--p-font-size-350, 14px)",
            fontWeight: "var(--p-font-weight-semibold, 600)",
            margin: "0 0 var(--p-space-400, 16px)",
            color: "var(--p-color-text, #202223)",
          }}
        >
          Store Announcement
        </h2>

        <Form method="post" onSubmit={handleSave}>
          <div style={{ marginBottom: "var(--p-space-400, 16px)" }}>
            <label
              style={{
                display: "block",
                fontSize: "var(--p-font-size-300, 13px)",
                fontWeight: "var(--p-font-weight-medium, 500)",
                marginBottom: "var(--p-space-200, 6px)",
                color: "var(--p-color-text, #202223)",
              }}
            >
              Announcement Text
            </label>
            <textarea
              name="announcement"
              value={announcement}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter announcement..."
              rows={4}
              style={{
                width: "100%",
                padding: "var(--p-space-200, 6px) var(--p-space-300, 10px)",
                fontSize: "var(--p-font-size-325, 14px)",
                lineHeight: "1.5",
                border: "1px solid var(--p-color-border-input, #8c9196)",
                borderRadius: "var(--p-border-radius-100, 6px)",
                background: "var(--p-color-bg-input, #fff)",
                color: "var(--p-color-text, #202223)",
                resize: "vertical",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <s-button
            variant="primary"
            type="submit"
            {...(isLoading ? { loading: true, disabled: true } : {})}
          >
            Save Announcement
          </s-button>
        </Form>
      </div>
    </s-page>
  );
}
