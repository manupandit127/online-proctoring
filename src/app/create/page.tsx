"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface QuestionForm {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  marks: number;
}

const emptyQuestion: QuestionForm = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  marks: 1,
};

export default function CreateExam() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [questions, setQuestions] = useState<QuestionForm[]>([{ ...emptyQuestion }]);
  const [loading, setLoading] = useState(false);

  const updateQuestion = (index: number, field: keyof QuestionForm, value: string | number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addQuestion = () => setQuestions((prev) => [...prev, { ...emptyQuestion }]);

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");
    if (questions.some((q) => !q.questionText.trim())) return alert("All questions need text");

    setLoading(true);
    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, durationMinutes, questions }),
      });
      if (res.ok) {
        router.push("/");
      } else {
        alert("Failed to create exam");
      }
    } catch {
      alert("Error creating exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">✏️ Create New Exam</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g., JavaScript Fundamentals"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              rows={2}
              placeholder="Brief description of the exam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              min={1}
              max={300}
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-800">Questions</h2>

        {questions.map((q, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-700">Question {i + 1}</span>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>

            <textarea
              value={q.questionText}
              onChange={(e) => updateQuestion(i, "questionText", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              rows={2}
              placeholder="Enter question text..."
              required
            />

            <div className="grid grid-cols-2 gap-3">
              {(["A", "B", "C", "D"] as const).map((opt) => (
                <div key={opt} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 w-5">{opt}.</span>
                  <input
                    type="text"
                    value={q[`option${opt}` as keyof QuestionForm] as string}
                    onChange={(e) => updateQuestion(i, `option${opt}` as keyof QuestionForm, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder={`Option ${opt}`}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 items-center">
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Correct Answer:</label>
                <select
                  value={q.correctOption}
                  onChange={(e) => updateQuestion(i, "correctOption", e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mr-2">Marks:</label>
                <input
                  type="number"
                  value={q.marks}
                  onChange={(e) => updateQuestion(i, "marks", Number(e.target.value))}
                  className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  min={1}
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition font-medium"
        >
          + Add Question
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow"
        >
          {loading ? "Creating..." : "Create Exam"}
        </button>
      </form>
    </div>
  );
}
