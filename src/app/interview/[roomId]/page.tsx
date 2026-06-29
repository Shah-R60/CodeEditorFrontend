"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Editor, { OnMount } from "@monaco-editor/react";
import { Play, Lock, Users, ChevronDown, ChevronUp, Terminal, FileText } from "lucide-react";
import * as Y from "yjs";
import { io, Socket } from "socket.io-client";
import VideoSidebar from "./VideoSidebar";

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
const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

const languageTemplates: Record<LanguageKey, string> = {
  python: `def solve():\n    a, b = map(int, input().split())\n    print(a + b)\n\nif __name__ == "__main__":\n    solve()\n`,
  javascript: `const fs = require("fs");\n\nconst input = fs.readFileSync(0, "utf8").trim().split(/\\s+/).map(Number);\nconst a = input[0] ?? 0;\nconst b = input[1] ?? 0;\nconsole.log(a + b);\n`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    long long a, b;\n    if (!(cin >> a >> b)) return 0;\n    cout << (a + b);\n    return 0;\n}\n`
};

const languageMeta: Record<LanguageKey, { label: string; monaco: string }> = {
  python: { label: "Python", monaco: "python" },
  javascript: { label: "JavaScript", monaco: "javascript" },
  cpp: { label: "C++", monaco: "cpp" }
};

export default function InterviewRoom() {
  const params = useParams();
  const roomId = params?.roomId as string;

  const [language, setLanguage] = useState<LanguageKey>("python");
  const [question, setQuestion] = useState<Question | null>(null);
  const [results, setResults] = useState<ExecuteResponse | null>(null);
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [streamApiKey, setStreamApiKey] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string>("");
  const [connectedUsers, setConnectedUsers] = useState<number>(1);
  
  // Layout State
  const [bottomPanelOpen, setBottomPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<'problem' | 'terminal'>('problem');

  const socketRef = useRef<Socket | null>(null);
  const editorRef = useRef<any>(null);
  const providerRef = useRef<any>(null);
  const bindingRef = useRef<any>(null);

  useEffect(() => {
    const socket = io(API_BASE_URL);
    socketRef.current = socket;

    socket.emit("join-room", roomId);

    socket.on("execution-started", () => {
      setIsLoading(true);
      setErrorBanner("");
      setResults(null);
      setBottomPanelOpen(true); // Auto-open panel on run
      setBottomTab('terminal'); // Switch to terminal tab
    });

    socket.on("execution-result", (data: ExecuteResponse) => {
      setIsLoading(false);
      setResults(data);
      setActiveTab(0);
      setBottomPanelOpen(true);
      setBottomTab('terminal');
    });

    // Fetch GetStream.io token
    const currentUserId = `user_${Math.floor(Math.random() * 100000)}`;
    setUserId(currentUserId);

    fetch(`${API_BASE_URL}/stream/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: currentUserId, roomId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.token) {
          setStreamToken(data.token);
          setStreamApiKey(data.apiKey);
        } else {
          console.error("Failed to fetch stream token:", data.error);
        }
      })
      .catch((err) => console.error("Error fetching stream token:", err));

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleEditorDidMount: OnMount = async (editor, monaco) => {
    editorRef.current = editor;

    // Force LF line endings to prevent Yjs index drifting on Windows
    const model = editor.getModel();
    if (model) {
      model.setEOL(monaco.editor.EndOfLineSequence.LF);
    }

    const { WebsocketProvider } = await import("y-websocket");
    const { MonacoBinding } = await import("y-monaco");

    const doc = new Y.Doc();
    const provider = new WebsocketProvider(
      `${WS_BASE_URL}/yjs`,
      roomId,
      doc
    );
    providerRef.current = provider;

    provider.on("status", (event: { status: string }) => {
      console.log("Yjs WebSocket status:", event.status);
    });

    const type = doc.getText("monaco");
    const state = doc.getMap("state");

    state.observe(() => {
      const syncedQuestion = state.get("question") as Question | undefined;
      if (syncedQuestion) {
        setQuestion(syncedQuestion);
      }
    });

    provider.on("sync", (isSynced: boolean) => {
      if (isSynced) {
        if (type.length === 0) {
           type.insert(0, languageTemplates.python);
        }
        
        if (!state.get("question")) {
          fetch(`${API_BASE_URL}/db/questions/random`)
            .then(res => res.json())
            .then(data => {
              if (data.success && data.data) {
                state.set("question", data.data);
              }
            })
            .catch(console.error);
        }
      }
    });

    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    provider.awareness.setLocalStateField('user', {
      name: `User ${Math.floor(Math.random() * 1000)}`,
      color: randomColor
    });

    provider.awareness.on("change", () => {
      setConnectedUsers(Array.from(provider.awareness.getStates().keys()).length);
    });

    const binding = new MonacoBinding(type, editor.getModel()!, new Set([editor]), provider.awareness);
    bindingRef.current = binding;
  };

  useEffect(() => {
     return () => {
       bindingRef.current?.destroy();
       providerRef.current?.destroy();
     };
  }, []);

  const selectedResult = results?.results[activeTab] ?? null;
  const selectedTestCase = question?.testCases[activeTab] ?? null;

  const verdictLabel = useMemo(() => {
    if (!results) return "Ready";
    return results.success ? "Accepted" : "Rejected";
  }, [results]);

  const verdictTone = results?.success ? "text-emerald-400" : "text-rose-400";

  const handleRun = async () => {
    setIsLoading(true);
    setErrorBanner("");
    setResults(null);
    setBottomPanelOpen(true);
    setBottomTab('terminal');

    socketRef.current?.emit("execution-started", roomId);

    try {
      const currentCode = editorRef.current?.getValue() || "";
      const response = await fetch(`${API_BASE_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code: currentCode, testCases: question?.testCases || [] })
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
        setIsLoading(false);
        return;
      }

      setResults(data);
      setActiveTab(0);
      
      socketRef.current?.emit("execution-result", { roomId, result: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch";
      setErrorBanner(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white overflow-hidden">
      {/* Top Navbar */}
      <nav className="flex shrink-0 items-center justify-between border-b border-gray-800 bg-gray-950/70 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-[0.3em] text-emerald-400">
            CODE
          </span>
          <span className="text-lg font-semibold">Live Interview</span>
          <span className="ml-4 rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-300">
            Room: {roomId}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="h-4 w-4 text-emerald-400" />
            <span>{connectedUsers} Online</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase text-gray-400">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageKey)}
              className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white shadow-sm outline-none transition focus:border-emerald-500"
            >
              {Object.entries(languageMeta).map(([key, meta]) => (
                <option key={key} value={key} className="bg-gray-900">
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRun}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-gray-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {isLoading ? "Running..." : "Run Code"}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Side (70%): Editor + Bottom Panel */}
        <div className="flex w-[70%] flex-col">
          
          {/* Editor Area */}
          <div className="flex-1 overflow-hidden p-4">
            <div className="flex h-full flex-col rounded-2xl border border-gray-800 bg-gray-900/70 shadow-lg">
              <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-400 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Shared Editor</span>
                </div>
                <span className="text-xs">{languageMeta[language].label}</span>
              </div>
              <div className="flex-1 p-2">
                <Editor
                  height="100%"
                  theme="vs-dark"
                  language={languageMeta[language].monaco}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 16, bottom: 16 }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Panel (Collapsible) */}
          <div className={`flex flex-col border-t border-gray-800 bg-gray-900 transition-all duration-300 ease-in-out ${bottomPanelOpen ? 'h-[45%]' : 'h-12'}`}>
            {/* Panel Tabs */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-gray-800 px-4 bg-gray-950">
              <div className="flex gap-2 h-full">
                <button 
                  onClick={() => { setBottomTab('problem'); setBottomPanelOpen(true); }}
                  className={`flex h-full items-center gap-2 border-b-2 px-4 text-sm font-medium transition ${bottomTab === 'problem' && bottomPanelOpen ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  <FileText className="h-4 w-4" />
                  Problem
                </button>
                <button 
                  onClick={() => { setBottomTab('terminal'); setBottomPanelOpen(true); }}
                  className={`flex h-full items-center gap-2 border-b-2 px-4 text-sm font-medium transition ${bottomTab === 'terminal' && bottomPanelOpen ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                >
                  <Terminal className="h-4 w-4" />
                  Terminal
                </button>
              </div>
              <button 
                onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
                className="flex items-center justify-center rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                {bottomPanelOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
            </div>

            {/* Panel Content */}
            {bottomPanelOpen && (
              <div className="flex-1 overflow-y-auto p-4">
                {bottomTab === 'problem' ? (
                  /* Problem Description Tab */
                  <div className="mx-auto max-w-3xl">
                    {!question ? (
                      <div className="flex items-center justify-center py-10 text-sm text-gray-400">Loading problem...</div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <h2 className="text-xl font-bold">{question.title}</h2>
                          <span className={`rounded-full border px-3 py-1 text-xs uppercase ${
                            question.difficulty === 'HARD' ? 'border-rose-500/50 bg-rose-500/10 text-rose-300' :
                            question.difficulty === 'MEDIUM' ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' :
                            'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                          }`}>
                            {question.difficulty}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                          {question.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Terminal Tab */
                  <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Test Results</h2>
                      <div className={`text-sm font-semibold ${verdictTone || "text-gray-300"}`}>
                        {verdictLabel}
                      </div>
                    </div>

                    {errorBanner ? (
                      <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                        {errorBanner}
                      </div>
                    ) : null}

                    {isLoading ? (
                      <div className="flex py-10 items-center justify-center rounded-xl border border-dashed border-gray-700 text-sm text-gray-400">
                        Running shared code...
                      </div>
                    ) : results ? (
                      <div className="flex flex-col gap-4">
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
                                  <pre className="mt-2 overflow-x-auto rounded-lg border border-gray-800 bg-gray-900/80 p-3 text-xs text-gray-200">
                                    {selectedTestCase?.input || ""}
                                  </pre>
                                </div>
                                <div>
                                  <p className="text-xs uppercase text-gray-400">
                                    {selectedResult?.stderr ? "Error" : "Your Output"}
                                  </p>
                                  <pre
                                    className={`mt-2 overflow-x-auto rounded-lg border p-3 text-xs ${
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
                                  <pre className="mt-2 overflow-x-auto rounded-lg border border-gray-800 bg-gray-900/80 p-3 text-xs text-gray-200">
                                    {selectedResult?.expected || ""}
                                  </pre>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex py-10 items-center justify-center rounded-xl border border-dashed border-gray-800 text-sm text-gray-400">
                        Code execution results will appear here.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side (30%): Video Sidebar */}
        <div className="w-[30%] border-l border-gray-800">
          {streamToken && streamApiKey ? (
            <VideoSidebar 
              token={streamToken} 
              apiKey={streamApiKey} 
              userId={userId} 
              callId={roomId} 
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-center">
              <div className="text-sm text-gray-500">
                {errorBanner ? "Failed to load video" : "Connecting to video service..."}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
