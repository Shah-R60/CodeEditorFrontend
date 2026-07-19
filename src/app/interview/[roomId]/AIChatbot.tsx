"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, X, Bot, User, Loader2, Copy, Check, Code, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface AIChatbotProps {
  language: string;
  editorCode: string;
  question: any;
  testResults: any;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ContextMode = "all" | "code" | "none";

export default function AIChatbot({
  language,
  editorCode,
  question,
  testResults,
  onClose,
}: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const [contextMode, setContextMode] = useState<ContextMode>("code");
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessageContent = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Add user message to UI immediately
    setMessages((prev) => [...prev, { role: "user", content: userMessageContent }]);
    setIsLoading(true);

    // Build the context invisibly
    let contextStr = "";
    if (contextMode === "code") {
      if (editorCode) {
        contextStr += `\n\n\`\`\`${language}\n${editorCode}\n\`\`\`\n`;
      }
    } else if (contextMode === "all") {
      contextStr += `\n\n--- CONTEXT ---\n`;
      if (language) contextStr += `Language: ${language}\n`;
      if (editorCode) {
        contextStr += `Current Code in Editor:\n\`\`\`${language}\n${editorCode}\n\`\`\`\n`;
      }
    }
    
    if (contextMode === "all") {
      if (question) {
        contextStr += `Question Title: ${question.title || ""}\n`;
        contextStr += `Problem Description: ${question.description || ""}\n`;
      }
      if (testResults && testResults.results) {
        contextStr += `Recent Test Results:\n${JSON.stringify(testResults.results.slice(0, 3), null, 2)}\n`;
      }
    }

    // Combine user prompt with invisible context
    const fullPrompt = `${userMessageContent}${contextStr}`;

    // Add an empty assistant message to hold the incoming stream
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const payloadMessages = messages.map(m => ({ role: m.role, content: m.content }));
      // Append the new message with context
      payloadMessages.push({ role: "user", content: fullPrompt });

      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payloadMessages }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to AI server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        
        // Parse SSE chunks
        const lines = chunkValue.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                setMessages((prev) => {
                  const newMsgs = [...prev];
                  const lastIndex = newMsgs.length - 1;
                  newMsgs[lastIndex] = {
                    ...newMsgs[lastIndex],
                    content: newMsgs[lastIndex].content + parsed.text
                  };
                  return newMsgs;
                });
              } else if (parsed.error) {
                console.error("AI Error:", parsed.error);
              }
            } catch (e) {
              // Ignore incomplete JSON chunks
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const newMsgs = [...prev];
        const last = newMsgs[newMsgs.length - 1];
        last.content = "⚠️ *Failed to generate response. Please try again later.*";
        return newMsgs;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] border-l border-gray-800 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#262626] border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
          <Bot size={20} />
          <span>AI Assistant</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[#0f0f0f]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-500">
            <Bot size={48} className="text-emerald-500/20" />
            <p className="max-w-[200px] text-sm">Ask me anything! I am aware of your current code and the problem description.</p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-purple-600" : "bg-emerald-600"}`}>
              {msg.role === "user" ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            
            <div className={`max-w-[85%] text-sm rounded-3xl px-4 py-3 ${
              msg.role === "user" 
                ? "bg-purple-600/20 text-purple-100 rounded-tr-xl" 
                : "bg-[#262626] text-gray-200 rounded-tl-xl shadow-sm"
            }`}>
              {msg.role === "user" ? (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeContent = String(children).replace(/\n$/, "");
                      
                      if (!inline && match) {
                        return (
                          <div className="my-3 rounded-2xl overflow-hidden border border-gray-700 bg-[#1e1e1e]">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-[#2a2a2a] border-b border-gray-700">
                              <span className="text-xs text-gray-400 uppercase font-semibold">{match[1]}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopy(codeContent)}
                                  className="text-gray-400 hover:text-white transition-colors p-1"
                                  title="Copy code"
                                >
                                  {copiedCode === codeContent ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                </button>
                              </div>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ margin: 0, background: "transparent", fontSize: "0.85rem" }}
                              {...props}
                            >
                              {codeContent}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      return (
                        <code className="bg-black/30 text-emerald-300 px-1.5 py-0.5 rounded text-[0.85em]" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#1e1e1e] border-t border-gray-800 shrink-0">
        <div className="relative flex items-end gap-2 bg-[#0f0f0f] rounded-2xl border border-gray-700 p-1 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
          <div className="relative shrink-0 mb-0.5 ml-0.5">
            <button
              onClick={() => setIsContextDropdownOpen(!isContextDropdownOpen)}
              className="p-2.5 rounded-xl bg-[#262626] text-gray-400 hover:text-white hover:bg-[#333333] transition-colors flex items-center justify-center"
              title="Select Context"
            >
              <Plus size={18} />
            </button>
            
            {isContextDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-[#1e1e1e] border border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="px-3 py-2 text-[10px] font-semibold text-gray-400 border-b border-gray-800 uppercase tracking-wider bg-[#262626]">
                  Context Level
                </div>
                <button
                  onClick={() => { setContextMode("all"); setIsContextDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 text-xs flex justify-between items-center hover:bg-[#2a2a2a] transition-colors ${contextMode === "all" ? "text-emerald-400 font-medium" : "text-gray-300"}`}
                >
                  Everything
                  {contextMode === "all" && <Check size={14} />}
                </button>
                <button
                  onClick={() => { setContextMode("code"); setIsContextDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 text-xs flex justify-between items-center hover:bg-[#2a2a2a] transition-colors ${contextMode === "code" ? "text-emerald-400 font-medium" : "text-gray-300"}`}
                >
                  Code Editor Only
                  {contextMode === "code" && <Check size={14} />}
                </button>
                <button
                  onClick={() => { setContextMode("none"); setIsContextDropdownOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 text-xs flex justify-between items-center hover:bg-[#2a2a2a] transition-colors ${contextMode === "none" ? "text-emerald-400 font-medium" : "text-gray-300"}`}
                >
                  No Context
                  {contextMode === "none" && <Check size={14} />}
                </button>
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI anything..."
            className="flex-1 max-h-[150px] min-h-[40px] bg-transparent text-sm text-white resize-none outline-none py-2.5 px-3 custom-scrollbar"
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 p-2.5 mb-0.5 mr-0.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-500">
            {contextMode === "all" ? "AI has full context of code & problem. Shift+Enter for new line." : 
             contextMode === "code" ? "AI only has context of your code. Shift+Enter for new line." : 
             "AI has no context. Shift+Enter for new line."}
          </span>
        </div>
      </div>
    </div>
  );
}
