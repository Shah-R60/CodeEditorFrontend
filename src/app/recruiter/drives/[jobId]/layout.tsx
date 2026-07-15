"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { LayoutDashboard, Map, Users, CheckCircle, ArrowLeft, Loader2, GitMerge, Search, Filter, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import ThemeToggle from "@/components/common/ThemeToggle";

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
    { name: "Qualified Candidates", href: `/recruiter/drives/${jobId}/final`, icon: CheckCircle, exact: true }
  ];

  const allNavItems = [...navItems, ...stageItems, ...finalItems];

  const currentNav = allNavItems.find(item => item.exact ? pathname === item.href : pathname.startsWith(item.href))?.name || "Dashboard";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex font-sans text-slate-900 dark:text-white selection:bg-amber-100 dark:selection:bg-amber-900/30">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-white/10 flex flex-col fixed inset-y-0 z-10 transition-colors">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-white/10">
          <Link href="/recruiter/drives" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition font-medium text-sm">
            <ArrowLeft size={16} />
            Back to Drives
          </Link>
        </div>

        <div className="px-6 py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 transition-colors">
          <h2 className="font-bold text-slate-900 dark:text-white truncate" title={job.title}>{job.title}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{job.status}</span>
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
                      isActive 
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-amber-600 dark:text-amber-500" : "text-slate-400 dark:text-slate-500"} />
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
              {stageItems.map((item: any) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                      isActive 
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-amber-600 dark:text-amber-500" : "text-slate-400 dark:text-slate-500"} />
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
                      isActive 
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-amber-600 dark:text-amber-500" : "text-slate-400 dark:text-slate-500"} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col transition-colors">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors gap-6">
          
          {/* Left Spacer for Centering / Page Title */}
          <div className="flex-1 hidden md:block">
            <div className="text-lg font-semibold text-slate-800 dark:text-white">
              {currentNav}
            </div>
          </div>

          {/* Central Search Bar */}
          <div className="w-full max-w-md hidden sm:flex items-center bg-slate-50 dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-white/10 transition-colors">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search candidates by name, email..."
                className="block w-full pl-11 pr-4 py-2 bg-transparent border-none rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-1 pr-2 shrink-0">
              <button className="inline-flex items-center gap-2 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 font-medium py-1 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-colors text-xs border border-slate-200 dark:border-transparent shadow-sm">
                <Filter size={14} />
                Filters
              </button>
              <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1"></div>
              <button className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-white/10">
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex-1 flex items-center justify-end gap-4 shrink-0">
            <button 
              onClick={handleCopyLink}
              className="text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200 dark:text-amber-500 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:border-amber-500/20 px-4 py-2 rounded-lg transition-colors border"
            >
              {copied ? "Copied!" : "Share Apply Link"}
            </button>
            <ThemeToggle />
            <NotificationDropdown />
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-500 font-bold border border-amber-200 dark:border-amber-500/30">
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
