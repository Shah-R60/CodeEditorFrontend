"use client";

import Link from "next/link";
import { Clock, CheckCircle2, ChevronRight, PlayCircle, Laptop, Trophy, Code, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentDashboard() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [completedAssessments, setCompletedAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`http://localhost:3001/db/users/${userId}/assessments`);
        const json = await res.json();
        
        if (json.success) {
          // Filter out active and completed assessments
          const sortedData = [...json.data].reverse(); // Latest to oldest
          const active = sortedData.filter((c: any) => c.status !== 'Passed' && c.status !== 'Rejected' && c.hiringDrive?.status === 'Active');
          const completed = sortedData.filter((c: any) => c.status === 'Passed' || c.status === 'Rejected');
          setAssessments(active.slice(0, 3));
          setCompletedAssessments(completed.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to fetch assessments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  return (
    <div className="max-w-7xl w-full mx-auto px-4 md:px-12 py-10 space-y-10">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome back!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Ready to showcase your coding skills?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Practice/Sandbox Card */}
        <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg shadow-amber-500/20 dark:shadow-none flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Laptop className="text-amber-100" /> Practice Sandbox
            </h2>
            <p className="text-amber-50 max-w-xl">
              Hone your algorithmic skills in our zero-distraction IDE. Practice data structures, dynamic programming, and logic puzzles at your own pace before taking an assessment.
            </p>
          </div>
          <Link href="/editor" className="whitespace-nowrap px-6 py-3 bg-white dark:bg-[#0f172a] text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-[#0f172a]/90 font-bold rounded-xl shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            Open CodeEditor <Code size={18} />
          </Link>
        </div>

        {/* Active Assessments */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="text-amber-500" /> Active Assessments
            </h2>
          </div>

          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm overflow-hidden transition-colors">
            {loading ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-amber-500 mb-2" size={24} />
                <p>Loading your active assessments...</p>
              </div>
            ) : assessments.length > 0 ? (
              assessments.map((assessment) => {
                const drive = assessment.hiringDrive;
                const totalRounds = drive?.rounds?.length || 0;
                // Calculate roughly an hour per round if no duration specified
                const duration = drive?.rounds?.reduce((acc: number, round: any) => {
                  return acc + (round.duration ? parseInt(round.duration) : 60);
                }, 0) || 60;

                const firstRound = drive?.rounds?.[0];
                const startDate = firstRound?.startDate ? new Date(firstRound.startDate) : null;
                const now = new Date();

                let actionElement;

                if (!startDate) {
                  actionElement = (
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed">
                      Upcoming Assessment <Clock size={16} />
                    </span>
                  );
                } else if (startDate > now) {
                  const formattedTime = startDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                  actionElement = (
                    <span className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed">
                      Starts: {formattedTime} <Clock size={16} />
                    </span>
                  );
                } else {
                  actionElement = (
                    <Link href="/editor" className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                      Start Assessment <ChevronRight size={16} />
                    </Link>
                  );
                }

                return (
                  <div key={assessment.id} onClick={() => router.push(`/student/drives/${drive?.id}`)} className="p-6 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition cursor-pointer group">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">{drive?.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{drive?.department}</p>
                      </div>
                      <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full">Active</span>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={16} /> {duration} mins</span>
                      <span className="flex items-center gap-1"><Code size={16} /> {totalRounds} Tasks</span>
                      <span className="flex items-center gap-1 ml-auto font-medium text-slate-700 dark:text-slate-300">Status: {assessment.status}</span>
                    </div>
                    <div className="mt-6 flex justify-end">
                      {actionElement}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5">
                No active assessments at this time.
              </div>
            )}
          </div>
        </div>

        {/* Stats / Past Assessments */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <Trophy className="text-yellow-500" /> Your Stats
          </h2>
          
          {(() => {
            const completedCount = completedAssessments.length;
            const avgScore = completedCount > 0 
              ? Math.round(completedAssessments.reduce((acc, curr) => {
                  const match = curr.score?.match(/\d+/);
                  return acc + (match ? parseInt(match[0]) : 0);
                }, 0) / completedCount)
              : 0;

            return (
              <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm p-6 grid grid-cols-2 gap-4 transition-colors">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center">
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Completed</div>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl text-center">
                  <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{avgScore}%</div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">Avg Score</div>
                </div>
              </div>
            );
          })()}

          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-8">
            <CheckCircle2 className="text-emerald-500" /> Completed
          </h2>
          
          <div className="space-y-3">
             {completedAssessments.length > 0 ? (
               completedAssessments.map(assessment => {
                 const drive = assessment.hiringDrive;
                 return (
                   <div key={assessment.id} className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex justify-between items-center hover:border-slate-300 dark:hover:border-white/20 transition cursor-default">
                     <div>
                       <div className="font-semibold text-slate-900 dark:text-white text-sm">{drive?.title}</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400">{drive?.department}</div>
                     </div>
                     <div className="text-right">
                       <div className={`font-bold ${assessment.status === 'Passed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{assessment.score || assessment.status}</div>
                       <div className="text-xs text-slate-400 dark:text-slate-500">{new Date(assessment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                     </div>
                   </div>
                 );
               })
             ) : (
               <div className="p-6 text-center text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 border-dashed">
                 No completed assessments yet.
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
