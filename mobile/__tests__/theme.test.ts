import { colors, spacing, radius, type } from "@/constants/theme";

describe("theme constants", () => {
  it("exports all color tokens", () => {
    expect(colors.bg).toBeDefined();
    expect(colors.accent).toBeDefined();
    expect(colors.danger).toBeDefined();
  });

  it("exports spacing scale", () => {
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
    expect(spacing.xl).toBe(32);
  });

  it("exports radius scale", () => {
    expect(radius.pill).toBe(999);
  });

  it("type tokens inherit serif font for display", () => {
    expect(type.display.fontFamily).toBe("Georgia");
  });
});