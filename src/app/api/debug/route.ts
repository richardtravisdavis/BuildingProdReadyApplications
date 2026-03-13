import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, "richardtravisdavis@gmail.com"))
      .limit(1);

    if (!user) {
      return NextResponse.json({ status: "no_user_found" });
    }

    const testPassword = "Cresora2026!";
    const isValid = await bcrypt.compare(testPassword, user.password!);

    return NextResponse.json({
      status: "ok",
      userId: user.id,
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length ?? 0,
      bcryptValid: isValid,
      hashPrefix: user.password?.substring(0, 7),
      hasAuthSecret: !!process.env.AUTH_SECRET,
      authSecretLength: process.env.AUTH_SECRET?.length ?? 0,
      hasTrustHost: !!process.env.AUTH_TRUST_HOST,
      nodeEnv: process.env.NODE_ENV,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    return NextResponse.json({ status: "db_error", error: message, stack, dbUrl: process.env.DATABASE_URL?.substring(0, 30) }, { status: 500 });
  }
}
