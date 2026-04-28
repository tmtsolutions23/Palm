import { NextResponse } from "next/server";
import { ZodError } from "zod";

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

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        error: "invalid_request",
        message: err.issues[0]?.message ?? "Invalid request body",
        issues: err.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })),
      },
      { status: 400 },
    );
  }

  if (err instanceof SyntaxError) {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  console.error("Unhandled API error", err);
  return NextResponse.json(
    { error: "internal", message: "Something went wrong" },
    { status: 500 },
  );
}
