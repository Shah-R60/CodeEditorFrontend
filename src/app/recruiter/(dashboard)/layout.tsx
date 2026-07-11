"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Library, Users, Settings, LogOut, Briefcase } from "lucide-react";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", href: "/recruiter", icon: LayoutDashboard },
    { name: "Hiring Drives", href: "/recruiter/drives", icon: Briefcase },
    { name: "Settings", href: "/recruiter/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-blue-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/recruiter" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Briefcase className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">CodeCanvas</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/recruiter");
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={20} className={isActive ? "text-blue-600" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button 
            onClick={() => {
              localStorage.removeItem('userId');
              localStorage.removeItem('userRole');
              router.push('/login/recruiter');
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
          >
            <LogOut size={20} className="text-slate-400 group-hover:text-rose-500 transition-colors" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="text-lg font-semibold text-slate-800">
            {navItems.find(item => pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/recruiter"))?.name || "Dashboard"}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
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
