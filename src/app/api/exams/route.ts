import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { exams, questions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const allExams = await db
    .select()
    .from(exams)
    .orderBy(desc(exams.createdAt));
  return NextResponse.json(allExams);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, durationMinutes, questions: qs } = body;

  const [exam] = await db
    .insert(exams)
    .values({
      title,
      description: description || "",
      durationMinutes: durationMinutes || 30,
      isPublished: true,
    })
    .returning();

  if (qs && Array.isArray(qs) && qs.length > 0) {
    await db.insert(questions).values(
      qs.map((q: any) => ({
        examId: exam.id,
        questionText: q.questionText,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctOption: q.correctOption,
        marks: q.marks || 1,
      }))
    );
  }

  return NextResponse.json(exam, { status: 201 });
}
