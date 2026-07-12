"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, FileCode, LineChart, Loader2, LayoutDashboard, Calendar, Settings as SettingsIcon, Activity, Search, Filter, ChevronDown, Plus, Download, Shuffle, Library, Eye, Edit2, Trash2, Share2, MoreHorizontal, Clock, ArrowRight } from "lucide-react";

export default function StageDetailsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const stageId = params.stageId as string;
  
  type TabType = "overview" | "candidates" | "questions" | "schedule" | "analysis" | "settings";
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const recruiterId = localStorage.getItem('userId');
        const res = await fetch(`http://localhost:3001/db/drives/${jobId}`, {
          headers: { 'x-user-id': recruiterId || '' }
        });
        const json = await res.json();
        if (json.success) setJob(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) {
    return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  if (!job) return <div>Job not found</div>;

  const currentStage = job.rounds?.find((s: any) => s.id === stageId);
  if (!currentStage) return <div>Stage not found</div>;

  // Filter candidates specifically for this stage (for the Candidates Tab)
  const stageCandidates = job.candidates?.filter((c: any) => c.stage === currentStage.name) || [];

  // Metrics logic for the Overview Tab
  let invited = 0;
  let completed = 0;
  let qualified = 0;

  const roundIndex = job.rounds?.findIndex((r: any) => r.id === stageId) || 0;
  
  job.candidates?.forEach((c: any) => {
    const cRoundIndex = job.rounds?.findIndex((r: any) => r.name === c.stage) || 0;
    
    if (cRoundIndex >= roundIndex) {
      invited++;
      if (cRoundIndex > roundIndex) {
        completed++;
        qualified++;
      } else if (cRoundIndex === roundIndex) {
        if (c.status === 'Passed') {
          completed++;
          qualified++;
        } else if (c.status === 'Rejected') {
          completed++;
        }
      }
    }
  });

  const passRate = invited > 0 ? Math.round((qualified / invited) * 100) : 0;
  
  // Status logic
  let statusText = 'Draft';
  let statusColor = 'bg-slate-200 text-slate-700';
  let startsInText = '';

  if (currentStage.startDate) {
    const now = new Date();
    const start = new Date(currentStage.startDate);
    
    if (start > now) {
      statusText = 'Scheduled';
      statusColor = 'bg-emerald-100 text-emerald-700';
      const diffTime = Math.abs(start.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      startsInText = `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
    } else {
      if (currentStage.endDate) {
        const end = new Date(currentStage.endDate);
        if (end < now) {
          statusText = 'Completed';
          statusColor = 'bg-slate-100 text-slate-700';
          startsInText = 'Ended';
        } else {
          statusText = 'Live';
          statusColor = 'bg-blue-100 text-blue-700';
          startsInText = 'Started';
        }
      } else {
        statusText = 'Live';
        statusColor = 'bg-blue-100 text-blue-700';
        startsInText = 'Started';
      }
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-3">
              <Link href={`/recruiter/drives/${jobId}`} className="hover:text-slate-900 transition-colors">Software Engineer</Link>
              <span>/</span>
              <Link href={`/recruiter/drives/${jobId}/pipeline`} className="hover:text-slate-900 transition-colors">Pipeline</Link>
              <span>/</span>
              <span className="text-slate-900">Round Details</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">{currentStage.name}</h1>
            
            <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-sm text-slate-600 font-medium">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${statusColor}`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                {statusText}
              </span>
              
              {currentStage.startDate ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={16} className="text-slate-400" /> 
                    {new Date(currentStage.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} className="text-slate-400" /> 
                    {new Date(currentStage.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    <ArrowRight size={14} className="text-slate-400" />
                    {currentStage.endDate ? new Date(currentStage.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD'}
                  </span>
                </>
              ) : (
                <span className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-400" /> No Schedule</span>
              )}

              <span className="flex items-center gap-1.5 border-l border-slate-200 pl-5"><Clock size={16} className="text-slate-400" /> {currentStage.duration || '90 mins'}</span>
              <span className="flex items-center gap-1.5 border-l border-slate-200 pl-5"><Users size={16} className="text-slate-400" /> {invited} Candidates</span>
              <span className="flex items-center gap-1.5 border-l border-slate-200 pl-5"><Activity size={16} className="text-slate-400" /> {passRate}% Pass Rate</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              Edit Round
            </button>
            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
              Publish
            </button>
            <button className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm tooltip-trigger" title="Share Link">
              <Share2 size={18} />
            </button>
            <button className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm tooltip-trigger" title="More Options">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <LayoutDashboard size={16} /> Overview
        </button>
        <button 
          onClick={() => setActiveTab("candidates")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'candidates' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Users size={16} /> Candidates ({stageCandidates.length})
        </button>
        <button 
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'questions' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <FileCode size={16} /> Questions
        </button>
        <button 
          onClick={() => setActiveTab("schedule")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'schedule' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Calendar size={16} /> Schedule
        </button>
        <button 
          onClick={() => setActiveTab("analysis")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'analysis' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <LineChart size={16} /> Analysis
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <SettingsIcon size={16} /> Settings
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        
        {/* Overview View */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Candidates Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <Users className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Candidates</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 font-medium">Invited</span>
                  <span className="text-slate-900 font-bold text-lg">{invited}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 font-medium">Appeared</span>
                  <span className="text-slate-900 font-bold text-lg">{completed}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 font-medium">Qualified</span>
                  <span className="text-slate-900 font-bold text-lg">{qualified}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-500 font-medium">Pass Rate</span>
                  <span className="text-emerald-600 font-bold text-lg bg-emerald-50 px-2.5 py-1 rounded-lg">{passRate}%</span>
                </div>
              </div>
            </div>

            {/* Assessment Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <FileCode className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Assessment</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 font-medium">Duration</span>
                  <span className="text-slate-900 font-bold">{currentStage.duration}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 font-medium">Format</span>
                  <span className="text-slate-900 font-medium text-right text-sm">4 Coding Problems<br/>20 MCQs</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                  <span className="text-slate-500 font-medium">Passing Score</span>
                  <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-lg">70%</span>
                </div>
                <div className="flex justify-between items-start pt-2">
                  <span className="text-slate-500 font-medium">Languages</span>
                  <div className="flex gap-2">
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">C++</span>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">Java</span>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-1 rounded">Python</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Schedule</h3>
              </div>
              {currentStage.startDate ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <span className="text-slate-500 font-medium">Date</span>
                    <span className="text-slate-900 font-bold">{new Date(currentStage.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                    <span className="text-slate-500 font-medium">Time Window</span>
                    <div className="text-right">
                      <div className="text-slate-900 font-bold">{new Date(currentStage.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                      <div className="text-slate-400 text-xs text-center">to</div>
                      <div className="text-slate-900 font-bold">{currentStage.endDate ? new Date(currentStage.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD'}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-500 font-medium">Timezone</span>
                    <span className="text-slate-700 font-medium bg-slate-100 px-2 py-1 rounded text-sm">{currentStage.timeZone || 'UTC'}</span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 flex flex-col items-center">
                  <Calendar size={24} className="mb-2 text-slate-300" />
                  No schedule set
                </div>
              )}
            </div>

            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="text-slate-400" size={20} />
                <h3 className="text-lg font-bold text-slate-900">Status</h3>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${statusColor}`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    {statusText}
                  </span>
                </div>
                {startsInText && (
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <span className="text-slate-500 font-medium">{statusText === 'Scheduled' ? 'Starts in' : 'Timing'}</span>
                    <span className="text-slate-900 font-bold text-xl">{startsInText}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Candidates View */}
        {activeTab === "candidates" && (
          <div className="space-y-4">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search candidates by name or email..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative group z-10">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                    <Filter size={16} /> Filters <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-2 flex flex-col gap-1 text-sm text-slate-700">
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer"><input type="checkbox" className="rounded border-slate-300" /> Qualified</label>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer"><input type="checkbox" className="rounded border-slate-300" /> Rejected</label>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer"><input type="checkbox" className="rounded border-slate-300" /> Pending</label>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer"><input type="checkbox" className="rounded border-slate-300" /> Absent</label>
                      <label className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded cursor-pointer"><input type="checkbox" className="rounded border-slate-300" /> Cheating Flagged</label>
                    </div>
                  </div>
                </div>

                <div className="relative group z-10">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                    Bulk Actions <ChevronDown size={14} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-1 flex flex-col text-sm text-slate-700">
                      <button className="px-4 py-2 text-left hover:bg-slate-50">Export</button>
                      <button className="px-4 py-2 text-left hover:bg-slate-50">Email</button>
                      <button className="px-4 py-2 text-left hover:bg-slate-50">Move to Next Round</button>
                      <button className="px-4 py-2 text-left hover:bg-slate-50 text-rose-600">Reject</button>
                      <button className="px-4 py-2 text-left hover:bg-slate-50">Download Reports</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4 w-10"><input type="checkbox" className="rounded border-slate-300" /></th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4">Submission Time</th>
                    <th className="px-6 py-4">Time Taken</th>
                    <th className="px-6 py-4">Qualified</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stageCandidates.length === 0 ? (
                    <tr><td colSpan={9} className="px-6 py-8 text-center text-slate-500">No candidates currently in this stage.</td></tr>
                  ) : stageCandidates.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300" /></td>
                      <td className="px-6 py-4 font-semibold text-slate-900">{c.name}</td>
                      <td className="px-6 py-4 text-slate-500">{c.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          c.status === "Passed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          c.status === "In Review" ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{c.score || '-'}</td>
                      <td className="px-6 py-4 text-slate-500">-</td>
                      <td className="px-6 py-4 text-slate-500">-</td>
                      <td className="px-6 py-4">
                        {c.status === 'Passed' ? <span className="text-emerald-600 font-semibold">Yes</span> : <span className="text-slate-400">No</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity">Review</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Questions View */}
        {activeTab === "questions" && (
          <div className="space-y-6">
            
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <FileCode size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Assessment Questions</h3>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap">
                  <Library size={16} /> Question Bank
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap">
                  <Shuffle size={16} /> Randomize
                </button>
                <button className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap">
                  <Download size={16} /> Import
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
                  <Plus size={16} /> Add Question
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Left Sidebar (Question Types) */}
              <div className="w-full md:w-56 shrink-0">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</div>
                  <div className="space-y-1">
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg transition-colors">
                      Coding <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">2</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      MCQ <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">10</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      SQL <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">1</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      Debugging <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">0</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      Subjective <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">0</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Cards List */}
              <div className="flex-1 space-y-4">
                
                {[
                  { id: 1, title: "Two Sum", type: "Coding", difficulty: "Easy", marks: 10, tags: ["Arrays", "Hash Table"] },
                  { id: 2, title: "Reverse Linked List", type: "Coding", difficulty: "Medium", marks: 20, tags: ["Linked List", "Recursion"] },
                  { id: 3, title: "Find Nth Highest Salary", type: "SQL", difficulty: "Hard", marks: 30, tags: ["Database", "Subquery"] },
                ].map(q => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{q.type}</span>
                        <span className="text-slate-300">•</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                          q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                          q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">{q.title}</h4>
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                          <span className="text-blue-600 font-bold">{q.marks}</span> Marks
                        </div>
                        <div className="flex gap-1.5">
                          {q.tags.map(t => (
                            <span key={t} className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="Preview">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip-trigger" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tooltip-trigger" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>
        )}

        {/* Analysis View */}
        {activeTab === "analysis" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="text-slate-500 font-medium text-sm mb-1">Pass Rate</div>
                <div className="text-3xl font-bold text-slate-900">
                  {stageCandidates.length > 0 
                    ? Math.round((stageCandidates.filter((c:any) => c.status === 'Passed').length / stageCandidates.length) * 100) + '%' 
                    : '-'}
                </div>
             </div>
             <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="text-slate-500 font-medium text-sm mb-1">Avg Score</div>
                <div className="text-3xl font-bold text-slate-900">84/100</div>
             </div>
          </div>
        )}

        {/* Schedule View */}
        {activeTab === "schedule" && (
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assessment Schedule</h3>
                <p className="text-slate-500 text-sm">Configure timing and access rules for this round.</p>
              </div>
              <button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm">
                Save Changes
              </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-900 mb-4">Timing Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="2026-07-25" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Timezone</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Asia/Kolkata (IST)</option>
                      <option>UTC</option>
                      <option>America/New_York (EST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                    <input type="time" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="10:00" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
                    <input type="time" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="11:30" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 90 mins" defaultValue={currentStage?.duration || "90 mins"} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Deadline</label>
                    <input type="datetime-local" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">Extra Options</h4>
                <div className="space-y-5">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Allow Late Join</div>
                      <div className="text-xs text-slate-500">Permit candidates to start the assessment after the start time.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Grace Period</div>
                      <div className="text-xs text-slate-500">Additional time allowed before auto-submission.</div>
                    </div>
                    <select className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32">
                      <option>5 mins</option>
                      <option>10 mins</option>
                      <option>15 mins</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Auto Start</div>
                      <div className="text-xs text-slate-500">Automatically start the assessment at the scheduled time.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Auto End</div>
                      <div className="text-xs text-slate-500">Automatically submit all active assessments at the end time.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Publish Schedule</div>
                      <div className="text-xs text-slate-500">Make this schedule visible to invited candidates.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings View */}
        {activeTab === "settings" && (
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Stage Settings</h3>
                <p className="text-slate-500 text-sm">Configure security, proctoring, and general round settings.</p>
              </div>
              <button className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm">
                Save Settings
              </button>
            </div>

            {/* General Settings Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">General Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Round Name</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue={currentStage?.name || "Round"} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Round Type</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue={currentStage?.type || "Assessment"}>
                      <option value="Assessment">Assessment</option>
                      <option value="Interview">Interview</option>
                      <option value="Project">Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                    <select className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Active</option>
                      <option>Draft</option>
                      <option>Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration</label>
                    <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue={currentStage?.duration || "60 mins"} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Passing Score (%)</label>
                    <input type="number" className="w-full md:w-1/2 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue="70" />
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Settings */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">Assessment Settings</h4>
                <div className="space-y-4">
                  {[
                    { label: "Shuffle Questions", desc: "Present questions in a random order for each candidate.", default: true },
                    { label: "Shuffle MCQs", desc: "Randomize the order of options for multiple choice questions.", default: true },
                    { label: "Negative Marking", desc: "Deduct marks for incorrect answers.", default: false },
                    { label: "Multiple Attempts", desc: "Allow candidates to retake the assessment.", default: false },
                    { label: "Save Progress", desc: "Automatically save answers as the candidate progresses.", default: true },
                  ].map(setting => (
                    <div key={setting.label} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{setting.label}</div>
                        <div className="text-xs text-slate-500">{setting.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={setting.default} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">Security</h4>
                <div className="space-y-4">
                  {[
                    { label: "Webcam Proctoring", desc: "Require candidates to keep their webcam on during the assessment.", default: true },
                    { label: "Tab Switching Detection", desc: "Flag candidates who switch browser tabs.", default: true },
                    { label: "Copy Paste Disabled", desc: "Prevent candidates from copying or pasting text.", default: true },
                    { label: "Full Screen Mode", desc: "Enforce full screen mode during the assessment.", default: true },
                    { label: "Screen Recording", desc: "Record the candidate's screen during the test.", default: false },
                    { label: "Face Detection", desc: "Detect if multiple faces or no faces are visible.", default: true },
                    { label: "Multiple Monitor Detection", desc: "Flag candidates using more than one screen.", default: false },
                    { label: "Browser Lock", desc: "Lock down the browser using secure assessment tools.", default: false },
                  ].map(setting => (
                    <div key={setting.label} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{setting.label}</div>
                        <div className="text-xs text-slate-500">{setting.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={setting.default} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submission */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">Submission</h4>
                <div className="space-y-4">
                  {[
                    { label: "Auto Submit", desc: "Automatically submit when time expires.", default: true },
                    { label: "Late Submission", desc: "Allow submissions after the time limit (marked as late).", default: false },
                    { label: "Manual Review Required", desc: "Require a recruiter to manually review the submission before scoring.", default: false },
                  ].map(setting => (
                    <div key={setting.label} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{setting.label}</div>
                        <div className="text-xs text-slate-500">{setting.desc}</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked={setting.default} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
