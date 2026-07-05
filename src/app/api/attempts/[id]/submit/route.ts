import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attempts, answers, questions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: attemptId } = await params;
  const { answers: studentAnswers } = await req.json();
  // studentAnswers: Array<{ questionId: string, selectedOption: string | null }>

  const [attempt] = await db
    .select()
    .from(attempts)
    .where(eq(attempts.id, attemptId));
  if (!attempt)
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });

  // Fetch all questions for this exam
  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.examId, attempt.examId));

  const qMap = new Map(qs.map((q) => [q.id, q]));

  let score = 0;
  let totalMarks = 0;

  const answerRows = (studentAnswers as Array<{ questionId: string; selectedOption: string | null }>).map(
    (a) => {
      const q = qMap.get(a.questionId);
      const isCorrect = q ? a.selectedOption === q.correctOption : false;
      const marks = q ? q.marks : 0;
      totalMarks += marks;
      if (isCorrect) score += marks;
      return {
        attemptId,
        questionId: a.questionId,
        selectedOption: a.selectedOption,
        isCorrect,
      };
    }
  );

  if (answerRows.length > 0) {
    await db.insert(answers).values(answerRows);
  }

  const [updated] = await db
    .update(attempts)
    .set({ submittedAt: new Date(), score, totalMarks })
    .where(eq(attempts.id, attemptId))
    .returning();

  return NextResponse.json(updated);
}
