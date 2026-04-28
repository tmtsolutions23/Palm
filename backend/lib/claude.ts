import Anthropic from "@anthropic-ai/sdk";
import { getBackendEnv } from "@/lib/env/backend";

let client: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (client) return client;
  const env = getBackendEnv();
  client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

export function getVisionModel(): string {
  return getBackendEnv().ANTHROPIC_MODEL_VISION;
}

export function getDailyModel(): string {
  return getBackendEnv().ANTHROPIC_MODEL_DAILY;
}

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
