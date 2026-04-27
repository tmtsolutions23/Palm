import { describe, it, expect } from "vitest";
import { computeCostUsd } from "@/lib/claude";

describe("computeCostUsd", () => {
  it("calculates Sonnet cost correctly", () => {
    // Sonnet 4.6: $3/M input, $15/M output
    const cost = computeCostUsd("claude-sonnet-4-6", 1000, 500);
    // (1000 * 3 + 500 * 15) / 1_000_000 = 0.0105
    expect(cost).toBeCloseTo(0.0105, 6);
  });

  it("calculates Haiku cost correctly", () => {
    // Haiku 4.5: $1/M input, $5/M output
    const cost = computeCostUsd("claude-haiku-4-5-20251001", 1000, 500);
    // (1000 * 1 + 500 * 5) / 1_000_000 = 0.0035
    expect(cost).toBeCloseTo(0.0035, 6);
  });

  it("returns 0 for unknown model", () => {
    expect(computeCostUsd("unknown-model", 1000, 500)).toBe(0);
  });
});