import { sql } from "drizzle-orm";
import { connection, NextResponse } from "next/server";

import { db } from "@/db";

export async function GET() {
  // Opt into request-time rendering so the database is checked per request,
  // never at build time (cacheComponents is on in next.config.ts).
  await connection();
  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ ok: true, db: "up" });
  } catch {
    return NextResponse.json({ ok: false, db: "down" }, { status: 503 });
  }
}
