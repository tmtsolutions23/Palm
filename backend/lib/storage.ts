import { getSupabaseAdmin } from "./supabase-admin";
import { ApiError } from "./errors";

/**
 * Download a palm photo from the private 'palms' bucket and return base64
 * for sending to Claude vision.
 */
export async function fetchPalmAsBase64(
  storagePath: string,
): Promise<{ base64: string; mediaType: "image/jpeg" | "image/png" | "image/webp" }> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage.from("palms").download(storagePath);
  if (error || !data) {
    throw new ApiError(500, "storage_error", error?.message ?? "Photo not found");
  }
  const buf = Buffer.from(await data.arrayBuffer());
  const mediaType = inferMediaType(storagePath, data.type);
  return { base64: buf.toString("base64"), mediaType };
}

function inferMediaType(
  path: string,
  fallbackContentType: string,
): "image/jpeg" | "image/png" | "image/webp" {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (fallbackContentType === "image/png") return "image/png";
  if (fallbackContentType === "image/webp") return "image/webp";
  return "image/jpeg";
}

/** Generate a short-lived signed URL for the mobile client to fetch a palm photo. */
export async function signedPalmUrl(storagePath: string, ttlSec = 3600): Promise<string> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage
    .from("palms")
    .createSignedUrl(storagePath, ttlSec);
  if (error || !data?.signedUrl) {
    throw new ApiError(500, "storage_error", error?.message ?? "Could not sign URL");
  }
  return data.signedUrl;
}
