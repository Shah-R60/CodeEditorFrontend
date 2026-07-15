"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Loader2 } from "lucide-react";
import Link from "next/link";

export default function QuestionsLibrary() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://localhost:3001/db/questions");
        const json = await res.json();
        if (json.success) {
          setQuestions(json.data);
        } else {
          setError(json.error || "Failed to fetch questions");
        }
      } catch (err) {
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Question Bank</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your repository of coding questions.</p>
        </div>
        <Link 
          href="/recruiter/questions/new" 
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Question
        </Link>
      </div>

      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col transition-colors">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 dark:focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 transition-colors shadow-sm text-sm whitespace-nowrap">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-emerald-600">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64 text-rose-500 font-medium">
              {error}
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <p>No questions found.</p>
              <Link href="/recruiter/questions/new" className="text-emerald-600 hover:underline mt-2 text-sm font-medium">
                Create one now
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">Title</th>
                  <th className="px-6 py-4 font-semibold">Difficulty</th>
                  <th className="px-6 py-4 font-semibold">Tags</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10 bg-white dark:bg-transparent">
                {filteredQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{q.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        q.difficulty === 'EASY' ? 'bg-emerald-100/50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 
                        q.difficulty === 'MEDIUM' ? 'bg-amber-100/50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' : 
                        'bg-rose-100/50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                      }`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {(q.boilerplate?.tags || []).map((tag: string) => (
                          <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded text-xs font-medium border border-slate-200 dark:border-transparent">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/recruiter/questions/${q.id}`} className="inline-flex p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Edit size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination mock */}
        {!loading && !error && filteredQuestions.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5">
            <span>Showing {filteredQuestions.length} results</span>
            <div className="flex gap-1">
              <button className="px-3 py-1 border border-slate-200 dark:border-white/10 rounded bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50" disabled>Prev</button>
              <button className="px-3 py-1 border border-slate-200 dark:border-white/10 rounded bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-white/10 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
