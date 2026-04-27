/**
 * Expo Push delivery. Expo's push service accepts up to 100 messages per
 * request and rate-limits per second. Chunking is required at any meaningful
 * scale.
 *
 * https://docs.expo.dev/push-notifications/sending-notifications/
 */

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 100;

export interface PushMessage {
  to: string;            // Expo push token
  title: string;
  body: string;
  data?: Record<string, unknown>;
  badge?: number;
  sound?: "default" | null;
}

export interface PushResult {
  sent: number;
  failed: number;
  invalidTokens: string[];
}

export async function sendPushBatch(messages: PushMessage[]): Promise<PushResult> {
  const result: PushResult = { sent: 0, failed: 0, invalidTokens: [] };
  if (messages.length === 0) return result;

  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
        },
        body: JSON.stringify(chunk),
      });
      const body = (await res.json()) as {
        data?: Array<{ status: "ok" | "error"; message?: string; details?: { error?: string } }>;
      };
      const tickets = body.data ?? [];
      tickets.forEach((t, idx) => {
        if (t.status === "ok") {
          result.sent += 1;
        } else {
          result.failed += 1;
          if (t.details?.error === "DeviceNotRegistered") {
            result.invalidTokens.push(chunk[idx]!.to);
          }
        }
      });
    } catch (e) {
      result.failed += chunk.length;
      console.error("[push] chunk failed", e);
    }
  }

  return result;
}
