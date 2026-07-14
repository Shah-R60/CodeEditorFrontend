"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Briefcase, CheckCircle2, ArrowRight, Loader2, Code2 } from "lucide-react";
import Link from "next/link";

export default function ApplyPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  const [drive, setDrive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDriveInfo = async () => {
      try {
        const res = await fetch(`http://localhost:3001/db/drives/${driveId}/public`);
        const json = await res.json();
        if (json.success) {
          setDrive(json.data);
        } else {
          setError(json.error || "Failed to load hiring drive details.");
        }
      } catch (err) {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };
    fetchDriveInfo();
  }, [driveId]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await fetch(`http://localhost:3001/db/users/${userId}/profile`);
        const json = await res.json();
        if (json.success && json.data.user) {
          if (json.data.user.name) setName(json.data.user.name);
          if (json.data.user.email) setEmail(json.data.user.email);
        }
      } catch (err) {
        console.error("Failed to auto-fill user profile", err);
      }
    };
    fetchUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`http://localhost:3001/db/drives/${driveId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      const json = await res.json();
      
      if (json.success) {
        setSuccess(true);
      } else {
        setError(json.error || "Application failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error && !drive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Drive Not Found</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-100">
      
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-4">
          <Code2 size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">TechHire</h1>
      </div>

      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden">
        
        {/* Drive Info Header */}
        <div className="bg-slate-900 p-8 text-white">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-400/20">
            {drive?.department || "Engineering"}
          </span>
          <h2 className="text-3xl font-bold tracking-tight mb-2">{drive?.title}</h2>
          <p className="text-slate-400 text-sm">Join our team. Fill out the application below to begin the assessment process.</p>
        </div>

        {success ? (
          <div className="p-10 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Application Received!</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              Thank you for applying for the <strong>{drive?.title}</strong> role. 
              We have automatically enrolled you in the first assessment round.
            </p>
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-800 text-sm font-medium mb-6">
              Please check your email <strong>{email}</strong> for instructions and your unique assessment link.
            </div>
            
            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">Demo Mode</p>
              <Link href="/editor" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm shadow-sm">
                Take Demo Assessment <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-xl">
                  {error}
                  {error.includes("login or register") && (
                    <div className="mt-3">
                      <Link href="/login/student" className="inline-flex items-center justify-center bg-rose-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-rose-700 transition-colors shadow-sm">
                        Create Account / Log In
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
                />
                <p className="text-xs text-slate-500 mt-1">We'll send your assessment instructions to this email.</p>
              </div>

              <button 
                type="submit"
                disabled={submitting || !name || !email}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3.5 px-4 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                ) : (
                  <>Submit Application <ArrowRight size={18} /></>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center text-xs text-slate-400">
        Powered by TechHire Assessments
      </div>
    </div>
  );
}
