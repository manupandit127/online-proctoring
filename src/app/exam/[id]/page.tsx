import { db } from "@/db";
import { exams, questions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ExamClient from "./ExamClient";

export const dynamic = "force-dynamic";

export default async function ExamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [exam] = await db.select().from(exams).where(eq(exams.id, id));
  if (!exam) notFound();

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
    .where(eq(questions.examId, id));

  return (
    <ExamClient
      exam={{ id: exam.id, title: exam.title, durationMinutes: exam.durationMinutes }}
      questions={qs}
    />
  );
}
