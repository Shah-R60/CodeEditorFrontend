"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Award, Loader2, Download, X, ExternalLink, FileText, Code, Briefcase, Check, UserX, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { CandidateDetailsSidebar } from "@/components/common/CandidateDetailsSidebar";

const parseScore = (scoreStr: string) => {
  if (!scoreStr) return { earned: 0, total: 0 };
  const parts = scoreStr.toString().split('/');
  if (parts.length === 2) {
    return { earned: parseFloat(parts[0]) || 0, total: parseFloat(parts[1]) || 0 };
  }
  return { earned: parseFloat(scoreStr) || 0, total: 100 }; 
};

const getRoundScore = (candidate: any, round: any, idx: number) => {
  if (candidate?.stageData) {
    let stageData = candidate.stageData;
    if (typeof stageData === 'string') {
       try { stageData = JSON.parse(stageData); } catch(e) {}
    }
    const roundData = stageData[round.id];
    if (roundData && roundData.score) {
      return roundData.score.toString();
    }
  }
  return '0/0';
};

const getOverallScore = (candidate: any, job: any) => {
  let totalEarned = 0;
  let totalMax = 0;
  
  const roundsToProcess = (job?.rounds && job.rounds.length > 0) 
    ? job.rounds 
    : [
        { id: 'mock1', name: 'Online Assessment', type: 'OA' },
        { id: 'mock2', name: 'Technical Interview', type: 'Technical' }
      ];

  roundsToProcess.forEach((round: any, idx: number) => {
    const scoreStr = getRoundScore(candidate, round, idx);
    const parsed = parseScore(scoreStr);
    totalEarned += parsed.earned;
    totalMax += parsed.total;
  });

  return { 
    display: totalMax > 0 ? `${totalEarned}/${totalMax}` : (candidate?.score || '0/0'),
    earned: totalEarned,
    max: totalMax
  };
};

export default function FinalSelectionPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  const [confirmDialog, setConfirmDialog] = useState<{ candidateId: string, status: string } | null>(null);

  const handleCandidateDecision = (candidateId: string, status: string) => {
    setConfirmDialog({ candidateId, status });
  };

  const executeDecision = async () => {
    if (!confirmDialog) return;
    const { candidateId, status } = confirmDialog;

    try {
      const res = await fetch(`http://localhost:3001/db/drives/${jobId}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const json = await res.json();
      if (json.success) {
        setJob((prev: any) => ({
          ...prev,
          candidates: prev.candidates.map((c: any) => c.id === candidateId ? { ...c, status } : c)
        }));
        setSelectedCandidate(null);
        setConfirmDialog(null);
      } else {
        alert(json.error || "Failed to update candidate status");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

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

  const finalCandidates = job.candidates?.filter((c: any) => ["Passed", "Selected", "Hired", "Rejected"].includes(c.status)) || [];

  const enrichedCandidates = finalCandidates.map((c: any) => ({
    ...c,
    computedScore: getOverallScore(c, job)
  }));

  const totalEarned = enrichedCandidates.reduce((acc: number, curr: any) => acc + curr.computedScore.earned, 0);
  const avgScore = enrichedCandidates.length > 0 ? (totalEarned / enrichedCandidates.length).toFixed(1) : "0.0";

  const handleExportCSV = () => {
    if (!enrichedCandidates.length) return;
    const headers = ["Name", "Email", "Overall Score", "Completed On"];
    const rows = enrichedCandidates.map((c: any) => [
      c.name,
      c.email,
      c.computedScore.display,
      new Date(c.createdAt).toLocaleDateString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "qualified_candidates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
        
        {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="text-emerald-500" size={24} /> Qualified Candidates
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Candidates who successfully cleared all rounds of this hiring drive.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={finalCandidates.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Download size={16} />
          Export Qualified Candidates
        </button>
      </div>

      {/* Summary */}
      <div className="bg-slate-900 dark:bg-[#0f172a] border border-transparent dark:border-white/10 text-white rounded-xl p-6 shadow-md flex items-center justify-between">
        <div>
          <div className="text-slate-400 text-sm font-medium mb-1">Qualified Candidates</div>
          <div className="text-3xl font-bold text-emerald-400">{finalCandidates.length}</div>
        </div>
        <div className="h-12 w-px bg-slate-700"></div>
        <div className="text-right">
          <div className="text-slate-400 text-sm font-medium mb-1">Average Final Score</div>
          <div className="text-3xl font-bold text-white">{avgScore}</div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Overall Score</th>
                <th className="px-6 py-4">Completed On</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {finalCandidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                    <Award size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <div className="font-semibold text-slate-900 dark:text-white text-base mb-1">No candidates have completed all hiring rounds yet.</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">Candidates who pass every round will automatically appear here.</div>
                    <Link href={`/recruiter/drives/${jobId}/pipeline`} className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors px-5 py-2 rounded-lg font-semibold text-sm shadow-sm">
                      Go to Pipeline
                    </Link>
                  </td>
                </tr>
              ) : enrichedCandidates.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">{c.email}</span>
                      {(c.status === 'Selected' || c.status === 'Hired') && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">HIRED</span>}
                      {c.status === 'Rejected' && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">REJECTED</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{c.computedScore.display}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {(c.status !== 'Selected' && c.status !== 'Hired' && c.status !== 'Rejected') ? (
                      <button 
                        onClick={() => setSelectedCandidate(c)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors px-4 py-1.5 rounded-lg font-medium text-sm"
                      >
                        View Results
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-slate-400 dark:text-slate-500 italic">Decision Final</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <CandidateDetailsSidebar
        candidate={selectedCandidate}
        job={job}
        onClose={() => setSelectedCandidate(null)}
        onSelect={() => handleCandidateDecision(selectedCandidate.id, 'Selected')}
        onReject={() => handleCandidateDecision(selectedCandidate.id, 'Rejected')}
      />

      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-2">
                <div className={`p-3 rounded-full shrink-0 ${confirmDialog.status === 'Selected' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                  {confirmDialog.status === 'Selected' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {confirmDialog.status === 'Selected' ? 'Select Candidate' : 'Reject Candidate'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {confirmDialog.status === 'Selected' 
                      ? 'Are you sure you want to select this candidate? This will immediately send them an official offer email.'
                      : 'Are you sure you want to reject this candidate? This will immediately send them a rejection email.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDecision}
                className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm ${
                  confirmDialog.status === 'Selected' 
                    ? 'bg-emerald-500 hover:bg-emerald-600' 
                    : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                Confirm {confirmDialog.status === 'Selected' ? 'Selection' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
