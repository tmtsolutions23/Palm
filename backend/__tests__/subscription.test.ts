import { describe, it, expect } from "vitest";
import { isPaid, FREE_READING_LIMIT } from "@/lib/subscription";

describe("isPaid", () => {
  it("returns true for lifetime", () => {
    expect(isPaid({ subscription_status: "lifetime", subscription_expires_at: null })).toBe(true);
  });

  it("returns true for active", () => {
    expect(isPaid({ subscription_status: "active", subscription_expires_at: null })).toBe(true);
  });

  it("returns true for trialing", () => {
    expect(isPaid({ subscription_status: "trialing", subscription_expires_at: null })).toBe(true);
  });

  it("returns true for cancelled with future expiry", () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(isPaid({ subscription_status: "cancelled", subscription_expires_at: future })).toBe(true);
  });

  it("returns false for cancelled with past expiry", () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(isPaid({ subscription_status: "cancelled", subscription_expires_at: past })).toBe(false);
  });

  it("returns false for free", () => {
    expect(isPaid({ subscription_status: "free", subscription_expires_at: null })).toBe(false);
  });

  it("returns false for billing_issue", () => {
    expect(isPaid({ subscription_status: "billing_issue", subscription_expires_at: null })).toBe(false);
  });
});

describe("FREE_READING_LIMIT", () => {
  it("has exactly 1 free reading", () => {
    expect(FREE_READING_LIMIT).toBe(1);
  });
});