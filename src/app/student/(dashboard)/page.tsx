"use client";

import Link from "next/link";
import { Clock, CheckCircle2, ChevronRight, PlayCircle, Laptop, Trophy, Code } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back!</h1>
        <p className="text-slate-500 mt-2 text-lg">Ready to showcase your coding skills?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Practice/Sandbox Card */}
        <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white shadow-lg shadow-emerald-500/20 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Laptop className="text-emerald-100" /> Practice Sandbox
            </h2>
            <p className="text-emerald-50 max-w-xl">
              Hone your algorithmic skills in our zero-distraction IDE. Practice data structures, dynamic programming, and logic puzzles at your own pace before taking an assessment.
            </p>
          </div>
          <Link href="/editor" className="whitespace-nowrap px-6 py-3 bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            Open CodeEditor <Code size={18} />
          </Link>
        </div>

        {/* Active Assessments */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Clock className="text-blue-500" /> Active Assessments
            </h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 hover:bg-slate-50 transition cursor-pointer group">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition">Frontend Engineer Assessment</h3>
                  <p className="text-slate-500 text-sm mt-1">TechCorp Inc.</p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Due in 3 days</span>
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Clock size={16} /> 60 mins</span>
                <span className="flex items-center gap-1"><Code size={16} /> 2 Coding Tasks</span>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="flex items-center gap-2 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  Start Assessment <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Empty State Mock */}
            <div className="p-8 text-center text-slate-500 bg-slate-50/50">
              No more active assessments at this time.
            </div>
          </div>
        </div>

        {/* Stats / Past Assessments */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
             <Trophy className="text-yellow-500" /> Your Stats
          </h2>
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="text-3xl font-extrabold text-emerald-600">3</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Completed</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl text-center">
              <div className="text-3xl font-extrabold text-blue-600">89%</div>
              <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Avg Score</div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-8">
            <CheckCircle2 className="text-emerald-500" /> Completed
          </h2>
          
          <div className="space-y-3">
             {/* Mock Completed Item */}
             <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-slate-300 transition cursor-default">
               <div>
                 <div className="font-semibold text-slate-900 text-sm">Backend Developer Assessment</div>
                 <div className="text-xs text-slate-500">StartupX</div>
               </div>
               <div className="text-right">
                 <div className="font-bold text-emerald-600">Passed</div>
                 <div className="text-xs text-slate-400">Oct 12, 2026</div>
               </div>
             </div>
             
             <div className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-slate-300 transition cursor-default">
               <div>
                 <div className="font-semibold text-slate-900 text-sm">Fullstack Interview</div>
                 <div className="text-xs text-slate-500">GlobalNet</div>
               </div>
               <div className="text-right">
                 <div className="font-bold text-emerald-600">92/100</div>
                 <div className="text-xs text-slate-400">Sep 28, 2026</div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
