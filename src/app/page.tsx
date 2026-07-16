"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Code2, ChevronDown, Moon, Search, Rocket, X, Loader2 } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoginSidebarOpen, setIsLoginSidebarOpen] = useState(false);
  const [loginRole, setLoginRole] = useState("STUDENT");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token && token !== 'undefined' && token !== 'null');
    setUserRole(localStorage.getItem('userRole'));
  }, []);

  const handleAction = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      if (token) {
        if (role === 'RECRUITER') router.push('/recruiter');
        else router.push('/student');
      } else {
        setIsLoginSidebarOpen(true);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLoginError("");
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/db/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role: loginRole })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);

      router.push(loginRole === "RECRUITER" ? "/recruiter" : "/student");
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "An error occurred during Google Sign In.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-100 flex flex-col">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <nav className="flex items-center justify-between px-6 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
              <div className="bg-amber-500 p-1.5 rounded-lg shadow-sm">
                <Code2 className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">CodeCanvas<span className="text-slate-500">.com</span></span>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link href="#" className="hover:text-amber-500 transition-colors">Practice</Link>
              <Link href="#" className="hover:text-amber-500 transition-colors">Assessments</Link>
              <Link href="#" className="flex items-center gap-1 hover:text-amber-500 transition-colors">
                Features <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">NEW</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-slate-900 transition-colors hidden md:block">
              <Moon className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('userRole'); localStorage.removeItem('userId'); window.location.reload(); }} 
                    className="px-5 py-2 rounded-full border border-slate-300 text-sm font-medium hover:bg-slate-50 transition-colors"
                  >
                    Sign out
                  </button>
                  <button 
                    onClick={() => router.push(userRole === 'RECRUITER' ? '/recruiter' : '/student')} 
                    className="px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 text-sm font-semibold transition-colors shadow-sm"
                  >
                    Go to Dashboard
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsLoginSidebarOpen(true)} 
                    className="px-5 py-2 rounded-full border border-slate-300 text-sm font-medium hover:bg-slate-50 transition-colors hidden sm:block"
                  >
                    Login
                  </button>
                </>
              )}
              
              <div className="relative group hidden lg:block ml-2">
                <button 
                  className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 py-2"
                >
                  For student <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full w-40 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                  <button 
                    onClick={() => { setLoginRole("STUDENT"); setIsLoginSidebarOpen(true); }} 
                    className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-500 transition-colors"
                  >
                    For student
                  </button>
                  <button 
                    onClick={() => { setLoginRole("RECRUITER"); setIsLoginSidebarOpen(true); }} 
                    className="w-full text-left px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-amber-500 transition-colors"
                  >
                    For recruiter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 mt-6 relative pb-24">
        {/* The Big Gradient Card */}
        <div className="w-full bg-gradient-to-br from-[#ffc107] via-[#ff9800] to-[#ff5722] rounded-[2rem] pt-12 pb-28 px-4 relative overflow-hidden shadow-xl">
          
          {/* Top Right Badge */}
          <div className="absolute top-6 right-6 hidden md:block">
            <div className="bg-white/20 hover:bg-white/30 backdrop-blur-md cursor-pointer transition-colors border border-white/30 text-slate-900 text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <Rocket className="w-4 h-4 text-slate-800" />
              <span>Ace your interviews — <span className="underline font-bold">Practice now →</span></span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-[1.15] tracking-tight">
              Master your coding skills and <br className="hidden md:block" />
              find the best candidates in one platform
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
              <button 
                onClick={() => { setLoginRole("STUDENT"); setIsLoginSidebarOpen(true); }}
                className="px-6 py-2.5 rounded-full border border-slate-900 text-slate-900 font-semibold hover:bg-slate-900/5 transition-colors"
              >
                For Candidates
              </button>
              <button 
                onClick={() => { setLoginRole("RECRUITER"); setIsLoginSidebarOpen(true); }}
                className="px-6 py-2.5 rounded-full bg-[#1a237e] text-white font-semibold hover:bg-[#121858] transition-colors shadow-md"
              >
                For Recruiters
              </button>
            </div>

            {/* Search Bar */}
            <div className="w-full max-w-2xl bg-white rounded-full p-2 flex items-center shadow-lg">
              <div className="pl-4 pr-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                placeholder="Skills / language / company" 
                className="flex-1 bg-transparent border-none outline-none py-2 text-slate-700 placeholder-slate-400 w-full"
              />
              <button className="bg-[#1a237e] hover:bg-[#121858] text-white px-8 py-3 rounded-full font-semibold transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Overlapping Stats Card */}
        <div className="max-w-4xl mx-auto -mt-14 relative z-20 px-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="flex flex-col items-center justify-center py-4 md:py-0">
                <h3 className="text-3xl font-bold text-[#ff9800] mb-1">10,000+</h3>
                <p className="text-sm text-slate-500 font-medium text-center">Students practiced on platform</p>
              </div>
              <div className="flex flex-col items-center justify-center py-4 md:py-0">
                <h3 className="text-3xl font-bold text-[#ff9800] mb-1">45%</h3>
                <p className="text-sm text-slate-500 font-medium text-center">Increase in interview pass rate</p>
              </div>
              <div className="flex flex-col items-center justify-center py-4 md:py-0">
                <h3 className="text-3xl font-bold text-[#ff9800] mb-1">500+</h3>
                <p className="text-sm text-slate-500 font-medium text-center">Hiring partners & recruiters</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Browse by Category */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-8">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto opacity-70">
            {/* Placeholder pills for categories */}
            {['Software Engineering', 'Data Science', 'Frontend Development', 'Backend Systems', 'AI & Machine Learning', 'DevOps'].map((cat) => (
              <div key={cat} className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:border-amber-400 hover:text-amber-600 cursor-pointer transition-colors shadow-sm">
                {cat}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Login Sidebar Overlay */}
      <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${isLoginSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsLoginSidebarOpen(false)}
        ></div>
        
        <div className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 rounded-l-3xl ${isLoginSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-bold text-slate-900">{loginRole === "RECRUITER" ? "Recruiter Login" : "Student Login"}</h2>
                <span className="text-[#ff9800] text-sm font-medium cursor-pointer hover:underline">Register for free</span>
              </div>
              <button 
                onClick={() => setIsLoginSidebarOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email ID / Username</label>
                <input 
                  type="text" 
                  placeholder="Enter your email or username" 
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc107] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    placeholder="Enter your password" 
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffc107] focus:border-transparent pr-16"
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#ff9800] font-medium hover:underline">
                    Show
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-[#ff9800] font-medium cursor-pointer hover:underline">Forgot Password?</span>
                </div>
              </div>

              <button className="w-full py-3 bg-[#ffc107] hover:bg-[#ffb300] text-slate-900 font-bold rounded-full transition-colors mt-2">
                Login
              </button>

              <div className="text-center mt-2">
                <span className="text-sm text-[#ff9800] font-medium cursor-pointer hover:underline">Use OTP to Login</span>
              </div>

              <div className="flex items-center gap-4 my-2">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 font-medium uppercase">Or</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-full transition-colors flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>

              <div className="mt-auto bg-[#fff8e1] border border-[#ffecb3] p-4 rounded-xl flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span className="font-bold text-[#ff9800]">Test:</span> student@codecanvas.com / password
                </div>
                <button className="text-xs bg-[#ffecb3] hover:bg-[#ffe082] px-3 py-1.5 rounded-lg font-medium transition-colors">
                  Auto-Fill
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
