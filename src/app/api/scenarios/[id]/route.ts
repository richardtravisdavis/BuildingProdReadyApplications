import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { scenarios } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { updateScenarioSchema } from "@/lib/scenario-schema";
import { rateLimit } from "@/lib/rate-limit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = rateLimit(`scenarios-update:${session.user.id}`, { maxRequests: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateScenarioSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updates.name = parsed.data.name;
    if (parsed.data.inputs !== undefined) updates.inputs = parsed.data.inputs;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const [row] = await db
      .update(scenarios)
      .set(updates)
      .where(and(eq(scenarios.id, id), eq(scenarios.userId, session.user.id)))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { success } = rateLimit(`scenarios-delete:${session.user.id}`, { maxRequests: 10, windowMs: 60_000 });
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { id } = await params;

    const [row] = await db
      .delete(scenarios)
      .where(and(eq(scenarios.id, id), eq(scenarios.userId, session.user.id)))
      .returning();

    if (!row) {
      return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Scenario deleted" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
