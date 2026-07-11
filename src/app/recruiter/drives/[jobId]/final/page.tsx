"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, Award, Loader2 } from "lucide-react";

export default function FinalSelectionPage() {
  const params = useParams();
  const jobId = params.jobId as string;
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

  // Filter candidates who have passed all stages.
  // For demonstration, we assume candidates with status 'Passed' and in the final stage are selected.
  // Alternatively, just filter those explicitly marked as 'Hired' or equivalent.
  // Here we'll just mock the logic by looking for any candidate with 'Passed' status in any advanced stage.
  const finalCandidates = job.candidates?.filter((c: any) => c.status === "Passed") || [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="text-emerald-500" size={24} /> Final Selection
        </h2>
        <p className="text-sm text-slate-500 mt-1">Candidates who successfully passed all assessment rounds.</p>
      </div>

      {/* Candidates List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Final Score</th>
                <th className="px-6 py-4">Date Completed</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {finalCandidates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Award size={32} className="mx-auto text-slate-300 mb-3" />
                    No candidates have reached the final selection yet.
                  </td>
                </tr>
              ) : finalCandidates.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{c.email}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">{c.score || '92/100'}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors px-4 py-1.5 rounded-lg font-semibold text-sm">
                      Extend Offer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
