"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, Map, Users, CheckCircle, ArrowLeft, Loader2, GitMerge } from "lucide-react";
import { useEffect, useState } from "react";

export default function JobDetailsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/apply/${jobId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const recruiterId = localStorage.getItem('userId');
        const res = await fetch(`http://localhost:3001/db/drives/${jobId}`, {
          headers: { 'x-user-id': recruiterId || '' }
        });
        const json = await res.json();
        if (json.success) setJob(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  if (!job) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Job not found</div>;
  }

  // Base navigation
  const navItems = [
    { name: "Dashboard", href: `/recruiter/drives/${jobId}`, icon: LayoutDashboard, exact: true },
    { name: "Pipeline", href: `/recruiter/drives/${jobId}/pipeline`, icon: GitMerge, exact: true },
  ];

  // Dynamic Stages
  const stageItems = (job.rounds || []).map((round: any) => ({
    name: round.name,
    href: `/recruiter/drives/${jobId}/stages/${round.id}`,
    icon: Map,
    exact: false
  }));

  // Final Selection
  const finalItems = [
    { name: "Final Selection", href: `/recruiter/drives/${jobId}/final`, icon: CheckCircle, exact: true }
  ];

  const allNavItems = [...navItems, ...stageItems, ...finalItems];

  const currentNav = allNavItems.find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href))?.name || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/recruiter/drives" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition font-medium text-sm">
            <ArrowLeft size={16} />
            Back to Drives
          </Link>
        </div>

        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-900 truncate" title={job.title}>{job.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span className="text-xs font-medium text-slate-500">{job.status}</span>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
          
          {/* General */}
          <div>
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Overview</div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Rounds */}
          <div>
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Rounds</div>
            <div className="space-y-1">
              {stageItems.length === 0 && <div className="px-3 text-xs text-slate-500">No rounds defined</div>}
              {stageItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Final */}
          <div>
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Completion</div>
            <div className="space-y-1">
              {finalItems.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col bg-slate-50">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-lg font-semibold text-slate-800">
            {currentNav}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleCopyLink}
              className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors border border-blue-200"
            >
              {copied ? "Copied!" : "Share Apply Link"}
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
              R
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
