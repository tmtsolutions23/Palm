export const colors = {
  // Deep mystical purple gradient
  bg:        "#1a1033",
  bgElevated:"#2a1a4a",
  surface:   "#3d1d63",
  surfaceHi: "#6b2890",
  text:      "#fef9ef",
  textMuted: "#cbb6e3",
  textSubtle:"#9b86c2",
  accent:    "#e8b349",      // candlelit gold
  accentHi:  "#f5d271",
  danger:    "#e35b65",
  divider:   "rgba(255,255,255,0.08)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  serif: "Georgia",
  body: "System",
} as const;

export const type = {
  display: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 42, color: colors.text },
  title:   { fontFamily: fonts.serif, fontSize: 24, lineHeight: 30, color: colors.text },
  body:    { fontFamily: fonts.body,  fontSize: 16, lineHeight: 24, color: colors.text },
  bodyMuted: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.textMuted },
  caption: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18, color: colors.textSubtle },
  button:  { fontFamily: fonts.body, fontSize: 17, lineHeight: 22, fontWeight: "600" as const, color: colors.bg },
} as const;
