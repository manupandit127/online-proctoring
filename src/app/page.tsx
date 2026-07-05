import { db } from "@/db";
import { exams, attempts, questions } from "@/db/schema";
import { desc, eq, count, sql } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const allExams = await db
    .select()
    .from(exams)
    .orderBy(desc(exams.createdAt));

  // Get question counts and attempt counts
  const examData = await Promise.all(
    allExams.map(async (exam) => {
      const [qCount] = await db
        .select({ count: count() })
        .from(questions)
        .where(eq(questions.examId, exam.id));
      const [aCount] = await db
        .select({ count: count() })
        .from(attempts)
        .where(eq(attempts.examId, exam.id));
      return {
        ...exam,
        questionCount: qCount?.count || 0,
        attemptCount: aCount?.count || 0,
      };
    })
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">📋 Exam Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage exams, view results, and monitor proctoring</p>
        </div>
        <Link
          href="/create"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow"
        >
          + Create Exam
        </Link>
      </div>

      {examData.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
          <p className="text-5xl mb-4">📝</p>
          <h2 className="text-xl font-semibold text-gray-700">No exams yet</h2>
          <p className="text-gray-400 mt-2">Create your first exam to get started</p>
          <Link
            href="/create"
            className="inline-block mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition"
          >
            Create Exam
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {examData.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-gray-800 truncate">{exam.title}</h3>
              {exam.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{exam.description}</p>
              )}
              <div className="flex gap-4 mt-3 text-sm text-gray-500">
                <span>⏱ {exam.durationMinutes} min</span>
                <span>❓ {exam.questionCount} Q</span>
                <span>👥 {exam.attemptCount} attempts</span>
              </div>
              <div className="flex gap-2 mt-4">
                <Link
                  href={`/exam/${exam.id}`}
                  className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition font-medium"
                >
                  Take Exam
                </Link>
                <Link
                  href={`/analytics/${exam.id}`}
                  className="text-sm bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition font-medium"
                >
                  Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
