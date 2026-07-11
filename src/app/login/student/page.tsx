"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Code2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { auth, googleProvider, signInWithPopup } from "@/lib/firebase";

export default function StudentLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      // 1. Authenticate with Firebase Google Auth
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2. Send token to our backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/db/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, role: "STUDENT" })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // 3. Store our app token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);

      router.push("/student");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An error occurred during Google Sign In.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900 selection:bg-blue-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-90 transition">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm">
            <Code2 className="text-white h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">CodeCanvas</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Candidate Portal
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sign in to take your coding assessments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-12 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100 text-center">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-left">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></div>
              <p className="text-sm font-medium text-rose-600">{errorMsg}</p>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin text-emerald-600" size={20} /> Authenticating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform ml-auto" />
              </>
            )}
          </button>
          
          <p className="mt-6 text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy. New accounts are created automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
