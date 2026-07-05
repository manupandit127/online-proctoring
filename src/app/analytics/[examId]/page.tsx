import { db } from "@/db";
import { exams, attempts, questions } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
  if (!exam) notFound();

  const [qCount] = await db
    .select({ count: count() })
    .from(questions)
    .where(eq(questions.examId, examId));

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
  const highestScore =
    submitted.length > 0 ? Math.max(...submitted.map((a) => a.score || 0)) : 0;
  const lowestScore =
    submitted.length > 0 ? Math.min(...submitted.map((a) => a.score || 0)) : 0;
  const passCount = submitted.filter(
    (a) => (a.score || 0) >= (a.totalMarks || 1) * 0.4
  ).length;
  const passRate = submitted.length > 0 ? Math.round((passCount / submitted.length) * 100) : 0;
  const flaggedCount = attemptsList.filter((a) => a.proctoringFlags > 0).length;

  return (
    <div>
      <Link href="/" className="text-indigo-600 hover:underline text-sm mb-4 inline-block">
        ← Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-1">📊 {exam.title}</h1>
      <p className="text-gray-500 mb-6">
        {qCount?.count || 0} questions • {exam.durationMinutes} min duration
      </p>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Attempts" value={totalAttempts} icon="👥" />
        <StatCard label="Avg Score" value={`${Math.round(avgScore)}/${Math.round(avgTotal)}`} icon="📈" />
        <StatCard label="Pass Rate" value={`${passRate}%`} icon="✅" color={passRate >= 50 ? "green" : "red"} />
        <StatCard label="Flagged" value={flaggedCount} icon="🚩" color={flaggedCount > 0 ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Highest Score" value={highestScore} icon="🏆" color="green" />
        <StatCard label="Lowest Score" value={lowestScore} icon="📉" color="red" />
        <StatCard label="Submitted" value={submitted.length} icon="📝" />
      </div>

      {/* Score distribution bar */}
      {submitted.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="font-semibold text-gray-800 mb-4">Score Distribution</h3>
          <div className="space-y-2">
            {submitted.map((a) => {
              const pct =
                a.totalMarks && a.totalMarks > 0
                  ? Math.round(((a.score || 0) / a.totalMarks) * 100)
                  : 0;
              const pass = pct >= 40;
              return (
                <div key={a.id} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32 truncate">{a.studentName}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pass ? "bg-green-500" : "bg-red-400"
                      }`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-16 text-right">
                    {pct}%
                  </span>
                  {a.proctoringFlags > 0 && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      🚩{a.proctoringFlags}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attempts table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">All Attempts</h3>
        </div>
        {attemptsList.length === 0 ? (
          <p className="p-6 text-center text-gray-400">No attempts yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Student</th>
                  <th className="text-left px-4 py-3 font-medium">Started</th>
                  <th className="text-left px-4 py-3 font-medium">Score</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attemptsList.map((a) => {
                  const pct =
                    a.totalMarks && a.totalMarks > 0
                      ? Math.round(((a.score || 0) / a.totalMarks) * 100)
                      : null;
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{a.studentName}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(a.startedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {a.submittedAt
                          ? `${a.score}/${a.totalMarks} (${pct}%)`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {a.submittedAt ? (
                          pct !== null && pct >= 40 ? (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Passed
                            </span>
                          ) : (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Failed
                            </span>
                          )
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {a.proctoringFlags > 0 ? (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            🚩 {a.proctoringFlags}
                          </span>
                        ) : (
                          <span className="text-xs text-green-600">Clean</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <span>{icon}</span>
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <p
        className={`text-2xl font-bold ${
          color === "green"
            ? "text-green-600"
            : color === "red"
            ? "text-red-500"
            : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
