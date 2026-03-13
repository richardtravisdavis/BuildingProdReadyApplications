import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const [user] = await db
      .select({ id: users.id, email: users.email, hasPassword: users.password })
      .from(users)
      .where(eq(users.email, "richardtravisdavis@gmail.com"))
      .limit(1);

    if (!user) {
      return NextResponse.json({ status: "no_user_found" });
    }

    return NextResponse.json({
      status: "ok",
      userId: user.id,
      email: user.email,
      hasPassword: !!user.hasPassword,
      passwordLength: user.hasPassword?.length ?? 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "db_error", error: message }, { status: 500 });
  }
}
