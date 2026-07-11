"use client";

import { Plus, Search, Filter, MoreVertical, Briefcase, Users, CheckCircle2, Clock, ChevronRight, LayoutGrid } from "lucide-react";
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Hiring Drives</h1>
          <p className="text-slate-500 mt-2 text-sm max-w-lg">Manage your recruitment pipelines, track candidate progress, and configure multi-round assessment drives.</p>
        </div>
        <Link 
          href="/recruiter/drives/new"
          className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-medium py-2.5 px-5 rounded-xl hover:bg-slate-800 transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-slate-900/20 active:scale-[0.98]"
        >
          <Plus size={18} />
          Create Hiring Drive
        </Link>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search drives by title, role, or ID..."
            className="block w-full pl-11 pr-4 py-2.5 bg-transparent border-none rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
          />
        </div>
        <div className="flex items-center gap-2 pr-2">
          <button className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 font-medium py-2 px-4 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm">
            <Filter size={16} />
            Filters
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50">
            <LayoutGrid size={18} />
          </button>
        </div>
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
          <Link href={`/recruiter/drives/${drive.id}`} key={drive.id} className="group block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 overflow-hidden">
            <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
              
              {/* Drive Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
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
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Briefcase size={16} className="text-slate-400" />
                    {drive.department}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-400" />
                    Created {drive.date}
                  </span>
                  <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    ID: {drive.id.split('-')[0]}...
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-6 md:gap-10">
                <div className="flex flex-col items-start md:items-center">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{drive.candidates}</span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mt-1">
                    <Users size={14} className="text-slate-400" /> Candidates
                  </span>
                </div>
                <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
                <div className="flex flex-col items-start md:items-center">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">{drive.passRate}</span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mt-1">
                    <CheckCircle2 size={14} className="text-slate-400" /> Pass Rate
                  </span>
                </div>
                
                <div className="pl-4 md:pl-6 text-slate-300 group-hover:text-blue-500 transition-colors group-hover:translate-x-1 duration-200">
                  <ChevronRight size={24} />
                </div>
              </div>

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
