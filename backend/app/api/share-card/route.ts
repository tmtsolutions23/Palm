import { type NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { z } from "zod";
import { createElement as h } from "react";

export const runtime = "edge";

const Body = z.object({
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(280),
});

/**
 * Generates a 1080x1080 shareable card PNG via Vercel OG.
 *
 * NOTE: This file uses React.createElement (not JSX) so it can live in a
 * `.ts` file. If you'd prefer JSX, rename to `route.tsx`.
 */
export async function POST(req: NextRequest) {
  const { title, body } = Body.parse(await req.json());

  return new ImageResponse(
    h(
      "div",
      {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          color: "#fef9ef",
          background:
            "linear-gradient(135deg, #1a1033 0%, #3d1d63 50%, #6b2890 100%)",
          fontFamily: "serif",
        },
      },
      h(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 16 } },
        h("div", { style: { fontSize: 36, opacity: 0.8 } }, "✶"),
        h(
          "div",
          { style: { fontSize: 32, letterSpacing: 4, opacity: 0.85 } },
          "PALM READER",
        ),
      ),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: 24 } },
        h("div", { style: { fontSize: 64, lineHeight: 1.1 } }, title),
        h("div", { style: { fontSize: 36, lineHeight: 1.4, opacity: 0.92 } }, body),
      ),
      h("div", { style: { fontSize: 24, opacity: 0.65 } }, "palmreader.app"),
    ),
    { width: 1080, height: 1080 },
  );
}
