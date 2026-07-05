import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ExamGuard - Online Examination Platform",
  description: "Secure online examination and proctoring platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        <nav className="bg-indigo-700 text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              🛡️ ExamGuard
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-indigo-200 transition">
                Dashboard
              </Link>
              <Link href="/create" className="hover:text-indigo-200 transition">
                Create Exam
              </Link>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
