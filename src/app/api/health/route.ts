import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

let lastCheck: { status: string; database: string; checkedAt: number } | null = null;
const CACHE_TTL_MS = 10_000; // Cache health status for 10 seconds

export async function GET() {
  const now = Date.now();

  if (lastCheck && now - lastCheck.checkedAt < CACHE_TTL_MS) {
    const status = lastCheck.status === "healthy" ? 200 : 503;
    return NextResponse.json(lastCheck, { status });
  }

  try {
    await db.execute(sql`SELECT 1`);
    lastCheck = { status: "healthy", database: "connected", checkedAt: now };
    return NextResponse.json(lastCheck);
  } catch {
    lastCheck = { status: "unhealthy", database: "disconnected", checkedAt: now };
    return NextResponse.json(lastCheck, { status: 503 });
  }
}
