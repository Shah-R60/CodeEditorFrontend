"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Briefcase, CheckCircle2, ArrowRight, Loader2, Code2, MapPin, UploadCloud } from "lucide-react";
import Link from "next/link";

export default function ApplyPage() {
  const params = useParams();
  const driveId = params.driveId as string;

  const [drive, setDrive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  
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
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (github) formData.append("github", github);
      if (linkedin) formData.append("linkedin", linkedin);
      if (resume) {
        formData.append("resume", resume);
      }

      const res = await fetch(`http://localhost:3001/db/drives/${driveId}/apply-with-resume`, {
        method: 'POST',
        body: formData
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-amber-100">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col md:flex-row">

        {/* Left Column: Drive Info */}
        <div className="md:w-5/12 bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
           <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
           
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-10">
               <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
                 <Code2 size={20} />
               </div>
               <h1 className="text-xl font-bold tracking-tight">TechHire</h1>
             </div>
             
             <div className="space-y-4">
               <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                 {drive?.department || "Engineering"}
               </span>
               <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">{drive?.title}</h2>
               
               <div className="flex items-center gap-2 text-slate-300 mt-2">
                 <MapPin size={18} className="text-amber-400" />
                 <span className="font-medium">{drive?.location || "Remote / Online"}</span>
               </div>
               
               <p className="text-slate-400 text-sm mt-4 leading-relaxed">
                 Join our world-class engineering team. Fill out the application below to begin your journey through our hiring pipeline.
               </p>
             </div>
             
             {drive?.rounds && drive.rounds.length > 0 && (
               <div className="mt-10">
                 <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">Assessment Pipeline</h3>
                 <div className="space-y-6">
                   {drive.rounds.map((round: any, index: number) => (
                     <div key={round.id || index} className="flex gap-4">
                       <div className="flex flex-col items-center">
                         <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-amber-400 shadow-sm shadow-amber-500/10">
                           {index + 1}
                         </div>
                         {index < drive.rounds.length - 1 && (
                           <div className="w-px h-full bg-slate-800 my-1"></div>
                         )}
                       </div>
                       <div className="pt-1 pb-4">
                         <h4 className="text-sm font-semibold text-slate-200">{round.name}</h4>
                         <p className="text-xs text-slate-500 mt-1">{round.type}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
           
           <div className="relative z-10 mt-12 text-xs font-medium text-slate-600">
             &copy; {new Date().getFullYear()} TechHire Assessments
           </div>
        </div>

        {/* Right Column: Application Form */}
        <div className="md:w-7/12 bg-white p-8 md:p-12 flex flex-col justify-center">

        {success ? (
          <div className="text-center animate-in fade-in zoom-in duration-500 py-10">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Application Received!</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
              Thank you for applying for the <strong>{drive?.title}</strong> role. 
              We have automatically enrolled you in the first assessment round.
            </p>
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-sm font-medium mb-8 shadow-sm">
              Please check your email <strong>{email}</strong> for instructions and your unique assessment link.
            </div>
            
            <div className="pt-8 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider font-bold">Demo Mode</p>
              <Link href="/editor" className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3.5 rounded-xl hover:bg-slate-800 transition-colors font-semibold text-sm shadow-md">
                Take Demo Assessment <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Apply for this role</h3>
              <p className="text-slate-500 mt-2 text-sm">Please fill in your details below to submit your application.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-xl">
                  {error}
                  {error.includes("login or register") && (
                    <div className="mt-3">
                      <Link href="/login/student" className="inline-flex items-center justify-center bg-rose-600 text-white font-medium py-2.5 px-5 rounded-xl hover:bg-rose-700 transition-colors shadow-sm">
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
                  className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all shadow-sm"
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
                  className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all shadow-sm"
                />
                <p className="text-xs text-slate-500 mt-1">We'll send your assessment instructions to this email.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">GitHub Profile (Optional)</label>
                  <input 
                    type="url" 
                    value={github}
                    onChange={e => setGithub(e.target.value)}
                    placeholder="https://github.com/janedoe"
                    className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">LinkedIn Profile (Optional)</label>
                  <input 
                    type="url" 
                    value={linkedin}
                    onChange={e => setLinkedin(e.target.value)}
                    placeholder="https://linkedin.com/in/janedoe"
                    className="w-full px-4 py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Upload Resume (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-6 pb-7 border-2 border-slate-200 border-dashed rounded-2xl hover:border-amber-500 hover:bg-amber-50/50 transition-all group bg-slate-50 cursor-pointer" onClick={() => document.getElementById('resume-upload')?.click()}>
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 mx-auto bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 group-hover:text-amber-500 group-hover:border-amber-200 group-hover:bg-amber-50 transition-all shadow-sm">
                       <UploadCloud size={24} />
                    </div>
                    <div className="flex text-sm text-slate-600 justify-center items-center mt-3">
                      <label htmlFor="resume-upload" className="relative cursor-pointer rounded-md font-bold text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500">
                        <span>{resume ? resume.name : "Click to upload"}</span>
                        <input id="resume-upload" name="resume-upload" type="file" accept=".pdf" className="sr-only" onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setResume(e.target.files[0]);
                          }
                        }} />
                      </label>
                      {!resume && <p className="pl-1 text-slate-500 font-medium">or drag and drop</p>}
                    </div>
                    {!resume && <p className="text-xs text-slate-400 font-medium">PDF up to 10MB</p>}
                    {resume && <p className="text-xs text-amber-600 font-bold mt-2">Resume attached. AI will parse your profile!</p>}
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={submitting || !name || !email}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-slate-900 font-bold py-4 px-4 rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:shadow-none mt-4"
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
    </div>
    </div>
  );
}
