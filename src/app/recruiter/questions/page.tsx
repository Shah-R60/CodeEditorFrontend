"use client";

import { Plus, Search, Filter, MoreVertical } from "lucide-react";
import Link from "next/link";

export default function QuestionsLibrary() {
  const questions = [
    { id: 1, title: "Two Sum", difficulty: "EASY", tags: ["Arrays", "Hash Table"], usages: 145 },
    { id: 2, title: "Reverse Linked List", difficulty: "EASY", tags: ["Linked List", "Recursion"], usages: 89 },
    { id: 3, title: "Merge K Sorted Lists", difficulty: "HARD", tags: ["Linked List", "Heap"], usages: 34 },
    { id: 4, title: "Longest Palindromic Substring", difficulty: "MEDIUM", tags: ["String", "Dynamic Programming"], usages: 112 },
    { id: 5, title: "LRU Cache", difficulty: "MEDIUM", tags: ["Design", "Hash Table", "Linked List"], usages: 76 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Question Library</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your repository of coding questions.</p>
        </div>
        <Link 
          href="/recruiter/questions/new" 
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Question
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search questions..."
              className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all shadow-sm"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm whitespace-nowrap">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Difficulty</th>
                <th className="px-6 py-4 font-semibold">Tags</th>
                <th className="px-6 py-4 font-semibold">Usages</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{q.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      q.difficulty === 'EASY' ? 'bg-emerald-100/50 text-emerald-700' : 
                      q.difficulty === 'MEDIUM' ? 'bg-amber-100/50 text-amber-700' : 
                      'bg-rose-100/50 text-rose-700'
                    }`}>
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {q.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{q.usages}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Showing 1 to 5 of 42 results</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
