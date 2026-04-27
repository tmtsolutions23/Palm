import { NextResponse } from "next/server";

/** Internal error class for API routes. The status + code surface to the client. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

/** Standard JSON error response shape. */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.code, message: err.message }, { status: err.status });
  }
  console.error("Unhandled API error", err);
  return NextResponse.json(
    { error: "internal", message: "Something went wrong" },
    { status: 500 },
  );
}
