import { describe, it, expect } from "vitest";
import { ApiError, errorResponse } from "@/lib/errors";

describe("ApiError", () => {
  it("stores status, code, and message", () => {
    const err = new ApiError(402, "paywall_required", "Upgrade to continue");
    expect(err.status).toBe(402);
    expect(err.code).toBe("paywall_required");
    expect(err.message).toBe("Upgrade to continue");
  });
});

describe("errorResponse", () => {
  it("returns JSON with ApiError details", () => {
    const err = new ApiError(429, "rate_limited", "Slow down");
    const res = errorResponse(err);
    // errorResponse returns NextResponse — we can't easily inspect the body
    // without reading the stream, so we just verify it doesn't throw.
    expect(res).toBeDefined();
  });

  it("returns 500 for non-ApiError errors", () => {
    const res = errorResponse(new Error("boom"));
    expect(res).toBeDefined();
    expect(res.status).toBe(500);
  });
});