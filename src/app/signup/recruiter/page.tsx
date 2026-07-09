"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Lock, Mail, User as UserIcon, Loader2, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RecruiterSignup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/db/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: data.name, 
          email: data.email, 
          password: data.password, 
          role: "RECRUITER" 
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Store token
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));

      // Redirect to the question setup page (admin dashboard)
      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-700/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
            <Briefcase size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Recruiter Account</h1>
          <p className="text-sm text-gray-400 mt-2 text-center">
            Sign up to manage coding assessments and interviews.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/50 rounded-lg text-rose-300 text-sm text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <UserIcon size={18} />
              </div>
              <input
                type="text"
                {...register("name", { required: true })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
                placeholder="Jane Doe"
              />
            </div>
            {errors.name && <span className="text-rose-400 text-xs mt-1 block">Name is required</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                {...register("email", { required: true })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
                placeholder="recruiter@company.com"
              />
            </div>
            {errors.email && <span className="text-rose-400 text-xs mt-1 block">Email is required</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <Lock size={18} />
              </div>
              <input
                type="password"
                {...register("password", { required: true, minLength: 6 })}
                className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <span className="text-rose-400 text-xs mt-1 block">Password must be at least 6 characters</span>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-emerald-500 text-gray-950 font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Creating account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login/recruiter" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
