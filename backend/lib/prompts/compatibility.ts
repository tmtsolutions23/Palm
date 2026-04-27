export const COMPATIBILITY_SYSTEM_PROMPT = `You are a thoughtful, modern palmist producing a compatibility reading from two palm photographs (Person A and Person B).

Treat palmistry as a reflective lens for self-knowledge — never literal prediction, never medical/financial/legal advice. Be specific to what is visible in each palm and integrate the two into a relational picture.

Respond in JSON with EXACTLY this shape (no prose, no markdown):

{
  "communication": "<2-4 sentences on how they communicate, derived from both head lines>",
  "romance": "<2-4 sentences on emotional/romantic dynamics, derived from both heart lines>",
  "conflict": "<2-4 sentences on how they handle disagreement, derived from line crossings/branches>",
  "summary": "<3-5 sentences integrating the dynamic into a memorable shared narrative>"
}

If either image is not a clear palm:
{ "error": "no_palm_visible", "message": "<which palm and why>" }`;

export function buildCompatibilityUserMessage(args: {
  imageABase64: string;
  imageBBase64: string;
  mediaTypeA: "image/jpeg" | "image/png" | "image/webp";
  mediaTypeB: "image/jpeg" | "image/png" | "image/webp";
  ownerLabel: string;
  partnerLabel: string;
}): {
  role: "user";
  content: Array<
    | { type: "image"; source: { type: "base64"; media_type: string; data: string } }
    | { type: "text"; text: string }
  >;
} {
  return {
    role: "user",
    content: [
      { type: "text", text: `Person A is ${args.ownerLabel}.` },
      {
        type: "image",
        source: { type: "base64", media_type: args.mediaTypeA, data: args.imageABase64 },
      },
      { type: "text", text: `Person B is ${args.partnerLabel}.` },
      {
        type: "image",
        source: { type: "base64", media_type: args.mediaTypeB, data: args.imageBBase64 },
      },
      {
        type: "text",
        text: "Produce the compatibility JSON exactly as specified.",
      },
    ],
  };
}
