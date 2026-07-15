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
          className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium py-2.5 px-5 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-slate-900/20 active:scale-[0.98]"
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
            <div className="p-6">
              
              {/* Drive Info Top */}
              <div className="flex justify-between items-start mb-5">
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
              
              {/* Department, Date, ID Stack */}
              <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300 mb-6">
                {drive.department && <span className="font-medium">{drive.department}</span>}
                <span>Created {new Date(drive.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-slate-200 dark:border-white/10 mb-6"></div>

              {/* Metadata List */}
              <div className="flex flex-col gap-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Users size={16} className="text-indigo-400" />
                  <span className="font-medium">{drive.candidates}</span> Candidates
                </div>
                <div className="flex items-center gap-3">
                  <Layers size={16} className="text-slate-400" />
                  <span className="font-medium">{drive.rounds?.length || 4}</span> Rounds
                </div>
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-rose-400" />
                  <span className="font-medium">2</span> Assessments
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp size={16} className="text-sky-400" />
                  <span className="font-medium">{drive.passRate}</span> Pass
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-end mt-2">
                <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-amber-500 transition-colors group-hover:translate-x-1 duration-200" />
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
