import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, questions, exams } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Start an attempt
export async function POST(req: NextRequest) {
  const { examId, studentName } = await req.json();

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const [attempt] = await db
    .insert(attempts)
    .values({ examId, studentName })
    .returning();

  const qs = await db
    .select({
      id: questions.id,
      questionText: questions.questionText,
      optionA: questions.optionA,
      optionB: questions.optionB,
      optionC: questions.optionC,
      optionD: questions.optionD,
      marks: questions.marks,
    })
    .from(questions)
    .where(eq(questions.examId, examId));

  return NextResponse.json({
    attempt,
    exam: { title: exam.title, durationMinutes: exam.durationMinutes },
    questions: qs,
  }, { status: 201 });
}

// List all attempts (for analytics)
export async function GET() {
  const all = await db
    .select()
    .from(attempts)
    .orderBy(desc(attempts.startedAt));
  return NextResponse.json(all);
}
