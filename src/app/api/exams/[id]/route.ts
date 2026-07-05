import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exams, questions, attempts, answers } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [exam] = await db.select().from(exams).where(eq(exams.id, id));
  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.examId, id));

  return NextResponse.json({ ...exam, questions: qs });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(exams).where(eq(exams.id, id));
  return NextResponse.json({ ok: true });
}
