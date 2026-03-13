import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const rows = await sql`SELECT id, email, length(password) as pw_len FROM users WHERE email = 'richardtravisdavis@gmail.com' LIMIT 1`;

    return NextResponse.json({
      status: "ok",
      rows,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      authSecretLength: process.env.AUTH_SECRET?.length ?? 0,
      hasTrustHost: !!process.env.AUTH_TRUST_HOST,
      dbUrlEnd: process.env.DATABASE_URL?.split("?")[1] ?? "no_params",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const cause = (err as { cause?: unknown })?.cause;
    return NextResponse.json({
      status: "error",
      error: message,
      cause: cause ? String(cause) : undefined,
      dbUrlEnd: process.env.DATABASE_URL?.split("?")[1] ?? "no_params",
    }, { status: 500 });
  }
}
