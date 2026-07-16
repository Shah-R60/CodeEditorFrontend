"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Users, Briefcase } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchResults {
  drives: any[];
  candidates: any[];
}

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults(null);
        setIsOpen(false);
        return;
      }

      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");

      if (!userId || userRole !== "RECRUITER") return;

      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await fetch(`http://localhost:3001/db/search?q=${encodeURIComponent(query)}&userId=${userId}&role=${userRole}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setResults({ drives: data.drives || [], candidates: data.candidates || [] });
          }
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (href: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(href);
  };

  const hasResults = results && (results.drives.length > 0 || results.candidates.length > 0);

  return (
    <div className="relative w-full max-w-md hidden sm:flex items-center gap-3 z-50" ref={searchRef}>
      <div className="flex-1 flex items-center bg-slate-50 dark:bg-[#0f172a] rounded-full border border-slate-200 dark:border-white/10 transition-colors pl-2 pr-1 py-1 relative">
        <div className="relative w-full flex items-center">
          <input
            type="text"
            placeholder="Search candidates or drives..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            className="block w-full pl-3 pr-4 py-1.5 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0"
          />
          <button className="flex items-center justify-center w-8 h-8 bg-amber-500 text-white rounded-full shrink-0 hover:bg-amber-600 transition-colors">
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} strokeWidth={2.5} />}
          </button>
        </div>

        {isOpen && query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#161722] rounded-xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[400px]">
            {isLoading && !results ? (
              <div className="p-8 flex justify-center items-center text-slate-400">
                <Loader2 size={24} className="animate-spin text-amber-500" />
              </div>
            ) : !hasResults && !isLoading ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              <div className="overflow-y-auto overflow-x-hidden p-2">
                
                {/* Drives Section */}
                {results?.drives && results.drives.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Hiring Drives
                    </div>
                    {results.drives.map(drive => (
                      <div 
                        key={drive.id}
                        onClick={() => handleResultClick(`/recruiter/drives/${drive.id}`)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Briefcase size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{drive.title}</p>
                          <p className="text-xs text-slate-500 truncate">{drive.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Candidates Section */}
                {results?.candidates && results.candidates.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Candidates
                    </div>
                    {results.candidates.map(candidate => (
                      <div 
                        key={candidate.id}
                        onClick={() => handleResultClick(`/recruiter/drives/${candidate.hiringDrive.id}/candidates/${candidate.id}`)}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                          <Users size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{candidate.name}</p>
                          <p className="text-xs text-slate-500 truncate">{candidate.email} • {candidate.hiringDrive.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
