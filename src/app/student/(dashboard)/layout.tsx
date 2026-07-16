"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Laptop, LogOut, ChevronLeft, Code2, Clock } from "lucide-react";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import ThemeToggle from "@/components/common/ThemeToggle";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (pathname.includes('/student/drives/')) {
      setIsCollapsed(true);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login/student");
  };

  const navItems = [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Active Assessments", href: "/student/assessments", icon: Clock },
    { name: "Open Sandbox", href: "/editor", icon: Laptop },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] flex font-sans text-slate-900 dark:text-white selection:bg-amber-100 dark:selection:bg-amber-900/30">
      {/* Sidebar */}
      <aside className={`bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-transparent flex flex-col fixed inset-y-0 z-20 transition-all duration-300 ${isCollapsed ? "w-20" : "w-60"}`}>
        
        {/* Collapse Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center hover:bg-amber-400 transition-colors z-50 hidden sm:flex shadow-sm"
        >
          <ChevronLeft size={14} strokeWidth={3} className={`transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
        </button>

        <div className={`h-16 flex items-center border-b border-slate-200 dark:border-white/10 ${isCollapsed ? "justify-center px-0" : "px-6"}`}>
          <Link href="/student" className="flex items-center hover:opacity-90 transition">
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

        <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto overflow-x-hidden px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/student");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 py-2.5 rounded-xl font-medium transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                } ${isCollapsed ? "justify-center px-0 w-12" : "px-3 w-full"}`}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon size={20} className={`shrink-0 transition-colors ${isActive ? "text-amber-600 dark:text-amber-500" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/10">
          <button 
            onClick={handleLogout}
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
        <header className="h-16 bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-transparent flex items-center justify-between px-8 sticky top-0 z-50 transition-colors gap-6">
          
          {/* Left Spacer for Centering */}
          <div className="flex-1 hidden md:block"></div>

          {/* Right Action Icons */}
          <div className="flex-1 flex items-center justify-end gap-4 shrink-0">
            <ThemeToggle />
            <NotificationDropdown />
            <Link href="/student/profile" className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-500 font-bold border border-emerald-200 dark:border-emerald-500/30 hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 transition-all">
              C
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
