import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { scenarios } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { createScenarioSchema } from "@/lib/scenario-schema";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.userId, session.user.id))
      .orderBy(desc(scenarios.updatedAt));

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createScenarioSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    // Enforce max 25 scenarios per user
    const existing = await db
      .select()
      .from(scenarios)
      .where(eq(scenarios.userId, session.user.id));

    if (existing.length >= 25) {
      return NextResponse.json({ error: "Maximum 25 scenarios allowed. Delete an existing scenario first." }, { status: 400 });
    }

    const [row] = await db
      .insert(scenarios)
      .values({
        userId: session.user.id,
        name: parsed.data.name,
        inputs: parsed.data.inputs,
      })
      .returning();

    return NextResponse.json(row, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
