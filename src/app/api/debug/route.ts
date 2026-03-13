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

    if (!user) return NextResponse.json({ status: "no_user" });

    const isValid = await bcrypt.compare("Cresora2026!", user.password!);
    return NextResponse.json({
      status: "ok",
      userFound: true,
      bcryptValid: isValid,
      hashPrefix: user.password?.substring(0, 10),
      hashLength: user.password?.length,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
