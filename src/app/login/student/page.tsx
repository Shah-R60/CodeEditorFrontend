"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Lock, User, Loader2, Code2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function StudentLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/db/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password, role: "STUDENT" })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Login failed");
      }

      // Store token
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      router.push("/");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/30">
            <Code2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Portal</h1>
          <p className="text-sm text-gray-400 mt-2 text-center">
            Sign in to start your coding assessment or join an interview.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/50 rounded-lg text-rose-300 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <User size={18} />
              </div>
              <input
                type="email"
                {...register("email", { required: true })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                placeholder="student@university.edu"
              />
            </div>
            {errors.email && <span className="text-rose-400 text-xs mt-1 block">Email is required</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password / Access Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                {...register("password", { required: true })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-inner"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <span className="text-rose-400 text-xs mt-1 block">Password is required</span>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
              <span className="ml-2 text-gray-400">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Authenticating...
              </>
            ) : (
              <>
                Start Assessment
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <Link href="/signup/student" className="text-blue-400 hover:text-blue-300 font-medium transition">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}
