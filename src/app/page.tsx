"use client";

import { useMemo, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Lock } from "lucide-react";

type LanguageKey = "python" | "javascript" | "cpp";

type TestCase = {
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
};

type Question = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  boilerplate?: Record<string, string> | null;
  testCases: TestCase[];
};

type TestResult = {
  testCase: number;
  passed: boolean;
  stdout: string;
  stderr: string;
  expected: string;
  timeMs: number;
};

type ExecuteResponse = {
  success: boolean;
  results: TestResult[];
  totalPassed: number;
  totalTests: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const languageTemplates: Record<LanguageKey, string> = {
  python: `def solve():
    a, b = map(int, input().split())
    print(a + b)

if __name__ == "__main__":
    solve()
`,
  javascript: `const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const a = input[0] ?? 0;
const b = input[1] ?? 0;
console.log(a + b);
`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long a, b;
    if (!(cin >> a >> b)) return 0;
    cout << (a + b);
    return 0;
}
`
};

const languageMeta: Record<LanguageKey, { label: string; monaco: string }> = {
  python: { label: "Python", monaco: "python" },
  javascript: { label: "JavaScript", monaco: "javascript" },
  cpp: { label: "C++", monaco: "cpp" }
};

export default function Home() {
  const [language, setLanguage] = useState<LanguageKey>("python");
  const [code, setCode] = useState<string>(languageTemplates.python);
  const [question, setQuestion] = useState<Question | null>(null);
  const [results, setResults] = useState<ExecuteResponse | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string>("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/db/questions/random`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setQuestion(data.data);
        }
      })
      .catch(console.error);
  }, []);

  // Update editor code when question or language changes
  useEffect(() => {
    if (question && question.boilerplate && question.boilerplate[language]) {
      setCode(question.boilerplate[language]);
    } else {
      setCode(languageTemplates[language]);
    }
  }, [question, language]);

  const selectedResult = results?.results[activeTab] ?? null;
  const selectedTestCase = question?.testCases[activeTab] ?? null;

  const verdictLabel = useMemo(() => {
    if (!results) return "Ready";
    return results.success ? "Accepted" : "Rejected";
  }, [results]);

  const verdictTone = results?.success ? "text-emerald-400" : "text-rose-400";

  const handleLanguageChange = (value: LanguageKey) => {
    setLanguage(value);
  };

  const handleRun = async () => {
    setIsLoading(true);
    setErrorBanner("");
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, testCases: question?.testCases || [] })
      });

      let data: ExecuteResponse | null = null;
      try {
        data = (await response.json()) as ExecuteResponse;
      } catch (err) {
        data = null;
      }

      if (!response.ok || !data) {
        const message =
          (data as unknown as { error?: string })?.error ||
          `Request failed with status ${response.status}`;
        setErrorBanner(message);
        return;
      }

      setResults(data);
      setActiveTab(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch";
      setErrorBanner(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950 text-white">
      <nav className="flex items-center justify-between border-b border-gray-800 bg-gray-950/70 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-[0.3em] text-emerald-400">
            CODE
          </span>
          <span className="text-lg font-semibold">Execution Lab</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase text-gray-400">Language</span>
          <select
            value={language}
            onChange={(event) => handleLanguageChange(event.target.value as LanguageKey)}
            className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white shadow-sm outline-none transition focus:border-emerald-500"
          >
            {Object.entries(languageMeta).map(([key, meta]) => (
              <option key={key} value={key} className="bg-gray-900">
                {meta.label}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <div className="flex flex-1 flex-col gap-4 px-6 py-5 lg:flex-row">
        <section className="flex w-full flex-1 flex-col gap-4 lg:w-1/2">
          <div className="flex flex-1 flex-col rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-lg">
            {!question ? (
              <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading problem...</div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Problem</h2>
                  <span className={`rounded-full border px-3 py-1 text-xs uppercase ${
                    question.difficulty === 'HARD' ? 'border-rose-500/50 bg-rose-500/10 text-rose-300' :
                    question.difficulty === 'MEDIUM' ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' :
                    'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {question.difficulty}
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-6 text-gray-200">
                  <p className="text-base font-semibold text-white">{question.title}</p>
                  <p className="whitespace-pre-wrap">{question.description}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-1 flex-col rounded-2xl border border-gray-800 bg-gray-900/70 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Test Results</h2>
              <div className={`text-sm font-semibold ${verdictTone || "text-gray-300"}`}>
                {verdictLabel}
              </div>
            </div>

            {errorBanner ? (
              <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {errorBanner}
              </div>
            ) : null}

            {isLoading ? (
              <div className="mt-6 flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-700 text-sm text-gray-400">
                Running your code...
              </div>
            ) : results ? (
              <div className="mt-4 flex flex-1 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  {results.results.map((result, index) => (
                    <button
                      key={result.testCase}
                      onClick={() => setActiveTab(index)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        index === activeTab
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-gray-800 text-gray-300 hover:text-white"
                      }`}
                    >
                      Test {result.testCase}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-4 rounded-xl border border-gray-800 bg-gray-950/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
                    <span>
                      Passed {results.totalPassed} / {results.totalTests}
                    </span>
                    {selectedResult ? (
                      <span>
                        {selectedResult.passed ? "Accepted" : "Rejected"} in {" "}
                        {selectedResult.timeMs}ms
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 text-sm">
                    {selectedTestCase?.isHidden ? (
                      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-gray-800 bg-gray-900/80 p-8 text-gray-400">
                        <Lock className="h-6 w-6" />
                        <span className="text-sm font-semibold">Hidden Test Case</span>
                        <p className="text-xs text-center max-w-xs">Input and Expected Output are hidden. Your code must handle edge cases automatically.</p>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className="text-xs uppercase text-gray-400">Input</p>
                          <pre className="mt-2 rounded-lg border border-gray-800 bg-gray-900/80 p-3 text-xs text-gray-200">
                            {selectedTestCase?.input || ""}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-gray-400">
                            {selectedResult?.stderr ? "Error" : "Your Output"}
                          </p>
                          <pre
                            className={`mt-2 rounded-lg border p-3 text-xs ${
                              selectedResult?.stderr
                                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                                : "border-gray-800 bg-gray-900/80 text-gray-200"
                            }`}
                          >
                            {selectedResult?.stderr
                              ? selectedResult.stderr
                              : selectedResult?.stdout || ""}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs uppercase text-gray-400">Expected</p>
                          <pre className="mt-2 rounded-lg border border-gray-800 bg-gray-900/80 p-3 text-xs text-gray-200">
                            {selectedResult?.expected || ""}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-800 text-sm text-gray-400">
                Run your code to see results.
              </div>
            )}
          </div>
        </section>

        <section className="flex w-full flex-1 flex-col gap-4 lg:w-1/2">
          <div className="flex flex-1 flex-col rounded-2xl border border-gray-800 bg-gray-900/70 p-4 shadow-lg">
            <div className="flex items-center justify-between px-2 py-1 text-sm text-gray-400">
              <span>Editor</span>
              <span className="text-xs">{languageMeta[language].label}</span>
            </div>
            <div className="mt-3 flex flex-1 rounded-xl border border-gray-800 bg-gray-950/70 p-2">
              <Editor
                height="100%"
                theme="vs-dark"
                language={languageMeta[language].monaco}
                value={code}
                onChange={(value) => setCode(value ?? "")}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 }
                }}
              />
            </div>
            <div className="mt-4 flex items-center justify-end">
              <button
                onClick={handleRun}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                {isLoading ? "Running" : "Run Code"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
