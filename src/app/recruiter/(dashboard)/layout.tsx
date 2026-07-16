"use client";

import { useState } from "react";
import Image from "next/image";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Library, Users, Settings, LogOut, Briefcase, Search, Filter, LayoutGrid, ChevronLeft, Code2, FileCode2 } from "lucide-react";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
    { name: "Hiring Drives", href: "/recruiter/drives", icon: Briefcase },
    { name: "Question Bank", href: "/recruiter/questions", icon: Library },
    { name: "Create Question", href: "/recruiter/questions/new", icon: FileCode2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex font-sans text-slate-900 dark:text-white selection:bg-amber-100 dark:selection:bg-amber-900/30">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-transparent flex flex-col fixed inset-y-0 z-20 transition-all duration-300 ${isCollapsed ? "w-20" : "w-60"}`}>
        
        {/* Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors z-50 hidden sm:flex shadow-sm"
        >
          <ChevronLeft size={14} strokeWidth={3} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>

        <div className={`h-16 flex items-center border-b border-slate-200 dark:border-white/10 ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
          <Link href="/recruiter" className="flex items-center hover:opacity-90 transition">
            {isCollapsed ? (
              <Code2 size={28} className="text-amber-600 dark:text-amber-500" />
            ) : (
              <Image 
                src="/logo.png" 
                alt="CodeCanvas Logo" 
                width={160} 
                height={40} 
                className="object-contain"
                priority
              />
            )}
          </Link>
        </div>

        <nav className={`flex-1 py-8 space-y-1.5 overflow-y-auto overflow-x-hidden ${isCollapsed ? "px-2" : "px-4"}`}>
          {navItems.map((item) => {
            let isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/recruiter");
            
            // Prevent "Question Bank" from highlighting when on "Create Question"
            if (item.href === "/recruiter/questions" && pathname.startsWith("/recruiter/questions/new")) {
              isActive = false;
            }
            
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`flex items-center py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isCollapsed ? "justify-center rounded-xl" : "gap-3 px-3 rounded-xl"
                } ${
                  isActive 
                    ? "bg-amber-500 text-slate-900 shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? "text-slate-900" : "text-slate-400 dark:text-slate-500"}`} />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className={`p-4 border-t border-slate-200 dark:border-white/10 ${isCollapsed ? "flex justify-center px-2" : ""}`}>
          <button 
            onClick={async () => {
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  await fetch('http://localhost:3001/db/users/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                  });
                } catch (e) {
                  console.error('Logout error', e);
                }
              }
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              localStorage.removeItem('userRole');
              router.push('/login/recruiter');
            }}
            title={isCollapsed ? "Log Out" : undefined}
            className={`flex items-center gap-3 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group ${
              isCollapsed ? "justify-center px-0 w-12" : "px-3 w-full"
            }`}
          >
            <LogOut size={20} className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-60"}`}>
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-8 sticky top-0 z-50 transition-colors gap-6">
          
          {/* Left Spacer for Centering */}
          <div className="flex-1 hidden md:block"></div>

          {/* Central Search Bar */}
          <div className="w-full max-w-md hidden sm:flex items-center gap-3">
            <div className="flex-1 flex items-center bg-slate-50 dark:bg-[#0f172a] rounded-full border border-slate-200 dark:border-white/10 transition-colors pl-2 pr-1 py-1">
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder="Search jobs here"
                  className="block w-full pl-3 pr-4 py-1.5 bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-0"
                />
                <button className="flex items-center justify-center w-8 h-8 bg-amber-500 text-white rounded-full shrink-0 hover:bg-amber-600 transition-colors">
                  <Search size={16} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex-1 flex items-center justify-end gap-4 shrink-0">
            <ThemeToggle />
            <NotificationDropdown />
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-500 font-bold border border-amber-200 dark:border-amber-500/30">
              R
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
