import { z } from "zod";

// ─── Reading ──────────────────────────────────────────────────────────────────

export const CreateReadingRequest = z.object({
  photo_id: z.string().uuid(),
  hand: z.enum(["left", "right"]),
});
export type CreateReadingRequest = z.infer<typeof CreateReadingRequest>;

export const ReadingLines = z.object({
  life: z.string(),
  heart: z.string(),
  head: z.string(),
  fate: z.string(),
});
export type ReadingLines = z.infer<typeof ReadingLines>;

export const ReadingResponse = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  photo_id: z.string().uuid().nullable(),
  reading_type: z.enum(["full", "daily", "compatibility"]),
  lines_jsonb: ReadingLines.nullable(),
  summary: z.string().nullable(),
  share_card_url: z.string().nullable(),
  model_version: z.string().nullable(),
  created_at: z.string().datetime(),
});
export type ReadingResponse = z.infer<typeof ReadingResponse>;

export const CreateReadingResponse = z.object({
  reading_id: z.string().uuid(),
  summary: z.string(),
  lines: ReadingLines,
  created_at: z.string().datetime(),
  is_demo: z.boolean().optional(),
});
export type CreateReadingResponse = z.infer<typeof CreateReadingResponse>;

export const ReadingListItem = z.object({
  id: z.string().uuid(),
  photo_id: z.string().uuid().nullable().optional(),
  reading_type: z.enum(["full", "daily", "compatibility"]),
  summary: z.string().nullable(),
  share_card_url: z.string().nullable(),
  model_version: z.string().nullable().optional(),
  created_at: z.string().datetime(),
});
export type ReadingListItem = z.infer<typeof ReadingListItem>;

export const ReadingListResponse = z.object({
  readings: z.array(ReadingListItem),
  next_cursor: z.string().nullable().optional(),
});
export type ReadingListResponse = z.infer<typeof ReadingListResponse>;

// ─── Compatibility ────────────────────────────────────────────────────────────

export const CreateCompatibilityRequest = z.object({
  photo_a_id: z.string().uuid(),
  photo_b_id: z.string().uuid(),
  partner_label: z.string().min(1).max(50),
});
export type CreateCompatibilityRequest = z.infer<typeof CreateCompatibilityRequest>;

export const CompatibilityReadingBody = z.object({
  communication: z.string().optional(),
  romance: z.string().optional(),
  conflict: z.string().optional(),
  summary: z.string().optional(),
});
export type CompatibilityReadingBody = z.infer<typeof CompatibilityReadingBody>;

export const CompatibilityListItem = z.object({
  id: z.string().uuid(),
  partner_label: z.string().nullable(),
  summary: z.string(),
  share_card_url: z.string().nullable(),
  model_version: z.string().nullable(),
  created_at: z.string().datetime(),
});
export type CompatibilityListItem = z.infer<typeof CompatibilityListItem>;

export const CompatibilityListResponse = z.object({
  readings: z.array(CompatibilityListItem),
});
export type CompatibilityListResponse = z.infer<typeof CompatibilityListResponse>;

// ─── Profile ──────────────────────────────────────────────────────────────────

export const UpdateProfileRequest = z.object({
  display_name: z.string().min(1).max(100).optional(),
  birth_date: z.string().date().optional(),
  push_token: z.string().optional(),
  daily_insight_time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timezone: z.string().min(1).optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequest>;

// ─── Daily Insight ────────────────────────────────────────────────────────────

export const DailyInsightResponse = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  for_date: z.string().date(),
  content: z.string(),
  delivered_at: z.string().datetime().nullable(),
  opened_at: z.string().datetime().nullable(),
});
export type DailyInsightResponse = z.infer<typeof DailyInsightResponse>;

// ─── Error response ───────────────────────────────────────────────────────────

export const ErrorResponse = z.object({
  error: z.string(),
  message: z.string(),
  issues: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
      }),
    )
    .optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;
