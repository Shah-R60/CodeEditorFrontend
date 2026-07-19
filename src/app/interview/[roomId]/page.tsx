"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Editor, { OnMount } from "@monaco-editor/react";
import { Play, Lock, Users, ChevronDown, ChevronUp, Terminal, FileText } from "lucide-react";
import { Panel, Group, Separator } from "react-resizable-panels";
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
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'candidate';
  const stageId = searchParams.get('stageId');

  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false);
  const [globalQuestions, setGlobalQuestions] = useState<Question[]>([]);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [interviewerScore, setInterviewerScore] = useState({
    communication: 0,
    coding: 0,
    core: 0,
    systemDesign: 0
  });
  
  const totalScore = useMemo(() => {
    return Object.values(interviewerScore).reduce((a, b) => a + (Number(b) || 0), 0);
  }, [interviewerScore]);

  const [interviewerNotes, setInterviewerNotes] = useState("");
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const [language, setLanguage] = useState<LanguageKey>("python");
  const [question, setQuestion] = useState<Question | null>(null);
  const [results, setResults] = useState<ExecuteResponse | null>(null);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [videoServerUrl, setVideoServerUrl] = useState<string | null>(null);
  const [userId] = useState<string>(() => `user_${Math.floor(Math.random() * 100000)}`);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string>("");
  const [connectedUsers, setConnectedUsers] = useState<number>(1);
  
  // Layout State
  const [viewMode, setViewMode] = useState<"video" | "coding" | "notepad">("video");
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
      setBottomPanelOpen(true);
      setBottomTab('terminal');
    });

    socket.on("execution-result", (data: ExecuteResponse) => {
      setIsLoading(false);
      setResults(data);
      setActiveTab(0);
      setBottomPanelOpen(true);
      setBottomTab('terminal');
    });

    socket.on("active-question-changed", (q: Question) => {
      setQuestion(q);
    });

    if (role === 'interviewer') {
      const url = stageId ? `${API_BASE_URL}/db/rounds/${stageId}/questions` : `${API_BASE_URL}/db/questions`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data.success) setGlobalQuestions(data.data);
        })
        .catch(console.error);
    }

    // Fetch LiveKit token
    fetch(`${API_BASE_URL}/livekit/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, roomId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.token) {
          setVideoToken(data.token);
          setVideoServerUrl(data.serverUrl);
        } else {
          console.error("Failed to fetch livekit token:", data.error);
        }
      })
      .catch((err) => console.error("Error fetching livekit token:", err));

    return () => {
      socket.disconnect();
    };
  }, [roomId, stageId, role, userId]);

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
      const syncedViewMode = state.get("viewMode") as "video" | "coding" | "notepad" | undefined;
      if (syncedViewMode) {
        setViewMode(syncedViewMode);
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
        
        if (!state.get("viewMode")) {
          state.set("viewMode", "video");
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

  const handleLanguageChange = (newLang: LanguageKey) => {
    setLanguage(newLang);
    if (!providerRef.current) return;
    
    const type = providerRef.current.doc.getText("monaco");
    const currentCode = type.toString().replace(/\r\n/g, "\n");
    
    let isBoilerplate = false;
    
    // Check if it's empty
    if (currentCode.trim() === "") {
      isBoilerplate = true;
    }
    
    // Check global templates
    if (!isBoilerplate && Object.values(languageTemplates).some(t => t.replace(/\r\n/g, "\n") === currentCode)) {
      isBoilerplate = true;
    }
    
    // Check question specific boilerplates
    if (!isBoilerplate && question?.boilerplate) {
      if (Object.values(question.boilerplate).some(t => typeof t === 'string' && t.replace(/\r\n/g, "\n") === currentCode)) {
        isBoilerplate = true;
      }
    }
    
    if (isBoilerplate) {
      const newBoilerplate = question?.boilerplate?.[newLang] || languageTemplates[newLang];
      type.delete(0, type.length);
      type.insert(0, newBoilerplate);
    }
  };


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

  const handlePushQuestion = (q: Question) => {
    setQuestion(q);
    socketRef.current?.emit("push-question", { roomId, question: q });
    setIsQuestionBankOpen(false);
  };

  const submitInterview = async () => {
    setIsSubmittingGrade(true);
    try {
      const candidateId = roomId.replace('live_', '');
      const stageId = searchParams.get('stageId') || "";
      
      const userId = localStorage.getItem("userId");
      
      const response = await fetch(`${API_BASE_URL}/db/users/${userId}/assessments/${candidateId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          score: `${totalScore}/40`, 
          timeTaken: `live_${new Date().toISOString()}`, 
          stageId,
          submissions: [
            { title: 'Notes', code: interviewerNotes },
            { title: 'Detailed Scores', code: JSON.stringify(interviewerScore, null, 2) }
          ] 
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to submit: ${response.statusText}`);
      }

      alert("Interview graded successfully!");
      window.close();
    } catch (err) {
      console.error(err);
      alert("Failed to submit grade");
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  return (
    <div className="relative h-screen w-full">
      <div className="flex h-full flex-col bg-[#0a0a0a] text-white overflow-hidden">
        {/* Top Navbar (Matching OA Style) */}
        <nav className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 bg-[#161616] px-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-[0.1em] text-emerald-500 uppercase">
              Live Interview
            </span>
            <span className="text-sm font-semibold text-gray-200">| Room: {roomId.replace('live_', '')}</span>
          </div>
          <div className="flex items-center gap-4">
            {role === 'interviewer' && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const newState = viewMode === 'coding' ? 'video' : 'coding';
                    setViewMode(newState);
                    providerRef.current?.doc.getMap('state').set('viewMode', newState);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${viewMode === 'coding' ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' : 'bg-[#262626] border border-gray-700 hover:bg-[#333333] text-gray-300'}`}
                >
                  {viewMode === 'coding' ? 'Hide Code Editor' : 'Show Code Editor'}
                </button>
                <button
                  onClick={() => {
                    const newState = viewMode === 'notepad' ? 'video' : 'notepad';
                    setViewMode(newState);
                    providerRef.current?.doc.getMap('state').set('viewMode', newState);
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition ${viewMode === 'notepad' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-[#262626] border border-gray-700 hover:bg-[#333333] text-gray-300'}`}
                >
                  {viewMode === 'notepad' ? 'Hide Notepad' : 'Show Notepad'}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#262626] px-3 py-1 rounded-md border border-gray-700">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>{connectedUsers} Online</span>
            </div>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LanguageKey)}
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

        <div className="flex-1 relative flex min-h-0 overflow-hidden">
          {/* Main Interview Area (Coding Layout) */}
          <div className={`absolute inset-0 flex transition-opacity duration-500 ${viewMode !== 'video' ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
            <div className="flex-1 p-2 min-h-0 overflow-hidden">
              <Group orientation="horizontal" className="flex">
              
              {/* Left Panel: Problem */}
              {viewMode === 'coding' && (
                <Panel defaultSize={45} minSize={25} className="flex flex-col rounded-xl border border-gray-800 bg-[#1e1e1e] overflow-hidden shadow-sm">
                  <div className="flex shrink-0 items-center bg-[#262626] px-4 py-2 border-b border-gray-800">
                    <span className="text-sm font-semibold text-gray-300">Description</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {!question ? (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">Waiting for interviewer to assign a problem...</div>
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
              )}

              {viewMode === 'coding' && (
                <Separator className="w-2 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition flex flex-col justify-center items-center group cursor-col-resize">
                  <div className="h-8 w-1 rounded-full bg-gray-800 group-hover:bg-emerald-500/50 transition"></div>
                </Separator>
              )}

              {/* Right Panel: Editor + Results */}
              <Panel defaultSize={viewMode === 'coding' ? 55 : 100} minSize={30} className="flex flex-col">
                <div className="flex-1 flex flex-col min-h-0">
                  <Group orientation="vertical" className="flex flex-col">
                    
                    {/* Top Half: Editor */}
                    <Panel defaultSize={viewMode === 'coding' ? 60 : 100} minSize={20} className="flex flex-col rounded-xl border border-gray-800 bg-[#1e1e1e] overflow-hidden shadow-sm">
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
                          onMount={handleEditorDidMount}
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

                  {viewMode === 'coding' && (
                    <Separator className="h-2 hover:bg-emerald-500/20 active:bg-emerald-500/30 transition flex justify-center items-center group cursor-row-resize">
                      <div className="w-8 h-1 rounded-full bg-gray-800 group-hover:bg-emerald-500/50 transition"></div>
                    </Separator>
                  )}

                  {/* Bottom Half: Test Results */}
                  {viewMode === 'coding' && (
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
                          Running shared code...
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
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-gray-400">
                                Passed <strong className="text-gray-200">{results.totalPassed}</strong> / {results.totalTests}
                              </span>
                              {selectedResult && (
                                <span className={selectedResult.passed ? "text-emerald-400" : "text-rose-400"}>
                                  {selectedResult.passed ? "Accepted" : "Rejected"} in {selectedResult.timeMs}ms
                                </span>
                              )}
                            </div>

                            {selectedTestCase?.isHidden ? (
                              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-gray-800 bg-[#161616] p-8 text-gray-400">
                                <Lock className="h-6 w-6" />
                                <span className="text-sm font-semibold">Hidden Test Case</span>
                                <p className="text-xs text-center max-w-xs text-gray-500">Input and Expected Output are hidden. Your code must handle edge cases automatically.</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-1.5">
                                  <div className="text-xs font-medium text-gray-400">Input</div>
                                  <pre className="rounded-lg border border-gray-800 bg-[#161616] p-3 text-xs text-gray-300 font-mono whitespace-pre-wrap">{selectedTestCase?.input || ""}</pre>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-xs font-medium text-gray-400">Expected Output</div>
                                  <pre className="rounded-lg border border-gray-800 bg-[#161616] p-3 text-xs text-gray-300 font-mono whitespace-pre-wrap">{selectedResult?.expected || ""}</pre>
                                </div>
                                <div className="space-y-1.5">
                                  <div className="text-xs font-medium text-gray-400">Your Output</div>
                                  <pre className={`rounded-lg border p-3 text-xs font-mono whitespace-pre-wrap ${
                                    selectedResult?.stderr 
                                      ? "border-rose-500/20 bg-rose-500/5 text-rose-400" 
                                      : "border-gray-800 bg-[#161616] text-gray-300"
                                  }`}>
                                    {selectedResult?.stderr || selectedResult?.stdout || ""}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-500">
                          Run your code to see results.
                        </div>
                      )}
                    </div>

                  </Panel>
                  )}
                </Group>
                </div>
                
                {/* Bottom Action Bar (Always Visible) */}
                <div className="flex shrink-0 items-center justify-end bg-[#1e1e1e] px-4 py-3 border border-gray-800 rounded-xl mt-2 gap-3 shadow-sm">
                  <button
                    onClick={handleRun}
                    disabled={isLoading}
                    className="flex items-center gap-2 rounded-md bg-[#262626] border border-gray-700 px-6 py-1.5 text-sm font-semibold text-gray-300 transition hover:bg-[#333333] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" fill="currentColor" />
                    {isLoading ? "Running" : "Run Code"}
                  </button>

                  {role === 'interviewer' && (
                    <>
                      <button
                        onClick={() => setIsQuestionBankOpen(true)}
                        className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
                      >
                        Question Bank
                      </button>
                      <button
                        onClick={() => setIsGradingModalOpen(true)}
                        className="flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
                      >
                        End Interview
                      </button>
                    </>
                  )}
                </div>
              </Panel>
            </Group>
            </div>
            <div className="w-[30%] min-w-[300px] shrink-0"></div>
          </div>

          {/* Right Side: Video Sidebar */}
          <div className={`absolute right-0 top-0 bottom-0 transition-all duration-500 z-20 bg-[#0a0a0a] ${viewMode !== 'video' ? 'w-[30%] min-w-[300px] border-l border-gray-800 shadow-2xl' : 'w-full'}`}>
            {videoToken && videoServerUrl ? (
              <VideoSidebar 
                token={videoToken} 
                serverUrl={videoServerUrl} 
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

      {/* Question Bank Modal */}
      {isQuestionBankOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Question Bank</h2>
              <button onClick={() => setIsQuestionBankOpen(false)} className="text-gray-400 hover:text-white">
                <ChevronDown className="w-6 h-6 rotate-90" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {globalQuestions.map((q) => (
                <div key={q.id} className="bg-[#262626] border border-gray-800 rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-emerald-400">{q.title}</h3>
                    <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300">{q.difficulty}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{q.description}</p>
                  <div className="flex justify-end">
                    <button
                      onClick={() => handlePushQuestion(q)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold transition"
                    >
                      Send to Candidate
                    </button>
                  </div>
                </div>
              ))}
              {globalQuestions.length === 0 && (
                <div className="text-gray-500 text-center py-10">No questions available.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {isGradingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1e1e1e] border border-gray-700 rounded-xl w-full max-w-md flex flex-col shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">End Interview & Grade</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Communication /10</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={interviewerScore.communication || ""}
                    onChange={(e) => setInterviewerScore({...interviewerScore, communication: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#262626] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Coding /10</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={interviewerScore.coding || ""}
                    onChange={(e) => setInterviewerScore({...interviewerScore, coding: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#262626] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Core Concepts /10</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={interviewerScore.core || ""}
                    onChange={(e) => setInterviewerScore({...interviewerScore, core: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#262626] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">System Design /10</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={interviewerScore.systemDesign || ""}
                    onChange={(e) => setInterviewerScore({...interviewerScore, systemDesign: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#262626] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="bg-[#262626] p-3 rounded-lg border border-gray-700 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-300">Total Score:</span>
                <span className="text-lg font-bold text-emerald-400">{totalScore} <span className="text-sm text-gray-500">/ 40</span></span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Interviewer Notes</label>
                <textarea
                  value={interviewerNotes}
                  onChange={(e) => setInterviewerNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-[#262626] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Enter qualitative feedback and notes..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsGradingModalOpen(false)}
                className="flex-1 bg-[#262626] hover:bg-[#333333] border border-gray-700 text-white px-4 py-2 rounded-lg font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={submitInterview}
                disabled={isSubmittingGrade}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold transition disabled:opacity-50"
              >
                {isSubmittingGrade ? "Submitting..." : "Submit & End"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
