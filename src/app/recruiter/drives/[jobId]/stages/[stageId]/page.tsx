"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Users, FileCode, LineChart, Loader2 } from "lucide-react";

export default function StageDetailsPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const stageId = params.stageId as string;
  
  const [activeTab, setActiveTab] = useState<"candidates" | "questions" | "analysis">("candidates");
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

  // Filter candidates specifically for this stage
  const stageCandidates = job.candidates?.filter((c: any) => c.stage === currentStage.name) || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stage Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{currentStage.name}</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
            {currentStage.type}
          </span>
          <span className="text-sm text-slate-500">{currentStage.duration}</span>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab("candidates")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'candidates' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Users size={16} /> Candidates ({stageCandidates.length})
        </button>
        <button 
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'questions' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <FileCode size={16} /> Questions
        </button>
        <button 
          onClick={() => setActiveTab("analysis")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'analysis' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <LineChart size={16} /> Analysis
        </button>
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        
        {/* Candidates View */}
        {activeTab === "candidates" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stageCandidates.length === 0 ? (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No candidates currently in this stage.</td></tr>
                ) : stageCandidates.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{c.email}</div>
                    </td>
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
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Questions View */}
        {activeTab === "questions" && (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
            <FileCode size={32} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-slate-900 font-semibold">Assessment Questions</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">Configure the coding challenges or interview script for this round.</p>
            <button className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors text-sm">
              Add Question
            </button>
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

      </div>
    </div>
  );
}
