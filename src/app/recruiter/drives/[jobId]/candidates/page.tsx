"use client";

import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function CandidatesTab() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const recruiterId = localStorage.getItem('userId');
        const res = await fetch(`http://localhost:3001/db/drives/${jobId}`, {
          headers: { 'x-user-id': recruiterId || '' }
        });
        const json = await res.json();
        if (json.success && json.data.candidates) {
          setCandidates(json.data.candidates);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [jobId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Candidate Pipeline</h3>
          <p className="text-sm text-slate-500">Track applicants through the hiring process.</p>
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Candidate</th>
              <th className="px-6 py-4 font-semibold">Current Stage</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">Loading candidates...</td></tr>
            ) : candidates.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-slate-500">No candidates have applied yet.</td></tr>
            ) : candidates.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{c.email}</div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-700">{c.stage}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    c.status === 'Passed' ? 'bg-blue-100/50 text-blue-700' : 
                    c.status === 'Rejected' ? 'bg-rose-100/50 text-rose-700' : 
                    c.status === 'In Review' ? 'bg-amber-100/50 text-amber-700' :
                    'bg-blue-100/50 text-blue-700'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
