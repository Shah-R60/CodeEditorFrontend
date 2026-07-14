"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Users, FileCode, LineChart, Loader2, LayoutDashboard, Calendar, Settings as SettingsIcon, Activity, Search, Filter, ChevronDown, Plus, Download, Shuffle, Library, Eye, Edit2, Trash2, Share2, MoreHorizontal, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from 'recharts';

export default function StageDetailsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const stageId = params.stageId as string;

  type TabType = "overview" | "candidates" | "questions" | "schedule" | "analysis" | "settings";
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals & Questions State
  const [globalQuestions, setGlobalQuestions] = useState<any[]>([]);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [tempSelectedQuestions, setTempSelectedQuestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addQuestionForm, setAddQuestionForm] = useState({
    title: '', description: '', difficulty: 'Easy', type: 'Coding', marks: 10, tags: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    date: '', startTime: '', endTime: '', timeZone: 'Asia/Kolkata (IST)', duration: '90 mins', deadline: '',
    allowLateJoin: true, gracePeriod: '5 mins', autoStart: true, autoEnd: true, publishSchedule: true
  });
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '', type: 'Assessment', status: 'Active', duration: '60',
    shuffleQuestions: true, shuffleMCQs: true, saveProgress: true,
    tabSwitching: true, copyPaste: true, fullScreen: true,
    autoSubmit: true
  });
  const [sortConfig, setSortConfig] = useState<"none" | "score-desc">("none");

  useEffect(() => {
    if (job) {
      const stage = job.rounds?.find((s: any) => s.id === stageId);
      if (stage) {
        let dateStr = '', startStr = '', endStr = '', deadlineStr = '';
        const pad = (n: number) => n.toString().padStart(2, '0');
        if (stage.startDate) {
          const d = new Date(stage.startDate);
          dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          startStr = d.toTimeString().slice(0, 5);
        }
        if (stage.endDate) {
          const d = new Date(stage.endDate);
          endStr = d.toTimeString().slice(0, 5);
        }
        if (stage.deadline) {
          const d = new Date(stage.deadline);
          // datetime-local requires YYYY-MM-DDThh:mm format in local time
          deadlineStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
        setScheduleForm({
          date: dateStr,
          startTime: startStr,
          endTime: endStr,
          timeZone: stage.timeZone || 'Asia/Kolkata (IST)',
          duration: stage.duration || '90 mins',
          deadline: deadlineStr,
          allowLateJoin: stage.config?.allowLateJoin ?? true,
          gracePeriod: stage.config?.gracePeriod || '5 mins',
          autoStart: stage.config?.autoStart ?? true,
          autoEnd: stage.config?.autoEnd ?? true,
          publishSchedule: stage.config?.publishSchedule ?? true,
        });

        setSettingsForm({
          name: stage.name || '',
          type: stage.type || 'Assessment',
          status: stage.config?.status || 'Active',
          duration: stage.duration || '60 mins',
          shuffleQuestions: stage.config?.shuffleQuestions ?? true,
          shuffleMCQs: stage.config?.shuffleMCQs ?? true,
          saveProgress: stage.config?.saveProgress ?? true,
          tabSwitching: stage.config?.tabSwitching ?? true,
          copyPaste: stage.config?.copyPaste ?? true,
          fullScreen: stage.config?.fullScreen ?? true,
          autoSubmit: stage.config?.autoSubmit ?? true,
        });
      }
    }
  }, [job, stageId]);

  const fetchJobAndQuestions = async () => {
    try {
      const recruiterId = localStorage.getItem('userId');

      const [jobRes, questionsRes] = await Promise.all([
        fetch(`http://localhost:3001/db/drives/${jobId}`, {
          headers: { 'x-user-id': recruiterId || '' }
        }),
        fetch(`http://localhost:3001/db/questions`)
      ]);

      const jobJson = await jobRes.json();
      const questionsJson = await questionsRes.json();

      if (jobJson.success) setJob(jobJson.data);
      if (questionsJson.success) setGlobalQuestions(questionsJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobAndQuestions();
  }, [jobId]);

  if (loading) {
    return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  if (!job) return <div>Job not found</div>;

  const currentStage = job.rounds?.find((s: any) => s.id === stageId);
  if (!currentStage) return <div>Stage not found</div>;

  const updateRoundQuestions = async (newQuestionIds: string[]) => {
    try {
      const recruiterId = localStorage.getItem('userId');
      const updatedConfig = { ...(currentStage.config || {}), questions: newQuestionIds };

      const res = await fetch(`http://localhost:3001/db/drives/${jobId}/rounds/${stageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': recruiterId || ''
        },
        body: JSON.stringify({ config: updatedConfig })
      });
      const json = await res.json();
      if (json.success) {
        // Optimistically update local state
        setJob((prevJob: any) => {
          const updatedRounds = prevJob.rounds.map((r: any) =>
            r.id === stageId ? { ...r, config: updatedConfig } : r
          );
          return { ...prevJob, rounds: updatedRounds };
        });
      }
    } catch (err) {
      console.error('Error updating round questions:', err);
    }
  };

  const handleRandomize = () => {
    const currentIds = currentStage.config?.questions || [];
    if (currentIds.length <= 1) return;
    const shuffled = [...currentIds].sort(() => Math.random() - 0.5);
    updateRoundQuestions(shuffled);
  };

  const handleDeleteQuestion = (qId: string) => {
    const currentIds = currentStage.config?.questions || [];
    updateRoundQuestions(currentIds.filter((id: string) => id !== qId));
  };

  const handleAddQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const tagArray = addQuestionForm.tags.split(',').map(t => t.trim()).filter(Boolean);

      const res = await fetch(`http://localhost:3001/db/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: addQuestionForm.title,
          description: addQuestionForm.description,
          difficulty: addQuestionForm.difficulty.toUpperCase(),
          type: addQuestionForm.type,
          marks: parseInt(addQuestionForm.marks as any),
          tags: tagArray,
          testCases: [{ input: "test", expectedOutput: "test" }] // Minimum required
        })
      });

      const json = await res.json();
      if (json.success) {
        setGlobalQuestions([...globalQuestions, json.data]);
        const currentIds = currentStage.config?.questions || [];
        updateRoundQuestions([...currentIds, json.data.id]);
        setIsAddQuestionModalOpen(false);
        setAddQuestionForm({ title: '', description: '', difficulty: 'Easy', type: 'Coding', marks: 10, tags: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankSelection = (qId: string, isSelected: boolean) => {
    if (isSelected && !tempSelectedQuestions.includes(qId)) {
      setTempSelectedQuestions([...tempSelectedQuestions, qId]);
    } else if (!isSelected && tempSelectedQuestions.includes(qId)) {
      setTempSelectedQuestions(tempSelectedQuestions.filter((id: string) => id !== qId));
    }
  };

  const handleBankDone = () => {
    updateRoundQuestions(tempSelectedQuestions);
    setIsBankModalOpen(false);
  };

  const openBankModal = () => {
    setTempSelectedQuestions(currentStage.config?.questions || []);
    setIsBankModalOpen(true);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        alert("Import functionality is currently a stub for demonstration.");
      }
    };
    input.click();
  };

  const handleScheduleSubmit = async () => {
    if (!currentStage.config?.questions || currentStage.config.questions.length === 0) {
      alert("Please select at least one question in the Questions tab before saving the schedule.");
      return;
    }
    setIsSavingSchedule(true);
    try {
      const recruiterId = localStorage.getItem('userId');

      let startDateStr = null;
      let endDateStr = null;

      if (scheduleForm.date) {
        if (scheduleForm.startTime) {
          startDateStr = new Date(`${scheduleForm.date}T${scheduleForm.startTime}:00`).toISOString();
        } else {
          startDateStr = new Date(scheduleForm.date).toISOString();
        }

        if (scheduleForm.endTime) {
          endDateStr = new Date(`${scheduleForm.date}T${scheduleForm.endTime}:00`).toISOString();
        }
      }

      let deadlineObj = scheduleForm.deadline ? new Date(scheduleForm.deadline).toISOString() : null;

      const payload = {
        startDate: startDateStr,
        endDate: endDateStr,
        duration: scheduleForm.duration,
        timeZone: scheduleForm.timeZone,
        deadline: deadlineObj,
        config: {
          ...(currentStage.config || {}),
          allowLateJoin: scheduleForm.allowLateJoin,
          gracePeriod: scheduleForm.gracePeriod,
          autoStart: scheduleForm.autoStart,
          autoEnd: scheduleForm.autoEnd,
          publishSchedule: scheduleForm.publishSchedule,
        }
      };

      const res = await fetch(`http://localhost:3001/db/drives/${jobId}/rounds/${stageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': recruiterId || ''
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setJob((prevJob: any) => {
          const updatedRounds = prevJob.rounds.map((r: any) =>
            r.id === stageId ? { ...r, ...payload, config: payload.config } : r
          );
          return { ...prevJob, rounds: updatedRounds };
        });
      }
    } catch (err) {
      console.error('Error updating schedule:', err);
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSettingsSubmit = async () => {
    setIsSavingSettings(true);
    try {
      const recruiterId = localStorage.getItem('userId');
      const payload = {
        name: settingsForm.name,
        type: settingsForm.type,
        duration: settingsForm.duration,
        config: {
          ...(currentStage.config || {}),
          status: settingsForm.status,
          shuffleQuestions: settingsForm.shuffleQuestions,
          shuffleMCQs: settingsForm.shuffleMCQs,
          saveProgress: settingsForm.saveProgress,
          tabSwitching: settingsForm.tabSwitching,
          copyPaste: settingsForm.copyPaste,
          fullScreen: settingsForm.fullScreen,
          autoSubmit: settingsForm.autoSubmit,
        }
      };

      const res = await fetch(`http://localhost:3001/db/drives/${jobId}/rounds/${stageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': recruiterId || ''
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        setJob((prevJob: any) => {
          const updatedRounds = prevJob.rounds.map((r: any) =>
            r.id === stageId ? { ...r, name: payload.name, type: payload.type, duration: payload.duration, config: payload.config } : r
          );
          return { ...prevJob, rounds: updatedRounds };
        });
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  let stageCandidates = job.candidates?.filter((c: any) => c.stage === currentStage.name) || [];

  if (sortConfig === 'score-desc') {
    stageCandidates = [...stageCandidates].sort((a: any, b: any) => {
      const getScore = (s: string) => s ? parseFloat(s.split('/')[0]) : -1;
      const scoreA = getScore(a.score);
      const scoreB = getScore(b.score);
      
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      
      const getSeconds = (tt: string) => {
        if (!tt) return Infinity;
        const timePart = tt.split('_')[0];
        const mMatch = timePart.match(/(\d+)m/);
        const sMatch = timePart.match(/(\d+)s/);
        const m = mMatch ? parseInt(mMatch[1]) : 0;
        const s = sMatch ? parseInt(sMatch[1]) : 0;
        return m * 60 + s;
      };
      
      return getSeconds(a.timeTaken) - getSeconds(b.timeTaken);
    });
  }

  const roundQuestionIds = currentStage.config?.questions || [];
  const roundQuestions = roundQuestionIds
    .map((id: string) => globalQuestions.find(q => q.id === id))
    .filter(Boolean);

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
        } else if (c.status === 'Rejected' || (c.status === 'In Review' && c.score)) {
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
            <button
              onClick={fetchJobAndQuestions}
              className="p-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm tooltip-trigger"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              Edit Round
            </button>
            <button
              className="bg-slate-900 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!currentStage.config?.questions || currentStage.config.questions.length === 0}
              onClick={() => {
                if (!currentStage.config?.questions || currentStage.config.questions.length === 0) {
                  alert("You must select questions before publishing this round.");
                } else {
                  alert('Published successfully!');
                }
              }}
            >
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
                  <span className="text-slate-900 font-medium text-right text-sm">
                    {currentStage.config?.questions?.length || 0} Coding Problems<br />
                    {currentStage.config?.mcqs?.length || 0} MCQs
                  </span>
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
                <button 
                  onClick={() => setSortConfig(sortConfig === "none" ? "score-desc" : "none")}
                  className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-lg transition-colors ${sortConfig === "score-desc" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                >
                  Sort by Score
                </button>
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
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${c.status === "Passed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            c.status === "In Review" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{c.score || '-'}</td>
                      <td className="px-6 py-4 text-slate-500">
                        {c.timeTaken && c.timeTaken.includes('_')
                          ? new Date(c.timeTaken.split('_')[1]).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {c.timeTaken ? c.timeTaken.split('_')[0] : '-'}
                      </td>
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
                <button onClick={openBankModal} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap">
                  <Library size={16} /> Question Bank
                </button>
                <button onClick={handleRandomize} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap">
                  <Shuffle size={16} /> Randomize
                </button>
                <button onClick={handleImport} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap">
                  <Download size={16} /> Import
                </button>
                <button onClick={() => setIsAddQuestionModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap">
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
                      Coding <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{roundQuestions.filter((q: any) => (q.boilerplate?.type || 'Coding') === 'Coding').length}</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      MCQ <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">{roundQuestions.filter((q: any) => (q.boilerplate?.type || 'Coding') === 'MCQ').length}</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      SQL <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">{roundQuestions.filter((q: any) => (q.boilerplate?.type || 'Coding') === 'SQL').length}</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      Debugging <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">{roundQuestions.filter((q: any) => (q.boilerplate?.type || 'Coding') === 'Debugging').length}</span>
                    </button>
                    <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                      Subjective <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">{roundQuestions.filter((q: any) => (q.boilerplate?.type || 'Coding') === 'Subjective').length}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Cards List */}
              <div className="flex-1 space-y-4">
                {roundQuestions.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
                    <FileCode size={32} className="mx-auto text-slate-300 mb-3" />
                    <h4 className="text-slate-900 font-semibold mb-1">No questions added yet</h4>
                    <p className="text-slate-500 text-sm mb-4">Click "Add Question" to create one or select from the Question Bank.</p>
                  </div>
                ) : (
                  roundQuestions.map((q: any) => {
                    const qType = q.boilerplate?.type || 'Coding';
                    const qMarks = q.boilerplate?.marks || 10;
                    const qTags = q.boilerplate?.tags || [];

                    return (
                      <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{qType}</span>
                            <span className="text-slate-300">•</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${q.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-700' :
                                q.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-700' :
                                  'bg-rose-50 text-rose-700'
                              }`}>
                              {q.difficulty}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-900 mb-2">{q.title}</h4>
                          <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                              <span className="text-blue-600 font-bold">{qMarks}</span> Marks
                            </div>
                            <div className="flex gap-1.5">
                              {qTags.map((t: string) => (
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
                          <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tooltip-trigger" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Analysis View */}
        {activeTab === "analysis" && (
          <div className="space-y-6">

            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Average Score</div>
                <div className="text-2xl font-bold text-slate-900">84<span className="text-sm text-slate-400 font-normal">/100</span></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Highest</div>
                <div className="text-2xl font-bold text-emerald-600">98</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Lowest</div>
                <div className="text-2xl font-bold text-rose-600">32</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Median</div>
                <div className="text-2xl font-bold text-slate-900">86</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-slate-500 font-medium text-xs mb-1 uppercase tracking-wider">Pass Rate</div>
                <div className="text-2xl font-bold text-blue-600">
                  {stageCandidates.length > 0
                    ? Math.round((stageCandidates.filter((c: any) => c.status === 'Passed').length / stageCandidates.length) * 100) + '%'
                    : '76%'}
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Score Distribution */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Score Distribution</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { range: '0-20', count: 2 },
                      { range: '21-40', count: 5 },
                      { range: '41-60', count: 12 },
                      { range: '61-80', count: 38 },
                      { range: '81-100', count: 24 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Question Wise Accuracy */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Question Wise Accuracy</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { q: 'Q1', accuracy: 92 },
                      { q: 'Q2', accuracy: 78 },
                      { q: 'Q3', accuracy: 45 },
                      { q: 'Q4', accuracy: 64 },
                      { q: 'Q5', accuracy: 88 }
                    ]} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                      <YAxis dataKey="q" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                      <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="accuracy" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Language Usage & Completion Rate */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Language Usage</h4>
                  <div className="h-48 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Python', value: 45 },
                            { name: 'Java', value: 30 },
                            { name: 'C++', value: 15 },
                            { name: 'JavaScript', value: 10 }
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#10b981" />
                          <Cell fill="#f43f5e" />
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Completion Rate</h4>
                  <div className="h-48 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: 82 },
                            { name: 'Incomplete', value: 18 }
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={60} outerRadius={70}
                          startAngle={90} endAngle={-270}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#3b82f6" />
                          <Cell fill="#e2e8f0" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900">82%</span>
                      <span className="text-xs text-slate-500">Submitted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Timeline */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Submission Timeline</h4>
                <div className="h-48 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={[
                      { time: '10:00', count: 0 },
                      { time: '10:15', count: 5 },
                      { time: '10:30', count: 12 },
                      { time: '10:45', count: 35 },
                      { time: '11:00', count: 80 },
                      { time: '11:15', count: 120 },
                      { time: '11:30', count: 145 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                      <RechartsTooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

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
              <div className="flex items-center gap-4">
                {(!currentStage.config?.questions || currentStage.config.questions.length === 0) && (
                  <span className="text-xs text-rose-500 font-medium">Select questions first</span>
                )}
                <button
                  onClick={handleScheduleSubmit}
                  disabled={isSavingSchedule || (!currentStage.config?.questions || currentStage.config.questions.length === 0)}
                  className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingSchedule ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h4 className="text-base font-bold text-slate-900 mb-4">Timing Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                    <input type="date" value={scheduleForm.date} onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Timezone</label>
                    <select value={scheduleForm.timeZone} onChange={e => setScheduleForm({ ...scheduleForm, timeZone: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York (EST)">America/New_York (EST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time</label>
                    <input type="time" value={scheduleForm.startTime} onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time</label>
                    <input type="time" value={scheduleForm.endTime} onChange={e => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration</label>
                    <input type="text" value={scheduleForm.duration} onChange={e => setScheduleForm({ ...scheduleForm, duration: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 90 mins" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Registration Deadline</label>
                    <input type="datetime-local" value={scheduleForm.deadline} onChange={e => setScheduleForm({ ...scheduleForm, deadline: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                      <input type="checkbox" checked={scheduleForm.allowLateJoin} onChange={e => setScheduleForm({ ...scheduleForm, allowLateJoin: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Grace Period</div>
                      <div className="text-xs text-slate-500">Additional time allowed before auto-submission.</div>
                    </div>
                    <select value={scheduleForm.gracePeriod} onChange={e => setScheduleForm({ ...scheduleForm, gracePeriod: e.target.value })} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32">
                      <option value="5 mins">5 mins</option>
                      <option value="10 mins">10 mins</option>
                      <option value="15 mins">15 mins</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Auto Start</div>
                      <div className="text-xs text-slate-500">Automatically start the assessment at the scheduled time.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={scheduleForm.autoStart} onChange={e => setScheduleForm({ ...scheduleForm, autoStart: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Auto End</div>
                      <div className="text-xs text-slate-500">Automatically submit all active assessments at the end time.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={scheduleForm.autoEnd} onChange={e => setScheduleForm({ ...scheduleForm, autoEnd: e.target.checked })} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Publish Schedule</div>
                      <div className="text-xs text-slate-500">Make this schedule visible to invited candidates.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={scheduleForm.publishSchedule} onChange={e => setScheduleForm({ ...scheduleForm, publishSchedule: e.target.checked })} className="sr-only peer" />
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
              <button
                onClick={handleSettingsSubmit}
                disabled={isSavingSettings}
                className="bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm disabled:opacity-50">
                {isSavingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>

            {/* General Settings Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">General Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Round Name</label>
                    <input type="text" value={settingsForm.name} onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Round Type</label>
                    <select value={settingsForm.type} onChange={e => setSettingsForm({ ...settingsForm, type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Assessment">Assessment</option>
                      <option value="Interview">Interview</option>
                      <option value="Project">Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                    <select value={settingsForm.status} onChange={e => setSettingsForm({ ...settingsForm, status: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Active</option>
                      <option>Draft</option>
                      <option>Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Duration</label>
                    <input type="text" value={settingsForm.duration} onChange={e => setSettingsForm({ ...settingsForm, duration: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Assessment Settings */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">Assessment Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Shuffle Questions</div>
                      <div className="text-xs text-slate-500">Present questions in a random order for each candidate.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.shuffleQuestions} onChange={e => setSettingsForm({ ...settingsForm, shuffleQuestions: e.target.checked })} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Shuffle MCQs</div>
                      <div className="text-xs text-slate-500">Randomize the order of options for multiple choice questions.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.shuffleMCQs} onChange={e => setSettingsForm({ ...settingsForm, shuffleMCQs: e.target.checked })} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Save Progress</div>
                      <div className="text-xs text-slate-500">Automatically save answers as the candidate progresses.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.saveProgress} onChange={e => setSettingsForm({ ...settingsForm, saveProgress: e.target.checked })} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">Security</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Tab Switching Detection</div>
                      <div className="text-xs text-slate-500">Flag candidates who switch browser tabs.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.tabSwitching} onChange={e => setSettingsForm({ ...settingsForm, tabSwitching: e.target.checked })} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Copy Paste Disabled</div>
                      <div className="text-xs text-slate-500">Prevent candidates from copying or pasting text.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.copyPaste} onChange={e => setSettingsForm({ ...settingsForm, copyPaste: e.target.checked })} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Full Screen Mode</div>
                      <div className="text-xs text-slate-500">Enforce full screen mode during the assessment.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.fullScreen} onChange={e => setSettingsForm({ ...settingsForm, fullScreen: e.target.checked })} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h4 className="text-base font-bold text-slate-900 mb-4">Submission</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Auto Submit</div>
                      <div className="text-xs text-slate-500">Automatically submit when time expires.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={settingsForm.autoSubmit} onChange={e => setSettingsForm({ ...settingsForm, autoSubmit: e.target.checked })} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modals */}
      {isAddQuestionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Add New Question</h3>
              <button onClick={() => setIsAddQuestionModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleAddQuestionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Question Title</label>
                <input required type="text" value={addQuestionForm.title} onChange={e => setAddQuestionForm({ ...addQuestionForm, title: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Reverse Linked List" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea required value={addQuestionForm.description} onChange={e => setAddQuestionForm({ ...addQuestionForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]" placeholder="Problem statement..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Difficulty</label>
                  <select value={addQuestionForm.difficulty} onChange={e => setAddQuestionForm({ ...addQuestionForm, difficulty: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type</label>
                  <select value={addQuestionForm.type} onChange={e => setAddQuestionForm({ ...addQuestionForm, type: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Coding</option>
                    <option>MCQ</option>
                    <option>SQL</option>
                    <option>Debugging</option>
                    <option>Subjective</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Marks</label>
                  <input required type="number" value={addQuestionForm.marks} onChange={e => setAddQuestionForm({ ...addQuestionForm, marks: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags (comma separated)</label>
                  <input type="text" value={addQuestionForm.tags} onChange={e => setAddQuestionForm({ ...addQuestionForm, tags: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Arrays, Sorting" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddQuestionModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Question Bank</h3>
              <button onClick={() => setIsBankModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search questions..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {globalQuestions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No questions available in the bank.</div>
              ) : (
                globalQuestions.map(q => {
                  const isSelected = tempSelectedQuestions.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => handleBankSelection(q.id, !isSelected)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors bg-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate text-sm">{q.title}</div>
                        <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                          <span>{q.boilerplate?.type || 'Coding'}</span>
                          <span>•</span>
                          <span>{q.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0 gap-3">
              <button onClick={() => setIsBankModalOpen(false)} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent">
                Cancel
              </button>
              <button onClick={handleBankDone} className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
