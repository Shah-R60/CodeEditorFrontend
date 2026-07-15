"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Phone, Mail, Award, Briefcase, BookOpen, FileText, CheckCircle2 } from "lucide-react";

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const candidateId = params.candidateId as string;

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await fetch(`http://localhost:3001/db/drives/${jobId}/candidates/${candidateId}`);
        const json = await res.json();
        if (json.success) {
          setCandidate(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch candidate:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [jobId, candidateId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col">
        <h2 className="text-xl font-bold text-slate-800">Candidate Not Found</h2>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const { resumeData } = candidate;

  const phone = resumeData?.personal_info?.phone || "";
  const location = resumeData?.personal_info?.location || "";
  const summary = resumeData?.summary || "";
  const skills = resumeData?.skills || [];
  const experience = resumeData?.experience || [];
  const internships = resumeData?.internships || [];
  const education = resumeData?.education || [];
  const languages = resumeData?.languages || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white font-sans pb-20 transition-colors">
      {/* Top Navigation */}
      <div className="bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-white/10 sticky top-0 z-10 transition-colors">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back to Review</span>
          </button>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              candidate.status === 'Passed' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
              candidate.status === 'Rejected' ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400' :
              'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
            }`}>
              {candidate.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
              Stage: {candidate.stage}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-white/10 mb-6 flex flex-col md:flex-row items-start md:items-center gap-6 relative overflow-hidden transition-colors">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70"></div>
          
          <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md border-4 border-white dark:border-[#0f172a] shrink-0 relative z-10 transition-colors">
            {candidate.name.substring(0, 2).toUpperCase()}
          </div>
          
          <div className="flex-1 relative z-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{candidate.name}</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-1 font-medium">{candidate.email}</p>
            
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              {location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400 dark:text-slate-500" />
                  {location}
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-1.5">
                  <Phone size={16} className="text-slate-400 dark:text-slate-500" />
                  {phone}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Mail size={16} className="text-slate-400 dark:text-slate-500" />
                {candidate.email}
              </div>
            </div>
          </div>
          
          {candidate.score && (
            <div className="mt-4 md:mt-0 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-xl p-4 text-center shrink-0 relative z-10 min-w-[120px] transition-colors">
              <span className="block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Assessment Score</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-500">{candidate.score}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
              <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">Profile Completeness</h3>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mb-4 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: resumeData ? '100%' : '20%' }}></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={18} className={resumeData ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                  <span className={resumeData ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>Resume Uploaded</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={18} className={summary ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                  <span className={summary ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>Profile Summary</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={18} className={skills.length > 0 ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                  <span className={skills.length > 0 ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>Key Skills</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={18} className={experience.length > 0 || internships.length > 0 ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                  <span className={experience.length > 0 || internships.length > 0 ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>Experience / Internships</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <CheckCircle2 size={18} className={education.length > 0 ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                  <span className={education.length > 0 ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-500"}>Education</span>
                </div>
              </div>
            </div>

            {skills && skills.length > 0 && (
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 2.5-2-2.5-2 2.5-2-2.5-2 2.5v13l2-2.5 2 2.5 2-2.5 2 2.5 2-2.5 2 2.5v-13Z"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Key Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {languages && languages.length > 0 && (
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Languages Known</h3>
                </div>
                <div className="space-y-3">
                  {languages.map((l: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{l}</span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">Proficient</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {candidate.resumeFile && (
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-white">Original Resume</h3>
                </div>
                <a 
                  href={candidate.resumeFile.startsWith('http') ? candidate.resumeFile : `http://localhost:3001/uploads/${candidate.resumeFile}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group"
                >
                  <div className="w-10 h-10 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {candidate.resumeFile.startsWith('http') ? 'View Cloud Resume' : 'View Local Resume'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Click to open PDF</p>
                  </div>
                </a>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {!resumeData ? (
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-12 shadow-sm border border-slate-200 dark:border-white/10 text-center transition-colors">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No AI Profile Available</h3>
                <p className="text-slate-500 dark:text-slate-400">This candidate did not upload a resume, or the parsing process failed.</p>
              </div>
            ) : (
              <>
                {summary && (
                  <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Profile Summary</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{summary}</p>
                  </div>
                )}

                {experience && experience.length > 0 && (
                  <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center">
                        <Briefcase size={18} />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Work Experience</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {experience.map((exp: any, idx: number) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-orange-100 dark:border-orange-500/20 last:border-0 last:pb-0 pb-6">
                          <div className="absolute w-3 h-3 bg-orange-400 rounded-full -left-[7.5px] top-1 shadow-sm shadow-orange-400/50"></div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{exp.jobtitle}</h4>
                          <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">{exp.companyname}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-3 font-medium">
                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> {exp.startdate || 'Unknown'} - {exp.enddate || 'Present'}</span>
                            {exp.location && <span className="flex items-center gap-1"><MapPin size={14} /> {exp.location}</span>}
                          </div>
                          {exp.description && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {internships && internships.length > 0 && (
                  <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 dark:bg-pink-500/10 text-pink-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Internships</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {internships.map((intern: any, idx: number) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-pink-100 dark:border-pink-500/20 last:border-0 last:pb-0 pb-6">
                          <div className="absolute w-3 h-3 bg-pink-400 rounded-full -left-[7.5px] top-1 shadow-sm shadow-pink-400/50"></div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{intern.jobtitle}</h4>
                          <p className="text-sm font-medium text-pink-600 dark:text-pink-400 mb-1">{intern.companyname}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 mb-3 font-medium">
                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> {intern.startdate || 'Unknown'} - {intern.enddate || 'Present'}</span>
                            {intern.location && <span className="flex items-center gap-1"><MapPin size={14} /> {intern.location}</span>}
                          </div>
                          {intern.description && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{intern.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {education && education.length > 0 && (
                  <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-white/10 transition-colors">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <BookOpen size={18} />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Education</h3>
                    </div>
                    
                    <div className="space-y-6">
                      {education.map((edu: any, idx: number) => (
                        <div key={idx} className="relative pl-6 border-l-2 border-emerald-100 dark:border-emerald-500/20 last:border-0 last:pb-0 pb-6">
                          <div className="absolute w-3 h-3 bg-emerald-400 rounded-full -left-[7.5px] top-1 shadow-sm shadow-emerald-400/50"></div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-white">{edu.degree} {edu.specialisation ? `in ${edu.specialisation}` : ''}</h4>
                          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-1">{edu.collegename}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg> {edu.startdate || 'Unknown'} - {edu.enddate || 'Present'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
