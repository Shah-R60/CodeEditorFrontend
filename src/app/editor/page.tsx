"use client";

import { useMemo, useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Lock } from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";

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
  cpp: `#include <iostream>
#include <vector>
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
  const [language, setLanguage] = useState<LanguageKey>("cpp");
  const [code, setCode] = useState<string>(languageTemplates.cpp);
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
    <div className="flex h-screen flex-col bg-[#0a0a0a] text-white overflow-hidden">
      <nav className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 bg-[#161616] px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-[0.3em] text-emerald-500">
            CODE
          </span>
          <span className="text-sm font-semibold text-gray-200">Execution Lab</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(event) => handleLanguageChange(event.target.value as LanguageKey)}
            className="rounded-md border border-gray-700 bg-[#262626] px-3 py-1 text-xs text-gray-200 shadow-sm outline-none transition focus:border-emerald-500"
          >
            {Object.entries(languageMeta).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
        </div>
      </nav>

      <div className="flex-1 p-2 min-h-0 overflow-hidden">
        <Group orientation="horizontal" className="flex">
          
          {/* Left Panel: Problem */}
          <Panel defaultSize={45} minSize={25} className="flex flex-col rounded-xl border border-gray-800 bg-[#1e1e1e] overflow-hidden shadow-sm">
            <div className="flex shrink-0 items-center bg-[#262626] px-4 py-2 border-b border-gray-800">
              <span className="text-sm font-semibold text-gray-300">Description</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {!question ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">Loading problem...</div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-100">{question.title}</h1>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      question.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-400' :
                      question.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {question.difficulty}
                    </span>
                  </div>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300">
                    <p className="whitespace-pre-wrap">{question.description}</p>
                  </div>
                </>
              )}
            </div>
          </Panel>

          <Separator className="w-2 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition flex flex-col justify-center items-center group cursor-col-resize">
            <div className="h-8 w-1 rounded-full bg-gray-800 group-hover:bg-emerald-500/50 transition"></div>
          </Separator>

          {/* Right Panel: Editor + Results */}
          <Panel defaultSize={55} minSize={30}>
            <Group orientation="vertical" className="flex flex-col">
              
              {/* Top Half: Editor */}
              <Panel defaultSize={60} minSize={20} className="flex flex-col rounded-xl border border-gray-800 bg-[#1e1e1e] overflow-hidden shadow-sm">
                <div className="flex shrink-0 items-center justify-between bg-[#262626] px-4 py-2 border-b border-gray-800">
                  <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <span className="text-emerald-500">&lt;/&gt;</span> Code
                  </span>
                  <span className="text-xs text-gray-400">{languageMeta[language].label}</span>
                </div>
                <div className="relative flex-1">
                  <div className="absolute inset-0 pt-2">
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
                        automaticLayout: true,
                        padding: { top: 16, bottom: 16 }
                      }}
                    />
                  </div>
                </div>
              </Panel>

              <Separator className="h-2 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition flex justify-center items-center group cursor-row-resize">
                 <div className="w-8 h-1 rounded-full bg-gray-800 group-hover:bg-emerald-500/50 transition"></div>
              </Separator>

              {/* Bottom Half: Test Results */}
              <Panel defaultSize={40} minSize={20} className="flex flex-col rounded-xl border border-gray-800 bg-[#1e1e1e] overflow-hidden shadow-sm">
                <div className="flex shrink-0 items-center justify-between bg-[#262626] px-4 py-2 border-b border-gray-800">
                  <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    <span className="text-emerald-500">☑</span> Testcase
                  </h2>
                  <div className={`text-xs font-semibold ${verdictTone || "text-gray-500"}`}>
                    {verdictLabel}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {errorBanner ? (
                    <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                      {errorBanner}
                    </div>
                  ) : null}

                  {isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-gray-500">
                      Running your code...
                    </div>
                  ) : results ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2 border-b border-gray-800 pb-2">
                        {results.results.map((result, index) => (
                          <button
                            key={result.testCase}
                            onClick={() => setActiveTab(index)}
                            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition ${
                              index === activeTab
                                ? "bg-[#333333] text-gray-100"
                                : "bg-transparent text-gray-500 hover:bg-[#262626] hover:text-gray-300"
                            }`}
                          >
                            Case {result.testCase}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-4">
                        {selectedResult ? (
                          <div className="text-xs text-gray-500 font-medium">
                            {selectedResult.passed ? "Accepted" : "Rejected"} in {selectedResult.timeMs}ms
                          </div>
                        ) : null}

                        {selectedTestCase?.isHidden ? (
                          <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-[#161616] p-8 text-gray-500">
                            <Lock className="h-6 w-6" />
                            <span className="text-sm font-semibold">Hidden Test Case</span>
                          </div>
                        ) : (
                          <>
                            <div>
                              <p className="text-xs text-gray-500 mb-1.5">Input</p>
                              <pre className="rounded-md bg-[#161616] p-3 text-sm text-gray-300 font-mono">
                                {selectedTestCase?.input || ""}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1.5">
                                {selectedResult?.stderr ? "Error" : "Output"}
                              </p>
                              <pre
                                className={`rounded-md p-3 text-sm font-mono ${
                                  selectedResult?.stderr
                                    ? "bg-rose-950/20 text-rose-400"
                                    : "bg-[#161616] text-gray-300"
                                }`}
                              >
                                {selectedResult?.stderr
                                  ? selectedResult.stderr
                                  : selectedResult?.stdout || ""}
                              </pre>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1.5">Expected</p>
                              <pre className="rounded-md bg-[#161616] p-3 text-sm text-gray-300 font-mono">
                                {selectedResult?.expected || ""}
                              </pre>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-600">
                      Run your code to see results.
                    </div>
                  )}
                </div>

                {/* Run Button Footer */}
                <div className="flex shrink-0 items-center justify-end border-t border-gray-800 bg-[#161616] px-4 py-3">
                  <button
                    onClick={handleRun}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-md bg-emerald-500/10 border border-emerald-500/20 px-6 py-1.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    {isLoading ? "Running" : "Run Code"}
                  </button>
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
