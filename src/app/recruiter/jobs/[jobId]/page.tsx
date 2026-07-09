"use client";

import { Users, UserCheck, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function JobDashboardTab() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const recruiterId = localStorage.getItem('userId');
        const res = await fetch(`http://localhost:3001/db/jobs/${jobId}`, {
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

  const totalCandidates = candidates.length;
  const inReview = candidates.filter(c => c.status === 'In Review').length;
  const passed = candidates.filter(c => c.status === 'Passed').length;
  const rejected = candidates.filter(c => c.status === 'Rejected').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-medium text-sm">
            <Users size={18} className="text-blue-500" /> Total Applicants
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalCandidates}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-medium text-sm">
            <Clock size={18} className="text-amber-500" /> In Review
          </div>
          <div className="text-3xl font-bold text-slate-900">{inReview}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-medium text-sm">
            <UserCheck size={18} className="text-emerald-500" /> Passed
          </div>
          <div className="text-3xl font-bold text-slate-900">{passed}</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-slate-500 mb-2 font-medium text-sm">
            <TrendingUp size={18} className="text-rose-500" /> Rejected
          </div>
          <div className="text-3xl font-bold text-slate-900">{rejected}</div>
        </div>
      </div>

      {/* Overall Candidates Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Overall Candidates</h3>
            <p className="text-sm text-slate-500 mt-1">All candidates who have applied for this role.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Current Stage</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Loading candidates...</td></tr>
              ) : candidates.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No candidates have applied yet.</td></tr>
              ) : candidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{c.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5">{c.email}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{c.stage}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      c.status === "Passed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      c.status === "In Review" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-rose-50 text-rose-700 border-rose-200"
                    }`}>
                      {c.status}
                    </span>
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
