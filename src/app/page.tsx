"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Code2, ChevronRight, CheckCircle2, Building, PlayCircle, ArrowRight, Users, Laptop } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleAction = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/editor');
      } else {
        router.push('/login/student');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 flex flex-col">
      {/* Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm">
              <Code2 className="text-white h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">CodeCanvas</span>
          </div>
          


          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.reload(); }} className="text-sm font-medium text-slate-600 hover:text-red-600 transition">
                  Sign out
                </button>
                <button onClick={() => router.push('/editor')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md">
                  Go to Editor
                </button>
              </>
            ) : (
              <>
                <button onClick={() => router.push('/login/student')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition">
                  Sign in
                </button>
                <button onClick={handleAction} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-sm hover:shadow-md">
                  Book a demo
                </button>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold">
            CodeCanvas Skills Platform
          </div>
          <h1 className="text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            AI-native hiring & <br/> learning solutions
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
            Discover and develop the skills that will shape the future with CodeCanvas's skills assessment, development, and simulation capabilities.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <button onClick={handleAction} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
              Get started
            </button>
          </div>
        </div>

        {/* Hero Visual / Graphic */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-50 rounded-3xl transform rotate-3 scale-105 -z-10"></div>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">AI Interview Scheduled!</div>
                    <div className="text-sm text-slate-500">Today at 2:00 PM</div>
                  </div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                  Ready
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                  <div className="text-sm font-semibold text-slate-500">Average Candidate Score</div>
                  <div className="text-4xl font-extrabold text-slate-900">495</div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
                  <span>300</span>
                  <span>600</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-100 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">502</div>
                    <div className="text-xs text-slate-500 font-medium">Active team members</div>
                  </div>
                </div>
                <div className="border border-slate-100 rounded-xl p-4 flex items-center gap-4 bg-white shadow-sm">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <PlayCircle size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-900">10,531</div>
                    <div className="text-xs text-slate-500 font-medium">Hours spent learning</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Choose Your Path Section */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Explore capabilities</h2>
            <p className="text-lg text-slate-500">Choose your path to get started with CodeCanvas.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Card */}
            <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Laptop size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">I am a Student</h3>
              <p className="text-slate-600 leading-relaxed mb-8 flex-1">
                Access our coding environment to practice algorithmic challenges, prepare for technical interviews, and benchmark your skills.
              </p>
              <button onClick={() => router.push('/signup/student')} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide group/btn">
                SEE MORE <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Recruiter Card */}
            <div className="group bg-white border border-slate-200 rounded-2xl p-8 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">I am a Recruiter</h3>
              <p className="text-slate-600 leading-relaxed mb-8 flex-1">
                Bring our AI Interviewer and comprehensive skills assessments to your hiring team to evaluate candidates fairly and efficiently.
              </p>
              <button onClick={() => router.push('/signup/recruiter')} className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wide group/btn">
                SEE MORE <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="border-t border-slate-100 bg-slate-50/50 py-16">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-8">Trusted by 500+ companies</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Logos represented by stylized text */}
            <div className="text-2xl font-extrabold tracking-tighter text-blue-600 flex items-center gap-1">
              <div className="w-6 h-6 border-4 border-blue-600 rounded-full border-t-transparent -rotate-45"></div> Meta
            </div>
            <div className="text-2xl font-bold text-slate-800">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-yellow-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </div>
            <div className="text-2xl font-black tracking-widest text-slate-900">ANTHROP\C</div>
            <div className="text-2xl font-bold text-blue-500">zoom</div>
            <div className="text-2xl font-bold text-slate-700 flex items-center gap-1">
              <Building className="text-blue-600" /> Zillow
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
