import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, exams, proctoringEvents } from "@/db/schema";
import { eq, avg, count, sql, desc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const attemptsList = await db
    .select()
    .from(attempts)
    .where(eq(attempts.examId, examId))
    .orderBy(desc(attempts.startedAt));

  const submitted = attemptsList.filter((a) => a.submittedAt !== null);

  const totalAttempts = attemptsList.length;
  const avgScore =
    submitted.length > 0
      ? submitted.reduce((s, a) => s + (a.score || 0), 0) / submitted.length
      : 0;
  const avgTotal =
    submitted.length > 0
      ? submitted.reduce((s, a) => s + (a.totalMarks || 0), 0) / submitted.length
      : 0;
  const highestScore = submitted.length > 0 ? Math.max(...submitted.map((a) => a.score || 0)) : 0;
  const lowestScore = submitted.length > 0 ? Math.min(...submitted.map((a) => a.score || 0)) : 0;
  const passRate =
    submitted.length > 0
      ? (submitted.filter((a) => (a.score || 0) >= (a.totalMarks || 1) * 0.4).length /
          submitted.length) *
        100
      : 0;

  return NextResponse.json({
    exam,
    totalAttempts,
    submittedCount: submitted.length,
    avgScore: Math.round(avgScore * 100) / 100,
    avgTotal: Math.round(avgTotal * 100) / 100,
    highestScore,
    lowestScore,
    passRate: Math.round(passRate),
    attempts: attemptsList,
  });
}
