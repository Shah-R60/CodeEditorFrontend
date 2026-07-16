"use client";

import { Plus, Search, Filter, MoreVertical, Briefcase, Users, CheckCircle2, Clock, ChevronRight, LayoutGrid, Copy, Layers, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HiringDrivesPage() {
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const recruiterId = localStorage.getItem('userId');
        const res = await fetch('http://localhost:3001/db/drives', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-user-id': recruiterId || ''
          }
        });
        const json = await res.json();
        if (json.success) {
          setDrives(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch drives', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Hiring Drives</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-lg">Manage your recruitment pipelines, track candidate progress, and configure multi-round assessment drives.</p>
        </div>
        <Link 
          href="/recruiter/drives/new"
          className="inline-flex items-center justify-center gap-2 bg-amber-500 text-white font-medium py-2.5 px-5 rounded-xl hover:bg-amber-600 transition-all shadow-md hover:shadow-lg hover:shadow-amber-500/20 focus:ring-4 focus:ring-amber-500/20 active:scale-[0.98]"
        >
          <Plus size={18} />
          Create Hiring Drive
        </Link>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-slate-500 font-medium">Loading your hiring drives...</div>
          </div>
        ) : drives.length === 0 ? (
          <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-slate-200 border-dashed">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 mb-4 text-slate-400">
              <Briefcase size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No hiring drives yet</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto mb-6">Create your first hiring drive to start building your assessment pipeline and invite candidates.</p>
            <Link 
              href="/recruiter/drives/new"
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-medium py-2.5 px-5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Create Drive
            </Link>
          </div>
        ) : drives.map((drive) => (
          <Link href={`/recruiter/drives/${drive.id}`} key={drive.id} className="group block bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 overflow-hidden">
            <div className="p-6 flex flex-col lg:flex-row gap-8">
              
              {/* Left Side: Info & Metrics */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors truncate">
                        {drive.title}
                      </h2>
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${
                        drive.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 
                        drive.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200/60' : 
                        'bg-slate-50 text-slate-600 border-slate-200/60'
                      }`}>
                        {drive.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {drive.status}
                      </span>
                    </div>
                    <button 
                      className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(`${window.location.origin}/apply/${drive.id}`);
                      }}
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300 mb-6">
                    {drive.department && <span className="font-medium">{drive.department}</span>}
                    <span>Created {drive.date}</span>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dashed border-slate-200 dark:border-white/10">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Users size={14}/> Candidates</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{drive.candidates}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Layers size={14}/> Rounds</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{drive.rounds?.length || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"><TrendingUp size={14}/> Pass Rate</span>
                    <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{drive.passRate}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Assessment Pipeline */}
              <div className="w-full lg:w-[320px] shrink-0 border-t lg:border-t-0 lg:border-l border-dashed border-slate-200 dark:border-white/10 pt-6 lg:pt-0 lg:pl-8 flex flex-col">
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5">Assessment Pipeline</h4>
                <div className="relative flex-1">
                  {drive.rounds && drive.rounds.length > 0 ? (
                    <>
                      {drive.rounds.slice(0, 3).map((round: any, i: number) => (
                        <div key={round.id || i} className="flex gap-4 mb-4 relative group/step">
                          {/* Vertical Connector */}
                          {i !== Math.min(drive.rounds.length - 1, 2) && (
                            <div className="absolute left-[15px] top-[28px] bottom-[-20px] w-[2px] bg-slate-200 dark:bg-[#1e293b]"></div>
                          )}
                          <div className="w-8 h-8 shrink-0 rounded-full bg-emerald-400 border border-transparent flex items-center justify-center text-white dark:text-slate-900 font-bold text-xs z-10 shadow-sm transition-colors group-hover/step:bg-emerald-500">
                            {i + 1}
                          </div>
                          <div className="pt-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{round.name}</p>
                            <p className="text-[13px] text-slate-500 truncate">{round.type}</p>
                          </div>
                        </div>
                      ))}
                      {drive.rounds.length > 3 && (
                        <div className="flex gap-4 relative mt-2">
                          <div className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-[#334155] flex items-center justify-center text-slate-500 font-bold text-xs z-10">
                            +{drive.rounds.length - 3}
                          </div>
                          <div className="flex items-center">
                            <p className="text-xs text-slate-500 font-medium">More rounds</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-slate-500 italic mt-2">No rounds configured.</div>
                  )}
                </div>
                
                {/* Arrow */}
                <div className="flex justify-end mt-4">
                  <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors group-hover:translate-x-1 duration-200" />
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
