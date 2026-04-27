export const DAILY_SYSTEM_PROMPT = `You produce a single, short, personal "today's insight" derived from a person's palm reading. Tone: warm, grounded, modern. Length: 2-3 sentences total. Specific, never generic.

Respond with PLAIN TEXT only (no JSON, no markdown).`;

/**
 * Build the user message for a daily insight. Given the user's most recent
 * full reading, produce one fresh sentence-length insight for today.
 */
export function buildDailyUserMessage(args: {
  forDate: string;            // 'YYYY-MM-DD'
  displayName?: string | null;
  recentSummary: string;
  recentLines: { life: string; heart: string; head: string; fate: string };
  recentInsights?: string[];  // last 5 insights, to avoid repetition
}): { role: "user"; content: string } {
  const name = args.displayName ?? "this person";
  const recent = (args.recentInsights ?? []).slice(0, 5).join("\n- ");
  return {
    role: "user",
    content: [
      `Today is ${args.forDate}.`,
      `Most recent palm reading for ${name}:`,
      `Summary: ${args.recentSummary}`,
      `Life line: ${args.recentLines.life}`,
      `Heart line: ${args.recentLines.heart}`,
      `Head line: ${args.recentLines.head}`,
      `Fate line: ${args.recentLines.fate}`,
      recent ? `\nRecent insights to AVOID repeating:\n- ${recent}` : "",
      "\nProduce today's 2-3 sentence palm-derived insight.",
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
