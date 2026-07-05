import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { proctoringEvents, attempts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { attemptId, eventType, detail } = await req.json();

  await db.insert(proctoringEvents).values({
    attemptId,
    eventType,
    detail: detail || "",
  });

  // Increment proctoring flags count on attempt
  await db
    .update(attempts)
    .set({ proctoringFlags: sql`${attempts.proctoringFlags} + 1` })
    .where(eq(attempts.id, attemptId));

  return NextResponse.json({ ok: true }, { status: 201 });
}
