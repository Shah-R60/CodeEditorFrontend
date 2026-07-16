"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, CheckCircle2, ChevronRight, Laptop, Calendar, Building, Loader2, ArrowLeft, Building2, MapPin, Users, Hourglass, Lock, Megaphone, FileText, CheckCircle, ExternalLink, LayoutDashboard, Activity, Trophy, Code2, ClipboardList } from "lucide-react";
import Link from "next/link";

export default function DriveDetails() {
  const params = useParams();
  const router = useRouter();
  const driveId = params.driveId as string;

  const [activeTab, setActiveTab] = useState("overview");
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDriveDetails = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          router.push("/login/student");
          return;
        }

        const res = await fetch(`http://localhost:3001/db/users/${userId}/assessments`);
        const json = await res.json();
        
        if (json.success) {
          const driveData = json.data.find((c: any) => c.hiringDriveId === driveId);
          setAssessment(driveData);
        }
      } catch (err) {
        console.error("Failed to fetch drive details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDriveDetails();
  }, [driveId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400">
        <Loader2 className="animate-spin text-amber-600 mb-4" size={32} />
        <p className="text-lg font-medium">Loading drive details...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400">
        <p className="text-lg font-medium mb-4">Drive not found or you are not enrolled.</p>
        <button onClick={() => router.push("/student")} className="text-amber-600 hover:underline font-medium">
          Go back to dashboard
        </button>
      </div>
    );
  }

  const drive = assessment.hiringDrive;
  const rounds = drive?.rounds || [];
  
  const totalDuration = rounds.reduce((acc: number, round: any) => {
    return acc + (round.duration ? parseInt(round.duration) : 60);
  }, 0) || 60;

  const firstRound = rounds[0];
  const startDate = firstRound?.startDate ? new Date(firstRound.startDate) : null;
  const now = new Date();
  
  // Calculate Progress state
  const pipelineSteps = [
    { name: "Application", type: "system" },
    ...rounds,
    { name: "Final Result", type: "system" }
  ];

  let currentStageIndex = pipelineSteps.findIndex(s => s.name === assessment.stage);
  if (currentStageIndex === -1 && assessment.stage === "Applied") {
    currentStageIndex = 0; // Application
  }

  // To support start assessment
  const currentRound = currentStageIndex > 0 && currentStageIndex < pipelineSteps.length - 1 ? pipelineSteps[currentStageIndex] : null;
  const currentRoundStartDate = currentRound?.startDate ? new Date(currentRound.startDate) : null;
  const currentRoundDurationInMins = currentRound?.duration ? parseInt(currentRound.duration) : 60;
  const currentRoundEndDate = currentRound?.endDate ? new Date(currentRound.endDate) : (currentRoundStartDate ? new Date(currentRoundStartDate.getTime() + currentRoundDurationInMins * 60000) : null);

  const hasSubmittedCurrentRound = currentRound && assessment.stageData && 
    (typeof assessment.stageData === 'string' ? JSON.parse(assessment.stageData) : assessment.stageData)[currentRound.id];

  let currentRoundStatus = "";
  if (!currentRound) currentRoundStatus = "None";
  else if (hasSubmittedCurrentRound) currentRoundStatus = "Submitted";
  else if (!currentRoundStartDate) currentRoundStatus = "Schedule Not Decided";
  else if (currentRoundStartDate > now) currentRoundStatus = "Scheduled";
  else if (currentRoundEndDate && currentRoundEndDate < now) currentRoundStatus = "Finished";
  else currentRoundStatus = "Live";

  const roundSteps = pipelineSteps.filter(s => s.type !== 'system' && s.name !== 'Application');

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[calc(100vh-4rem)]">
        
        {/* Sidebar - Flush Left */}
        <div className="w-64 flex-shrink-0 hidden md:block border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
          <div className="sticky top-16 pt-10 pb-12 px-4 h-[calc(100vh-4rem)] overflow-y-auto">

             <div className="space-y-0.5">
                  <button 
                    onClick={() => setActiveTab("overview")}
                    className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'overview' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/10 hover:text-slate-900 dark:text-white'}`}
                  >
                    <LayoutDashboard size={20} />
                    <span className="text-sm">Overview</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab("timeline")}
                    className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'timeline' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/10 hover:text-slate-900 dark:text-white'}`}
                  >
                    <Activity size={20} />
                    <span className="text-sm">Timeline</span>
                  </button>
                  
                  <div className="pt-3 pb-2 mt-2 border-t border-slate-200 dark:border-white/10">
                     <span className="px-3 text-slate-900 dark:text-white font-semibold text-base">Rounds</span>
                  </div>
                  
                  {roundSteps.map((step, idx) => {
                     let Icon = ClipboardList;
                     const lowerName = step.name.toLowerCase();
                     if (lowerName.includes('technical') || lowerName.includes('code')) Icon = Code2;
                     else if (lowerName.includes('hr') || lowerName.includes('interview')) Icon = Users;
                     else if (lowerName.includes('assessment') || lowerName.includes('test')) Icon = FileText;
                     const tabId = `round-${idx}`;

                     return (
                     <button 
                       key={idx} 
                       onClick={() => setActiveTab(tabId)}
                       className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeTab === tabId ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/10 hover:text-slate-900 dark:text-white'}`}
                     >
                       <Icon size={20} />
                       <span className="text-sm truncate">{step.name}</span>
                     </button>
                     );
                  })}
                  
                  <div className="pt-3 pb-2 mt-2 border-t border-slate-200 dark:border-white/10"></div>
                  
                  <button 
                    onClick={() => setActiveTab("final-result")}
                    className={`w-full flex items-center gap-4 px-3 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'final-result' ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:bg-white/10 hover:text-slate-900 dark:text-white'}`}
                  >
                    <Trophy size={20} />
                    <span className="text-sm">Final Result</span>
                  </button>
               </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 pb-16">
          
          {/* Mobile Navigation (Horizontal Tabs) */}
          <div className="md:hidden overflow-x-auto whitespace-nowrap px-4 py-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex gap-2 shadow-inner">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-white/5'}`}
            >
              <LayoutDashboard size={16} /> Overview
            </button>
            <button 
              onClick={() => setActiveTab("timeline")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'timeline' ? 'bg-slate-900 text-white shadow-md' : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-white/5'}`}
            >
              <Activity size={16} /> Timeline
            </button>
            
            {roundSteps.map((step, idx) => {
               let Icon = ClipboardList;
               const lowerName = step.name.toLowerCase();
               if (lowerName.includes('technical') || lowerName.includes('code')) Icon = Code2;
               else if (lowerName.includes('hr') || lowerName.includes('interview')) Icon = Users;
               else if (lowerName.includes('assessment') || lowerName.includes('test')) Icon = FileText;
               const tabId = `round-${idx}`;
  
               return (
               <button 
                 key={idx} 
                 onClick={() => setActiveTab(tabId)}
                 className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tabId ? 'bg-slate-900 text-white shadow-md' : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-white/5'}`}
               >
                 <Icon size={16} /> {step.name}
               </button>
               );
            })}
            
            <button 
              onClick={() => setActiveTab("final-result")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'final-result' ? 'bg-slate-900 text-white shadow-md' : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:bg-white/5'}`}
            >
              <Trophy size={16} /> Final Result
            </button>
          </div>

          <div className="py-6 md:py-10 px-4 md:px-8 lg:px-12 max-w-5xl mx-auto space-y-8 w-full">

            {activeTab === 'overview' && (
              <>
                {/* Hero Section */}
                <div id="overview" className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-8">
                    
                    <div className="space-y-6">
                      <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-white">
                          {drive.title}
                        </h1>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Building2 size={18} />
                          <span className="font-semibold text-lg">{drive.department || "Organization"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${drive.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${drive.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-50 dark:bg-white/50'}`}></span>
                          {drive.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-amber-500" />
                            <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Clock size={18} className="text-amber-500" />
                          <span>{totalDuration} mins</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-purple-500" />
                          <span>{drive.location || 'Online'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 min-w-[200px]">
                      {currentRoundStatus === "Schedule Not Decided" ? (
                        <button disabled className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 font-bold py-3.5 px-6 rounded-xl text-center cursor-not-allowed border border-slate-200 dark:border-slate-700">
                          Schedule to be Decided
                        </button>
                      ) : currentRoundStatus === "Scheduled" ? (
                        <button disabled className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 font-bold py-3.5 px-6 rounded-xl text-center cursor-not-allowed border border-slate-200 dark:border-slate-700">
                          Starts: {currentRoundStartDate?.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </button>
                      ) : currentRoundStatus === "Finished" ? (
                        <button disabled className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 font-bold py-3.5 px-6 rounded-xl text-center cursor-not-allowed border border-slate-200 dark:border-slate-700">
                          Round Finished
                        </button>
                      ) : currentRoundStatus === "Submitted" ? (
                        <button disabled className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold py-3.5 px-6 rounded-xl text-center cursor-not-allowed border border-emerald-200 dark:border-emerald-800">
                          Assessment Completed
                        </button>
                      ) : currentRoundStatus === "Live" ? (
                        pipelineSteps[currentStageIndex].type !== 'Online Assessment' ? (
                          <Link href={`/interview/live_${assessment.id}?role=candidate&stageId=${pipelineSteps[currentStageIndex].id}`} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl text-center shadow-md shadow-purple-500/20 transition-all hover:scale-105 active:scale-95">
                            Live - Join Interview
                          </Link>
                        ) : (
                          <Link href={`/assessment/${drive.id}/${pipelineSteps[currentStageIndex].id}`} className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 px-6 rounded-xl text-center shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95">
                            Live - Start Assessment
                          </Link>
                        )
                      ) : (
                        <button disabled className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 font-bold py-3.5 px-6 rounded-xl text-center cursor-not-allowed border border-slate-200 dark:border-slate-700">
                          Assessment Locked
                        </button>
                      )}
                      {currentStageIndex === pipelineSteps.length - 1 && (
                        <button className="bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-white/10 hover:border-slate-300 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-xl text-center transition">
                          View Result
                        </button>
                      )}
                    </div>
                    
                  </div>
                </div>

                {/* 3. Current Round Summary */}
                {currentStageIndex > 0 && currentStageIndex < pipelineSteps.length - 1 && (
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Current Round</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-medium">Your currently active assessment round.</p>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-700 dark:text-slate-300 space-y-6 w-full lg:w-3/4">
                      <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pipelineSteps[currentStageIndex].name}</h3>
                         <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">Active</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center text-amber-500">
                             <Calendar size={18} />
                           </div>
                           <div>
                             <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Date</div>
                             <div className="font-semibold text-slate-900 dark:text-white">{pipelineSteps[currentStageIndex].startDate ? new Date(pipelineSteps[currentStageIndex].startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'To be determined'}</div>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center text-amber-500">
                             <Clock size={18} />
                           </div>
                           <div>
                             <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Time</div>
                             <div className="font-semibold text-slate-900 dark:text-white">
                               {pipelineSteps[currentStageIndex].startDate 
                                 ? `${new Date(pipelineSteps[currentStageIndex].startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${pipelineSteps[currentStageIndex].endDate ? ` - ${new Date(pipelineSteps[currentStageIndex].endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}` 
                                 : 'TBD'}
                             </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 flex items-center justify-center text-emerald-500">
                             <Hourglass size={18} />
                           </div>
                           <div>
                             <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">Duration</div>
                             <div className="font-semibold text-slate-900 dark:text-white">{pipelineSteps[currentStageIndex].duration || '60 mins'}</div>
                           </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 flex">
                        {currentRoundStatus === "Schedule Not Decided" ? (
                          <span className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 py-2.5 px-5 rounded-xl font-semibold shadow-md cursor-not-allowed">
                            Schedule to be Decided
                          </span>
                        ) : currentRoundStatus === "Scheduled" ? (
                          <span className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 py-2.5 px-5 rounded-xl font-semibold shadow-md cursor-not-allowed">
                            Starts: {currentRoundStartDate?.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </span>
                        ) : currentRoundStatus === "Finished" ? (
                          <span className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-400 py-2.5 px-5 rounded-xl font-semibold shadow-md cursor-not-allowed">
                            Round Finished
                          </span>
                        ) : currentRoundStatus === "Live" ? (
                          pipelineSteps[currentStageIndex].type !== 'Online Assessment' ? (
                            <Link href={`/interview/live_${assessment.id}?role=candidate&stageId=${pipelineSteps[currentStageIndex].id}`} className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-5 rounded-xl font-semibold transition-colors shadow-md">
                              Live - Join Interview <ChevronRight size={18} />
                            </Link>
                          ) : (
                            <Link href={`/assessment/${drive.id}/${pipelineSteps[currentStageIndex].id}`} className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-5 rounded-xl font-semibold transition-colors shadow-md">
                              Live - Start Assessment <ChevronRight size={18} />
                            </Link>
                          )
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Recruiter Announcements */}
                {drive.announcements && drive.announcements.length > 0 && (
                  <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Megaphone className="text-amber-500" /> Recruiter Announcements
                      </h2>
                    </div>
                    
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6 space-y-4 w-full">
                       {drive.announcements.map((ann: any, idx: number) => (
                         <div key={idx} className="flex items-start gap-4 p-3 bg-white dark:bg-[#0f172a] rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                            <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div></div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">{ann.title}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{ann.description}</div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'timeline' && (
              <>
                {/* Drive Progress Section */}
                <div id="timeline" className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-sm">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Drive Progress</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium">Track your current stage in the hiring pipeline.</p>

                  <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-slate-100 dark:bg-white/10 z-0"></div>

                    <div className="space-y-4 relative z-10">
                      {pipelineSteps.map((step, index) => {
                        let stepState = "locked"; 
                        if (index < currentStageIndex) stepState = "passed";
                        else if (index === currentStageIndex) stepState = "active";

                        return (
                          <div key={index} className="flex gap-4 relative group">
                            
                            {/* Status Indicator */}
                            <div className="flex-shrink-0 mt-0.5 relative bg-white dark:bg-[#0f172a]">
                              {stepState === "passed" && (
                                <div className="w-8 h-8 bg-emerald-50 border-2 border-emerald-500 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shadow-sm">
                                  <CheckCircle2 size={16} className="text-emerald-600" />
                                </div>
                              )}
                              {stepState === "active" && (
                                <div className="w-8 h-8 bg-amber-50 dark:bg-amber-500/20 border-2 border-amber-600 dark:border-amber-500 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shadow-sm">
                                  <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
                                </div>
                              )}
                              {stepState === "locked" && (
                                <div className="w-8 h-8 bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center relative z-10 transition-transform group-hover:scale-110">
                                  <div className="w-2 h-2 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                                </div>
                              )}
                            </div>

                            {/* Step Content */}
                            <div className={`flex-1 p-4 rounded-xl border transition-all ${
                              stepState === 'active' 
                                ? 'bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 shadow-sm shadow-amber-500/5 dark:shadow-none' 
                                : stepState === 'passed'
                                ? 'bg-white dark:bg-[#0f172a] border-slate-100 dark:border-white/5 hover:border-slate-200 dark:border-white/10 hover:shadow-sm'
                                : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 opacity-60'
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                <div>
                                  <h3 className={`text-base font-bold ${
                                    stepState === 'active' ? 'text-amber-900 dark:text-amber-400' :
                                    stepState === 'passed' ? 'text-slate-900 dark:text-white' :
                                    'text-slate-500 dark:text-slate-400'
                                  }`}>
                                    {step.name}
                                  </h3>
                                  <p className={`text-xs mt-0.5 font-semibold ${
                                    stepState === 'active' ? 'text-amber-600 dark:text-amber-500' :
                                    stepState === 'passed' ? 'text-emerald-600' :
                                    'text-slate-400 dark:text-slate-500'
                                  }`}>
                                    {stepState === 'active' ? 'Current Stage' :
                                     stepState === 'passed' ? 'Completed' : 'Locked'}
                                  </p>
                                </div>
                                
                                {stepState === 'active' && step.type !== 'system' && (
                                  <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider self-start">
                                    Action Required
                                  </span>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Round Timeline Table */}
                <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
                   <div className="space-y-1">
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Round Timeline Table</h2>
                     <p className="text-slate-500 dark:text-slate-400 font-medium">Summary of all rounds and their status.</p>
                   </div>
                   
                   <div className="w-full text-left text-sm mt-6 overflow-x-auto">
                     <table className="w-full min-w-[500px]">
                       <thead>
                         <tr className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200 dark:border-white/10">
                            <th className="pb-4 font-bold text-left">Round</th>
                            <th className="pb-4 font-bold text-left">Status</th>
                            <th className="pb-4 font-bold text-left">Date</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {pipelineSteps.filter(s => s.type !== 'system').map((step, index) => {
                            const actualStepIndex = pipelineSteps.findIndex(s => s.name === step.name);
                            let stepState = "locked"; 
                            if (actualStepIndex < currentStageIndex) stepState = "passed";
                            else if (actualStepIndex === currentStageIndex) stepState = "active";
                            
                            return (
                               <tr key={index} className="group">
                                  <td className="py-5 font-semibold text-slate-900 dark:text-white">{step.name}</td>
                                  <td className="py-5">
                                     <div className="flex items-center gap-2 font-medium">
                                       {stepState === "passed" && <><div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-md"><CheckCircle2 size={16}/></div> <span className="text-slate-700 dark:text-slate-300">Passed</span></>}
                                       {stepState === "active" && <><div className="bg-amber-50 text-amber-600 p-1.5 rounded-md"><Hourglass size={16}/></div> <span className="text-slate-700 dark:text-slate-300">Upcoming</span></>}
                                       {stepState === "locked" && <><div className="bg-slate-50 dark:bg-white/5 text-slate-400 dark:text-slate-500 p-1.5 rounded-md"><Lock size={16}/></div> <span className="text-slate-400 dark:text-slate-500">Locked</span></>}
                                     </div>
                                  </td>
                                  <td className="py-5 text-slate-500 dark:text-slate-400 font-medium">
                                     {step.startDate ? new Date(step.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : '-'}
                                  </td>
                               </tr>
                            );
                         })}
                       </tbody>
                     </table>
                   </div>
                </div>
              </>
            )}

            {activeTab.startsWith('round-') && (
              <>
                {(() => {
                  const roundIdx = parseInt(activeTab.split('-')[1]);
                  const round = roundSteps[roundIdx];
                  if (!round) return null;
                  const isAssessment = round.name.toLowerCase().includes('assessment');

                  return (
                    <div className="space-y-8">
                      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{round.name}</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">Details for this specific round.</p>
                        
                        {isAssessment ? (
                          <div className="space-y-8">
                            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6 w-full lg:w-3/4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                  <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Format</div>
                                  <div className="font-semibold text-slate-900 dark:text-white">{round.config?.format || "Standard Assessment"}</div>
                                </div>
                                <div className="bg-white dark:bg-[#0f172a] p-4 rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">
                                  <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase mb-1">Time Limit</div>
                                  <div className="font-semibold text-slate-900 dark:text-white">{round.duration || '90'} mins</div>
                                </div>
                              </div>
                              
                              <div className="pt-2">
                                <div className="text-slate-500 dark:text-slate-400 font-semibold mb-3">Allowed Languages</div>
                                <div className="flex flex-wrap gap-2">
                                  {round.config?.allowedLanguages?.map((lang: string) => (
                                    <span key={lang} className="px-3 py-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">{lang}</span>
                                  )) || (
                                    <span className="px-3 py-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">All</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-6 text-amber-900 w-full lg:w-3/4">
                              <div className="font-bold flex items-center gap-2 mb-4">
                                <FileText size={18} className="text-amber-600" /> Assessment Rules
                              </div>
                              <ul className="space-y-3">
                                {round.config?.rules?.map((rule: string, idx: number) => (
                                  <li key={idx} className="flex gap-3">
                                    <CheckCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">{rule}</span>
                                  </li>
                                )) || (
                                  <li className="flex gap-3">
                                    <CheckCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span className="font-medium">Standard rules apply.</span>
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-700 dark:text-slate-300 w-full lg:w-3/4">
                            <p>Information for this round will be provided closer to the start date.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {activeTab === 'final-result' && (
              <>
                {/* 8. My Performance */}
                <div id="final-result" className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-sm space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Performance</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Available after completing rounds.</p>
                  </div>
                  
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full lg:w-3/4">
                    <div className="grid grid-cols-3 gap-4 text-center divide-x divide-slate-200">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Score</div>
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{assessment.score || "-"}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Rank</div>
                        <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{assessment.rank || "-"}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Result</div>
                        <div className={`text-2xl font-extrabold mt-1 ${assessment.status === 'Passed' ? 'text-emerald-500' : assessment.status === 'Rejected' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>{assessment.status || "In Review"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

  );
}
