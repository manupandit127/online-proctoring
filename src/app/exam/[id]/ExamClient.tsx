"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  marks: number;
}

interface Props {
  exam: { id: string; title: string; durationMinutes: number };
  questions: Question[];
}

type ExamPhase = "register" | "active" | "submitted";

export default function ExamClient({ exam, questions }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<ExamPhase>("register");
  const [studentName, setStudentName] = useState("");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; totalMarks: number } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [procFlags, setProcFlags] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start webcam
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Log proctoring event
  const logProctoring = useCallback(
    async (eventType: string, detail: string) => {
      if (!attemptId) return;
      setProcFlags((p) => p + 1);
      try {
        await fetch("/api/proctoring", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, eventType, detail }),
        });
      } catch {
        // silent
      }
    },
    [attemptId]
  );

  // Tab visibility detection
  useEffect(() => {
    if (phase !== "active") return;

    const handleVisibility = () => {
      if (document.hidden) {
        logProctoring("tab_switch", "Student switched tabs or minimized window");
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [phase, logProctoring]);

  // Timer
  useEffect(() => {
    if (phase !== "active") return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const startExam = async () => {
    if (!studentName.trim()) return alert("Enter your name");

    const res = await fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: exam.id, studentName }),
    });
    const data = await res.json();
    setAttemptId(data.attempt.id);
    setPhase("active");
    startCamera();
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    stopCamera();

    const answerPayload = questions.map((q) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[q.id] || null,
    }));

    try {
      const res = await fetch(`/api/attempts/${attemptId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerPayload }),
      });
      const data = await res.json();
      setResult({ score: data.score, totalMarks: data.totalMarks });
      setPhase("submitted");
    } catch {
      alert("Error submitting exam");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // Registration phase
  if (phase === "register") {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{exam.title}</h1>
          <div className="text-gray-500 text-sm mb-6">
            {questions.length} questions • {exam.durationMinutes} minutes
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800 text-left">
            <p className="font-semibold mb-1">⚠️ Proctoring Notice</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Your webcam will be active during the exam</li>
              <li>Tab switches will be flagged</li>
              <li>Stay visible in the camera at all times</li>
            </ul>
          </div>

          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            placeholder="Enter your full name"
          />
          <button
            onClick={startExam}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  // Result phase
  if (phase === "submitted" && result) {
    const percentage = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;
    const passed = percentage >= 40;
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-5xl mb-4">{passed ? "🎉" : "😔"}</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Exam Submitted!</h1>
          <p className="text-gray-500 mb-6">{exam.title}</p>

          <div className={`text-6xl font-bold mb-2 ${passed ? "text-green-600" : "text-red-500"}`}>
            {percentage}%
          </div>
          <p className="text-gray-600 mb-4">
            {result.score} / {result.totalMarks} marks
          </p>

          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {passed ? "PASSED" : "FAILED"}
          </div>

          {procFlags > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              ⚠️ {procFlags} proctoring flag(s) recorded
            </div>
          )}

          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Active exam phase
  const q = questions[currentQ];
  const answered = Object.keys(selectedAnswers).length;
  const timeWarning = timeLeft < 60;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Top bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">{exam.title}</h2>
          <p className="text-xs text-gray-400">
            {answered}/{questions.length} answered
          </p>
        </div>
        <div className="flex items-center gap-4">
          {procFlags > 0 && (
            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
              ⚠️ {procFlags} flags
            </span>
          )}
          <div
            className={`text-lg font-mono font-bold px-3 py-1 rounded-lg ${
              timeWarning ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-700"
            }`}
          >
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Question area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 font-medium">
                Question {currentQ + 1} of {questions.length}
              </span>
              <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                {q.marks} mark{q.marks > 1 ? "s" : ""}
              </span>
            </div>

            <p className="text-lg text-gray-800 mb-6 leading-relaxed">{q.questionText}</p>

            <div className="space-y-3">
              {(["A", "B", "C", "D"] as const).map((opt) => {
                const selected = selectedAnswers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() =>
                      setSelectedAnswers((prev) => ({ ...prev, [q.id]: opt }))
                    }
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                      selected
                        ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-semibold mr-3 text-sm">{opt}.</span>
                    {q[`option${opt}` as keyof Question] as string}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setCurrentQ((c) => Math.max(0, c - 1))}
                disabled={currentQ === 0}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 transition font-medium text-sm"
              >
                ← Previous
              </button>
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ((c) => c + 1)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition font-medium text-sm"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium text-sm disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Exam ✓"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Webcam */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 text-center">
              📷 Proctoring
            </p>
            <div className="aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                  Camera off
                </div>
              )}
              <div
                className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${
                  cameraActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>

          {/* Question nav */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <p className="text-xs font-semibold text-gray-500 mb-2">Navigation</p>
            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((qq, i) => {
                const isAnswered = !!selectedAnswers[qq.id];
                const isCurrent = i === currentQ;
                return (
                  <button
                    key={qq.id}
                    onClick={() => setCurrentQ(i)}
                    className={`w-full aspect-square rounded text-xs font-medium transition ${
                      isCurrent
                        ? "bg-indigo-600 text-white"
                        : isAnswered
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50 text-sm shadow"
          >
            {submitting ? "Submitting..." : "Submit Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
