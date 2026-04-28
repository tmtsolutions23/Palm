import { NextResponse } from "next/server";
import { getBackendEnv } from "@/lib/env/backend";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();

  try {
    getBackendEnv();
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("profiles").select("id", { head: true, count: "exact" }).limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          status: "degraded",
          checks: { env: "ok", database: "error" },
          error: error.message,
          latency_ms: Date.now() - startedAt,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      ok: true,
      status: "ok",
      checks: { env: "ok", database: "ok" },
      latency_ms: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        checks: { env: "error", database: "unknown" },
        error: error instanceof Error ? error.message : "healthcheck_failed",
        latency_ms: Date.now() - startedAt,
      },
      { status: 503 },
    );
  }
}
