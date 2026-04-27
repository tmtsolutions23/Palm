import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");
  client = new Anthropic({ apiKey });
  return client;
}

export const VISION_MODEL =
  process.env.ANTHROPIC_MODEL_VISION ?? "claude-sonnet-4-6";
export const DAILY_MODEL =
  process.env.ANTHROPIC_MODEL_DAILY ?? "claude-haiku-4-5-20251001";

/**
 * Approximate Claude pricing (USD per million tokens). Update when Anthropic
 * publishes new prices. Used to log per-reading cost into the database.
 */
const PRICE: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6": { input: 3.0, output: 15.0 },
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0 },
};

export function computeCostUsd(model: string, input: number, output: number): number {
  const p = PRICE[model] ?? { input: 0, output: 0 };
  return (input * p.input + output * p.output) / 1_000_000;
}

/** Decode a Claude tool_use / structured response from a message. */
export function extractText(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((b) => b.text)
    .join("\n");
}
