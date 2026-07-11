"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Code2, LogOut, Laptop } from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    router.push("/login/student");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-blue-100">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12 sticky top-0 z-50">
        <Link href="/student" className="flex items-center gap-2 hover:opacity-90 transition">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm">
            <Code2 className="text-white h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">CodeCanvas</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/editor" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition">
            <Laptop size={16} /> Open Sandbox
          </Link>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 ml-4">
            C
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-rose-600 transition ml-2">
            <LogOut size={18} />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-12 py-10">
        {children}
      </main>
    </div>
  );
}
