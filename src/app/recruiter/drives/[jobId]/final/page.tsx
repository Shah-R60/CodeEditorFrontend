"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Award, Loader2, Download, X, ExternalLink, FileText, Code, Briefcase, Check, UserX } from "lucide-react";
import Link from "next/link";

export default function FinalSelectionPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

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

  const finalCandidates = job.candidates?.filter((c: any) => c.status === "Passed") || [];

  // Calculate Average Score
  const totalScore = finalCandidates.reduce((acc: number, curr: any) => {
    const scoreVal = parseFloat(curr.score) || 92; // fallback mock
    return acc + scoreVal;
  }, 0);
  const avgScore = finalCandidates.length > 0 ? (totalScore / finalCandidates.length).toFixed(1) : 0;

  const handleExportCSV = () => {
    if (!finalCandidates.length) return;
    const headers = ["Name", "Email", "Overall Score", "Completed On"];
    const rows = finalCandidates.map((c: any) => [
      c.name,
      c.email,
      c.score || '92',
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
              ) : finalCandidates.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{c.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{c.score || '92'}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => setSelectedCandidate(c)}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors px-4 py-1.5 rounded-lg font-medium text-sm"
                    >
                      View Results
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Details Drawer Overlay */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={() => setSelectedCandidate(null)}></div>
      )}

      {/* Candidate Details Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 text-slate-300 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${selectedCandidate ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedCandidate && (
          <>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedCandidate.name}</h3>
                <div className="text-slate-500 text-sm mt-1">{selectedCandidate.email}</div>
              </div>
              <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              
              {/* Overall Score */}
              <div>
                <div className="text-slate-500 text-sm mb-2">Overall Score</div>
                <div className="text-4xl font-bold text-emerald-400">{selectedCandidate.score || '92'}</div>
              </div>

              {/* Round Results */}
              <div>
                <div className="text-slate-200 font-medium mb-4 pb-2 border-b border-slate-800">Round Results</div>
                <div className="space-y-4">
                  {job.rounds?.map((round: any, idx: number) => (
                    <div key={round.id || idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Check size={16} className="text-emerald-500" />
                        <span className="text-sm">{round.name || round.type}</span>
                      </div>
                      <div className="font-semibold text-white">
                        {/* Mocking scores based on type for demonstration */}
                        {round.type === 'INTERVIEW' ? '4.5/5' : (85 + (idx * 3))}
                      </div>
                    </div>
                  ))}
                  {/* Fallback if no rounds in job */}
                  {(!job.rounds || job.rounds.length === 0) && (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><Check size={16} className="text-emerald-500" /><span className="text-sm">Online Assessment</span></div>
                        <div className="font-semibold text-white">88</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><Check size={16} className="text-emerald-500" /><span className="text-sm">Technical Interview</span></div>
                        <div className="font-semibold text-white">94</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3"><Check size={16} className="text-emerald-500" /><span className="text-sm">HR Interview</span></div>
                        <div className="font-semibold text-white">4.5/5</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Links */}
              <div>
                <div className="text-slate-200 font-medium mb-4 pb-2 border-b border-slate-800">Candidate Profile</div>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                    <FileText size={16} /> Resume <ExternalLink size={14} className="ml-auto opacity-50" />
                  </a>
                  <a href="#" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                    <Code size={16} /> GitHub <ExternalLink size={14} className="ml-auto opacity-50" />
                  </a>
                  <a href="#" className="flex items-center gap-3 text-sm text-slate-400 hover:text-white transition-colors">
                    <Briefcase size={16} /> LinkedIn <ExternalLink size={14} className="ml-auto opacity-50" />
                  </a>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-lg font-medium transition-colors">
                Select Candidate
              </button>
              <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-lg font-medium transition-colors">
                Reject
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
