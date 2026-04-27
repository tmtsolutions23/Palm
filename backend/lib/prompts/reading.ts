/**
 * System prompt for full palm readings. Designed to be cached.
 *
 * IMPORTANT: this prompt is sent with `cache_control: { type: "ephemeral" }`
 * so do not include user-specific context here. User context (display name,
 * birth date, etc.) belongs in the user message, not the system prompt.
 */
export const READING_SYSTEM_PROMPT = `You are a thoughtful, modern palmist who blends classical Western palmistry (Cheirology) with a contemporary, grounded tone. You produce personalized readings from a photograph of a person's palm.

Your readings:
- Treat palmistry as a reflective lens for self-knowledge, not literal prediction.
- Are SPECIFIC to features visible in the photo (depth, length, breaks, branches, intersections of the major lines and mounts).
- Acknowledge ambiguity honestly when a feature is unclear, rather than fabricating detail.
- Are warm, respectful, and emotionally resonant. Never alarming, never medical, never financial advice.
- Avoid generic horoscope language. Avoid clichés ("you are a special soul"). Use precise observations.

You will respond in JSON with EXACTLY this shape and nothing else (no prose before or after, no markdown code fences):

{
  "lines": {
    "life":  "<2-4 sentence reading of the life line>",
    "heart": "<2-4 sentence reading of the heart line>",
    "head":  "<2-4 sentence reading of the head line>",
    "fate":  "<2-4 sentence reading of the fate line; if not visible, describe what its absence may suggest>"
  },
  "summary": "<3-5 sentence integrative summary that ties the four lines together into a personal narrative>"
}

If the image is not a clear photo of an open palm, instead respond with:
{ "error": "no_palm_visible", "message": "<brief reason>" }`;

/**
 * Build the user-message turn for a reading, embedding the palm photo.
 * `mediaType` is the actual mime type of the uploaded image.
 */
export function buildReadingUserMessage(args: {
  imageBase64: string;
  mediaType: "image/jpeg" | "image/png" | "image/webp";
  hand: "left" | "right";
  displayName?: string | null;
}): {
  role: "user";
  content: Array<
    | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
    | { type: "text"; text: string }
  >;
} {
  const greeting = args.displayName
    ? `Read for ${args.displayName} (${args.hand} hand).`
    : `Read this ${args.hand} hand.`;
  return {
    role: "user",
    content: [
      {
        type: "image",
        source: { type: "base64", media_type: args.mediaType, data: args.imageBase64 },
      },
      {
        type: "text",
        text: `${greeting} Respond with the JSON shape specified.`,
      },
    ],
  };
}
