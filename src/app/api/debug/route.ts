import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request) {
  const sql = neon(process.env.DATABASE_URL!);
  const url = new URL(request.url);

  if (url.searchParams.get("fix") === "1") {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL`;
    return NextResponse.json({ status: "fixed" });
  }

  const columns = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
  return NextResponse.json({ columns: columns.map(c => c.column_name) });
}
