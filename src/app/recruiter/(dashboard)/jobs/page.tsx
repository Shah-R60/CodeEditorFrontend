"use client";

import { Plus, Search, Filter, MoreVertical, Briefcase, Users, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const recruiterId = localStorage.getItem('userId');
        const res = await fetch('http://localhost:3001/db/jobs', {
          headers: {
            'x-user-id': recruiterId || ''
          }
        });
        const json = await res.json();
        if (json.success) {
          setJobs(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hiring Plans</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your active jobs and assessment pipelines.</p>
        </div>
        <Link 
          href="/recruiter/jobs/new"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm focus:ring-4 focus:ring-blue-600/20"
        >
          <Plus size={18} />
          Create Hiring Plan
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
              placeholder="Search jobs by title or ID..."
              className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
            />
          </div>
          <button className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm whitespace-nowrap">
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading jobs...</div>
          ) : jobs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No hiring plans found. Create one to get started!</div>
          ) : jobs.map((job) => (
            <div key={job.id} className="p-6 hover:bg-slate-50/80 transition-colors group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Job Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/recruiter/jobs/${job.id}`} className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {job.title}
                    </Link>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      job.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      job.status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {job.status === 'Active' && <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></span>}
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Briefcase size={14} className="text-slate-400" />
                      {job.department}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200 shadow-sm">{job.id}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" />
                      Created {job.date}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-8 px-5 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-slate-900">{job.candidates}</span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                      <Users size={12} /> Candidates
                    </span>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-slate-900">{job.passRate}</span>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                      <CheckCircle2 size={12} /> Pass Rate
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 mt-4 md:mt-0">
                  <Link 
                    href={`/recruiter/jobs/${job.id}`}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                  >
                    View Plan
                  </Link>
                  <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination mock */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Showing 1 to 4 of 12 jobs</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 shadow-sm disabled:opacity-50" disabled>Prev</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 shadow-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
