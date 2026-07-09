"use client";

import { Search, Filter, MoreVertical, Eye, Download } from "lucide-react";

export default function CandidatesList() {
  const candidates = [
    { id: 1, name: "Sarah Jenkins", email: "sarah.j@example.com", assessment: "Frontend Engineer", score: "95/100", time: "45 mins", status: "Passed", date: "Oct 24, 2026" },
    { id: 2, name: "Michael Chen", email: "m.chen@example.com", assessment: "Backend Developer", score: "82/100", time: "55 mins", status: "Passed", date: "Oct 24, 2026" },
    { id: 3, name: "Alex Rodriguez", email: "alex.r@example.com", assessment: "Data Structures", score: "45/100", time: "60 mins", status: "Failed", date: "Oct 23, 2026" },
    { id: 4, name: "Emily Watson", email: "emily.watson@example.com", assessment: "Frontend Engineer", score: "91/100", time: "42 mins", status: "Passed", date: "Oct 23, 2026" },
    { id: 5, name: "David Kim", email: "dkim99@example.com", assessment: "Fullstack Engineer", score: "Pending", time: "-", status: "In Progress", date: "Oct 24, 2026" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-slate-500 mt-1 text-sm">Review assessment results and candidate performance.</p>
        </div>
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
              placeholder="Search candidates by name or email..."
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
                <th className="px-6 py-4 font-semibold">Candidate</th>
                <th className="px-6 py-4 font-semibold">Assessment</th>
                <th className="px-6 py-4 font-semibold">Score</th>
                <th className="px-6 py-4 font-semibold">Time Taken</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {candidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{c.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-700">{c.assessment}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        c.status === 'Passed' ? 'bg-emerald-100/50 text-emerald-700' : 
                        c.status === 'Failed' ? 'bg-rose-100/50 text-rose-700' : 
                        'bg-blue-100/50 text-blue-700'
                      }`}>
                        {c.status}
                      </span>
                      <span className="font-bold text-slate-900">{c.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{c.time}</td>
                  <td className="px-6 py-4 text-slate-500">{c.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="View Report">
                        <Eye size={18} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Download Code">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Showing 1 to 5 of 128 results</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded bg-white hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
