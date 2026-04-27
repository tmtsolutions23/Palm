import { describe, it, expect } from "vitest";
import { READING_SYSTEM_PROMPT } from "@/lib/prompts/reading";

describe("READING_SYSTEM_PROMPT", () => {
  it("instructs JSON output format", () => {
    expect(READING_SYSTEM_PROMPT).toContain("JSON");
  });

  it("includes all four palm lines", () => {
    expect(READING_SYSTEM_PROMPT).toContain("life");
    expect(READING_SYSTEM_PROMPT).toContain("heart");
    expect(READING_SYSTEM_PROMPT).toContain("head");
    expect(READING_SYSTEM_PROMPT).toContain("fate");
  });

  it("includes error handling for non-palm photos", () => {
    expect(READING_SYSTEM_PROMPT).toContain("no_palm_visible");
  });

  it("disallows medical/financial advice", () => {
    expect(READING_SYSTEM_PROMPT).toContain("never medical");
    expect(READING_SYSTEM_PROMPT).toContain("never financial");
  });
});