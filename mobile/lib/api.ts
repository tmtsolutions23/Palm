import { supabase } from "./supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.palmreader.app";

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

async function authedFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers = new Headers(init.headers ?? {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    throw new ApiError(
      res.status,
      body.error ?? "unknown",
      body.message ?? `Request failed (${res.status})`,
    );
  }
  return res;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  display_name: string | null;
  birth_date: string | null;
  push_token: string | null;
  daily_insight_time: string;
  timezone: string;
  subscription_status: string;
  subscription_expires_at: string | null;
  free_readings_used: number;
}

export async function fetchProfile(): Promise<Profile> {
  const res = await authedFetch("/api/profile");
  return res.json();
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const res = await authedFetch("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return res.json();
}

// ─── Photos / Readings ───────────────────────────────────────────────────────

export interface UploadedPhoto {
  id: string;
  storage_path: string;
}

export async function uploadPalmPhoto(args: {
  uri: string;
  hand: "left" | "right";
}): Promise<UploadedPhoto> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;
  if (!userId) throw new ApiError(401, "no_session", "Not signed in");

  const photoId = generateUuid();
  const ext = uriExtension(args.uri);
  const path = `${userId}/${photoId}.${ext}`;

  const arrayBuffer = await uriToArrayBuffer(args.uri);
  const { error: uploadErr } = await supabase.storage
    .from("palms")
    .upload(path, arrayBuffer, {
      contentType: contentTypeForExt(ext),
      upsert: false,
    });
  if (uploadErr) throw new ApiError(500, "storage_error", uploadErr.message);

  const { data: row, error: insertErr } = await supabase
    .from("palm_photos")
    .insert({
      id: photoId,
      user_id: userId,
      storage_path: path,
      hand: args.hand,
    })
    .select()
    .single();
  if (insertErr || !row) throw new ApiError(500, "db_error", insertErr?.message ?? "insert");

  return { id: row.id, storage_path: row.storage_path };
}

export interface Reading {
  reading_id: string;
  summary: string;
  lines: { life: string; heart: string; head: string; fate: string };
  created_at: string;
}

export async function createReading(args: {
  photo_id: string;
  hand: "left" | "right";
}): Promise<Reading> {
  const res = await authedFetch("/api/readings", {
    method: "POST",
    body: JSON.stringify(args),
  });
  return res.json();
}

export interface ReadingListItem {
  id: string;
  reading_type: "full" | "daily";
  summary: string;
  share_card_url: string | null;
  created_at: string;
}

export async function listReadings(opts: { before?: string; limit?: number } = {}): Promise<{
  readings: ReadingListItem[];
}> {
  const params = new URLSearchParams();
  if (opts.before) params.set("before", opts.before);
  if (opts.limit) params.set("limit", String(opts.limit));
  const qs = params.toString();
  const res = await authedFetch(`/api/readings${qs ? `?${qs}` : ""}`);
  return res.json();
}

export async function getReading(id: string): Promise<{
  id: string;
  summary: string;
  lines_jsonb: Reading["lines"];
  created_at: string;
}> {
  const res = await authedFetch(`/api/readings/${id}`);
  return res.json();
}

export async function deleteReading(id: string): Promise<void> {
  await authedFetch(`/api/readings/${id}`, { method: "DELETE" });
}

// ─── Compatibility ───────────────────────────────────────────────────────────

export async function createCompatibility(args: {
  photo_a_id: string;
  photo_b_id: string;
  partner_label: string;
}): Promise<{
  id: string;
  communication: string;
  romance: string;
  conflict: string;
  summary: string;
}> {
  const res = await authedFetch("/api/compatibility", {
    method: "POST",
    body: JSON.stringify(args),
  });
  return res.json();
}

// ─── Daily insight ───────────────────────────────────────────────────────────

export interface DailyInsight {
  id: string;
  for_date: string;
  content: string;
  opened_at: string | null;
}

export async function getTodayInsight(): Promise<DailyInsight> {
  const res = await authedFetch("/api/insights/today");
  return res.json();
}

export async function markInsightOpened(id: string): Promise<void> {
  await authedFetch("/api/insights/mark-opened", {
    method: "POST",
    body: JSON.stringify({ id }),
  });
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function uriExtension(uri: string): string {
  const m = /\.([a-zA-Z0-9]+)(?:\?|$)/.exec(uri);
  const e = m?.[1]?.toLowerCase();
  if (e === "png" || e === "webp") return e;
  return "jpg";
}

async function uriToArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const res = await fetch(uri);
  return res.arrayBuffer();
}

function contentTypeForExt(ext: string): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

function generateUuid(): string {
  // RFC4122 v4 — sufficient for client-side IDs (Supabase will accept it).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
