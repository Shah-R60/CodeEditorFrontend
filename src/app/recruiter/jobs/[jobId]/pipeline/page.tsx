"use client";

import { GripVertical, Clock, Settings, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PipelinePlanTab() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStages = async () => {
      try {
        const recruiterId = localStorage.getItem('userId');
        const res = await fetch(`http://localhost:3001/db/jobs/${jobId}`, {
          headers: { 'x-user-id': recruiterId || '' }
        });
        const json = await res.json();
        if (json.success && json.data.stages) {
          setStages(json.data.stages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStages();
  }, [jobId]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Hiring Stages</h3>
          <p className="text-sm text-slate-500">Define the assessment flow for this role.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 text-slate-700 px-4 py-2 rounded-xl transition-all shadow-sm font-semibold text-sm">
          <Plus size={16} /> Add Stage
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-4 text-slate-500">Loading stages...</div>
        ) : stages.length === 0 ? (
          <div className="p-4 text-slate-500">No stages defined yet.</div>
        ) : stages.map((stage, index) => (
          <div key={stage.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-4 shadow-sm group hover:border-blue-300 transition-colors">
            <div className="mt-1 text-slate-300 group-hover:text-blue-500 cursor-grab transition-colors">
              <GripVertical size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {index + 1}
                  </span>
                  <h4 className="font-semibold text-slate-900">{stage.name}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    {stage.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={14} /> {stage.duration}
                  </div>
                  <button className="hover:text-slate-700 transition-colors">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2 ml-9">{stage.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
