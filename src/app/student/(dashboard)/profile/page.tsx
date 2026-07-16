"use client";

import { useEffect, useState, useRef } from "react";
import { User, Mail, Calendar, Briefcase, Award, Clock, MapPin, Phone, Upload, Edit, Star, FileText, CheckCircle2, Circle, Loader2, Trash2, Plus, BookOpen, GraduationCap, Zap, Globe, Download } from "lucide-react";

type Assessment = {
  id: string;
  score: string | null;
  status: string;
  createdAt: string;
  hiringDrive: {
    title: string;
    department: string | null;
    status: string;
  };
};

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  resumeData?: any;
  resumeFile?: string;
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"view" | "insights">("view");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      const res = await fetch(`http://localhost:3001/db/users/${userId}/profile`);
      const json = await res.json();

      if (json.success) {
        setProfile(json.data.user);
        setAssessments(json.data.assessments);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const userId = localStorage.getItem("userId");
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(`http://localhost:3001/db/users/${userId}/resume`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        setProfile((prev) => (prev ? { ...prev, resumeData: json.data, resumeFile: json.resumeFile } : prev));
      } else {
        alert("Failed to parse resume: " + json.error);
      }
    } catch (error) {
      console.error("Upload error", error);
      alert("An error occurred while uploading the resume.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const rData = profile.resumeData || {};
  const hasResume = Object.keys(rData).length > 0;
  
  const checklist = [
    { key: "resume", label: "resume", weight: 26, isDone: hasResume },
    { key: "summary", label: "resume headline", weight: 8, isDone: !!rData.summary },
    { key: "skills", label: "key skills", weight: 15, isDone: rData.skills && rData.skills.length > 0 },
    { key: "experience", label: "company name and designation", weight: 10, isDone: rData.experience && rData.experience.length > 0 },
    { key: "education", label: "education", weight: 15, isDone: rData.education && rData.education.length > 0 },
    { key: "languages", label: "languages", weight: 5, isDone: rData.languages && rData.languages.length > 0 },
    { key: "accomplishments", label: "accomplishments", weight: 5, isDone: !!rData.accomplishments },
    { key: "gender", label: "gender", weight: 2, isDone: !!rData.personal_info?.gender },
    { key: "dob", label: "date of birth", weight: 2, isDone: !!rData.personal_info?.dob },
    { key: "hometown", label: "hometown", weight: 2, isDone: !!rData.personal_info?.location }
  ];

  const completeness = checklist.reduce((acc, item) => acc + (item.isDone ? item.weight : 0), 0);
  const progressOffset = 283 - (283 * completeness) / 100;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full font-sans text-slate-300">
      
      {/* Header Section */}
      <div className="bg-[#111827] rounded-3xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start justify-between border border-white/5 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 w-full">
          {/* Avatar & Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" stroke="#f59e0b" strokeWidth="6" 
                  strokeDasharray="283" strokeDashoffset={progressOffset} strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="w-[104px] h-[104px] rounded-full bg-amber-600 flex items-center justify-center text-4xl text-white font-bold tracking-tight">
                {profile.name ? profile.name.substring(0, 2).toUpperCase() : profile.email.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="mt-[-12px] z-10 bg-[#ef4444] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {completeness}%
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left mt-2 md:mt-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between w-full mb-2 gap-4">
              <h1 className="text-3xl font-bold text-white">{profile.name || "Student User"}</h1>
              
              <div className="flex items-center gap-3 justify-center md:justify-end">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm shadow-lg shadow-emerald-500/20 disabled:opacity-70"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Auto-fill from Resume
                </button>
                {profile.resumeFile && (
                  <button 
                    onClick={() => window.open(profile.resumeFile, "_blank")}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium transition-colors text-sm shadow-lg shadow-blue-500/20"
                  >
                    <FileText className="w-4 h-4" />
                    View Resume
                  </button>
                )}
                <button className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 px-5 py-2.5 rounded-full font-medium transition-colors text-sm">
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            <p className="text-slate-400 text-sm mb-5">Add your education to complete your profile</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>{rData.personal_info?.location || "Location not set"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>{rData.personal_info?.phone || "Phone not set"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>{profile.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-white/10 mb-8 px-2">
        <button 
          onClick={() => setActiveTab("view")}
          className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "view" ? "text-amber-500" : "text-slate-400 hover:text-white"}`}
        >
          View & Edit
          {activeTab === "view" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab("insights")}
          className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "insights" ? "text-amber-500" : "text-slate-400 hover:text-white"}`}
        >
          Activity Insights
          {activeTab === "insights" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-t-full"></div>}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "view" ? (
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">

            {/* Profile Completeness Checklist */}
            <div className="bg-[#111827] rounded-2xl p-6 border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profile Completeness</h3>
                <span className="text-amber-500 font-bold">{completeness}%</span>
              </div>
              
              <div className="w-full bg-slate-800 rounded-full h-1.5 mb-6">
                <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${completeness}%` }}></div>
              </div>

              <div className="space-y-4">
                {checklist.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm group">
                    <div className="flex items-center gap-3">
                      {item.isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600" />
                      )}
                      <span className={`capitalize ${item.isDone ? "text-slate-300" : "text-slate-500"}`}>{item.label}</span>
                    </div>
                    {!item.isDone && <span className="text-emerald-500 text-xs font-semibold group-hover:text-emerald-400 transition-colors">+{item.weight}%</span>}
                  </div>
                ))}
              </div>
              
              {completeness < 100 && (
                <button className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Add missing details
                </button>
              )}
            </div>
          </div>

          {/* Right Main Column */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Complete Profile Grid */}
            {completeness < 100 && (
              <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
                <Award className="absolute -bottom-10 -right-10 w-64 h-64 text-white/[0.02]" strokeWidth={1} />
                
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-8 border-b border-white/5">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">Complete your profile</h2>
                    <p className="text-slate-400 text-sm">A complete profile gets <span className="text-amber-500 font-semibold">3x more</span> recruiter attention</p>
                  </div>
                  <div className="mt-4 md:mt-0 text-center">
                    <div className="text-3xl font-black text-amber-500">{completeness}%</div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">Complete</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checklist.slice(1).map((item, idx) => (
                    <div key={idx} className={`p-5 rounded-2xl border flex items-center justify-between group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${item.isDone ? "bg-slate-800/50 border-emerald-500/30 hover:border-emerald-500/50" : "bg-slate-900/50 border-white/5 hover:border-amber-500/30"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${item.isDone ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"}`}>
                          {item.isDone ? <CheckCircle2 className="w-5 h-5" /> : <Star className="w-5 h-5" />}
                        </div>
                        <span className={`font-medium capitalize ${item.isDone ? "text-emerald-400" : "text-slate-300"}`}>{item.label}</span>
                      </div>
                      {!item.isDone && <div className="text-emerald-500 text-xs font-bold px-2 py-1 bg-emerald-500/10 rounded-md">+{item.weight}%</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Summary */}
            <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-500" />
                  Profile Summary
                </h3>
                <div className="flex items-center gap-2">
                  <button className="text-xs font-medium text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                  <button className="text-xs font-medium text-sky-500 hover:bg-sky-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                {rData.summary || "No summary added yet. Add a headline to stand out."}
              </p>
            </div>

            {/* Work Experience */}
            <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-amber-500" />
                  Work Experience
                </h3>
                <button className="text-xs font-medium text-sky-500 hover:bg-sky-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              <div className="space-y-4">
                {rData.experience && rData.experience.length > 0 ? (
                  rData.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="bg-[#1e293b]/50 rounded-xl p-5 border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                            <Briefcase className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200">{exp.jobtitle}</h4>
                            <p className="text-sm text-amber-500 mb-1">{exp.companyname}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                              <Calendar className="w-3.5 h-3.5" />
                              {exp.startdate} - {exp.enddate || "Present"}
                            </p>
                            <p className="text-sm text-slate-400 leading-relaxed">{exp.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 rounded"><Edit className="w-4 h-4" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No work experience added.</p>
                )}
              </div>
            </div>

            {/* Internships */}
            <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-pink-500" />
                  Internships
                </h3>
                <button className="text-xs font-medium text-pink-500 hover:bg-pink-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              <div className="space-y-4">
                {rData.internships && rData.internships.length > 0 ? (
                  rData.internships.map((exp: any, idx: number) => (
                    <div key={idx} className="bg-[#1e293b]/50 rounded-xl p-5 border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded bg-pink-500/10 flex items-center justify-center shrink-0 border border-pink-500/20">
                            <BookOpen className="w-5 h-5 text-pink-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200">{exp.jobtitle}</h4>
                            <p className="text-sm text-pink-500 mb-1">{exp.companyname}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-3">
                              <Calendar className="w-3.5 h-3.5" />
                              {exp.startdate} - {exp.enddate || "Present"}
                            </p>
                            <p className="text-sm text-slate-400 leading-relaxed">{exp.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 rounded"><Edit className="w-4 h-4" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No internships added.</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-emerald-500" />
                  Education
                </h3>
                <button className="text-xs font-medium text-emerald-500 hover:bg-emerald-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              <div className="space-y-4">
                {rData.education && rData.education.length > 0 ? (
                  rData.education.map((edu: any, idx: number) => (
                    <div key={idx} className="bg-[#1e293b]/50 rounded-xl p-5 border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                            <GraduationCap className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200">{edu.degree} {edu.specialisation ? `in ${edu.specialisation}` : ''}</h4>
                            <p className="text-sm text-emerald-500 mb-1">{edu.collegename}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {edu.startdate} - {edu.enddate || "Present"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 rounded"><Edit className="w-4 h-4" /></button>
                          <button className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No education added.</p>
                )}
              </div>
            </div>

            {/* Key Skills */}
            <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  Key Skills
                </h3>
                <div className="flex items-center gap-2">
                  <button className="text-xs font-medium text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                  <button className="text-xs font-medium text-sky-500 hover:bg-sky-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {rData.skills && rData.skills.length > 0 ? (
                  rData.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-[#1e293b]/80 text-slate-300 border border-white/5 px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-700 transition-colors">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No skills added.</p>
                )}
              </div>
            </div>

            {/* Languages Known */}
            <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-sky-500" />
                  Languages Known
                </h3>
                <button className="text-xs font-medium text-sky-500 hover:bg-sky-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                {rData.languages && rData.languages.length > 0 ? (
                  rData.languages.map((lang: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-[#1e293b]/50 border border-white/5 px-4 py-2 rounded-lg">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-300 text-sm font-medium">{lang}</span>
                      <span className="text-xs text-slate-500 ml-2 border-l border-slate-700 pl-2">Expert</span>
                      <button className="ml-2 text-slate-500 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-sm">No languages added.</p>
                )}
              </div>
            </div>


            {/* Resume */}
            <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Upload className="w-5 h-5 text-rose-500" />
                  Resume
                </h3>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" /> Replace
                </button>
              </div>
              
              {hasResume ? (
                <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">Uploaded_Resume.pdf</p>
                      <p className="text-xs text-slate-500">Auto-filled on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No resume uploaded.</p>
              )}
            </div>

          </div>
          
        </div>
      ) : (
        <div className="bg-[#111827] rounded-2xl p-6 md:p-8 border border-white/5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-amber-500" />
                Assessment History
              </h3>
              <p className="text-sm text-slate-400 mt-1">Review your past performance and stages.</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full">
              {assessments.length} Total
            </span>
          </div>
          
          <div className="divide-y divide-white/5">
            {assessments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500">
                <FileText className="w-12 h-12 mb-4 opacity-20" />
                <p>You haven't participated in any assessments yet.</p>
              </div>
            ) : (
              assessments.map((assessment) => (
                <div key={assessment.id} className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] -mx-6 px-6 transition">
                  <div>
                    <h4 className="font-bold text-slate-200 mb-2">{assessment.hiringDrive.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {assessment.hiringDrive.department || "No Department"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(assessment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Score</div>
                      <div className="font-mono text-sm font-semibold text-slate-300">
                        {assessment.score || "Pending"}
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                      assessment.status === 'HIRED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      assessment.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      assessment.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {assessment.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
