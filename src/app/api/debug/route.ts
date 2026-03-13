import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET() {
  const results: Record<string, unknown> = {
    dbUrlEnd: process.env.DATABASE_URL?.split("?")[1] ?? "no_params",
    hasAuthSecret: !!process.env.AUTH_SECRET,
    hasTrustHost: !!process.env.AUTH_TRUST_HOST,
  };

  try {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, "richardtravisdavis@gmail.com"))
      .limit(1);

    const user = rows[0];
    results.userFound = !!user;

    if (user?.password) {
      results.bcryptValid = await bcrypt.compare("Cresora2026!", user.password);
      results.hashPrefix = user.password.substring(0, 7);
    }
  } catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    results.dbError = e.message;
    results.dbCause = (e as { cause?: unknown }).cause ? String((e as { cause?: unknown }).cause) : undefined;
  }

  return NextResponse.json(results);
}
