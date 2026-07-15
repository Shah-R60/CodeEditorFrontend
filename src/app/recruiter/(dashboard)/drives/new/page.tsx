"use client";

import { useState } from "react";
import { ArrowLeft, Plus, Trash2, GripVertical, Settings2, Calendar, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type Round = {
  id: string;
  name: string;
  type: string;
  duration: string;
  description: string;
  startDate?: string;
  endDate?: string;
  config: any;
};

const ROUND_TYPES = [
  "Online Assessment",
  "Technical Interview",
  "HR Interview",
  "Managerial Interview",
  "Group Discussion",
  "Final Interview",
  "Custom Round"
];

export default function CreateDrivePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [rounds, setRounds] = useState<Round[]>([
    {
      id: "round-1",
      name: "Online Assessment",
      type: "Online Assessment",
      duration: "90 mins",
      description: "Initial algorithmic screening",
      config: {}
    }
  ]);
  
  const [expandedRoundId, setExpandedRoundId] = useState<string | null>("round-1");

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(rounds);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setRounds(items);
  };

  const addRound = () => {
    const newRound = {
      id: `round-${Date.now()}`,
      name: "New Round",
      type: "Technical Interview",
      duration: "60 mins",
      description: "",
      config: {}
    };
    setRounds([...rounds, newRound]);
    setExpandedRoundId(newRound.id);
  };

  const removeRound = (id: string) => {
    setRounds(rounds.filter(r => r.id !== id));
  };

  const updateRound = (id: string, field: keyof Round, value: any) => {
    setRounds(rounds.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const recruiterId = localStorage.getItem('userId');
      const res = await fetch('http://localhost:3001/db/drives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': recruiterId || ''
        },
        body: JSON.stringify({ 
          title, 
          department,
          rounds 
        })
      });
      const json = await res.json();
      
      if (json.success) {
        router.push(`/recruiter/drives/${json.data.id}`);
      } else {
        alert("Failed to create drive");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <Link href="/recruiter/drives" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4 text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg">
          <ArrowLeft size={16} />
          Back to Drives
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Create Hiring Drive</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-lg">Define the role, build a custom assessment pipeline, and configure scheduling for each round.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Details */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 sm:p-8 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 text-xs">1</span>
            Basic Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">Drive Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer - Q3"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">Department (Optional)</label>
              <input 
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Engineering, Data, Marketing"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Pipeline Builder */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6 sm:p-8 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-[#1e293b] text-slate-500 dark:text-slate-400 text-xs">2</span>
              Assessment Pipeline
            </h2>
            <button 
              type="button" 
              onClick={addRound}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              <Plus size={16} /> Add Round
            </button>
          </div>

          <div className="space-y-4">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pipeline-rounds">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {rounds.map((round, index) => (
                      <Draggable key={round.id} draggableId={round.id} index={index}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-xl bg-white dark:bg-[#070b14] overflow-hidden transition-shadow ${snapshot.isDragging ? 'shadow-xl border-blue-400 ring-4 ring-blue-50 dark:ring-blue-900/20' : 'border-slate-200 dark:border-white/10 shadow-sm hover:border-slate-300 dark:hover:border-white/20'}`}
                          >
                            {/* Round Header */}
                            <div className="flex items-center p-2 bg-slate-50/50 dark:bg-[#1e293b]/50">
                              <div {...provided.dragHandleProps} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-grab active:cursor-grabbing">
                                <GripVertical size={20} />
                              </div>
                              <div 
                                className="flex-1 flex items-center justify-between p-2 cursor-pointer"
                                onClick={() => setExpandedRoundId(expandedRoundId === round.id ? null : round.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <span className="font-semibold text-slate-900 dark:text-white">{round.name}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                    {round.type}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeRound(round.id); }}
                                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Round Configuration Body (Expandable) */}
                            {expandedRoundId === round.id && (
                              <div className="p-5 border-t border-slate-100 dark:border-white/5 space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Round Name</label>
                                    <input 
                                      type="text" 
                                      value={round.name}
                                      onChange={(e) => updateRound(round.id, 'name', e.target.value)}
                                      className="w-full px-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-sm"
                                    />
                                  </div>
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Round Type</label>
                                    <select 
                                      value={round.type}
                                      onChange={(e) => updateRound(round.id, 'type', e.target.value)}
                                      className="w-full px-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 shadow-sm"
                                    >
                                      {ROUND_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                                    </select>
                                  </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-[#1e293b]/30 rounded-xl border border-slate-100 dark:border-white/5 space-y-4">
                                  <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                                    <Calendar size={16} className="text-blue-500" /> Optional Scheduling
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Start Date</label>
                                      <input 
                                        type="datetime-local" 
                                        value={round.startDate || ''}
                                        onChange={(e) => updateRound(round.id, 'startDate', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white focus:outline-none shadow-sm style-color-scheme"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">End Date</label>
                                      <input 
                                        type="datetime-local" 
                                        value={round.endDate || ''}
                                        onChange={(e) => updateRound(round.id, 'endDate', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white focus:outline-none shadow-sm style-color-scheme"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Time Zone</label>
                                      <select 
                                        value={round.timeZone || 'Asia/Kolkata'}
                                        onChange={(e) => updateRound(round.id, 'timeZone', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white focus:outline-none shadow-sm"
                                      >
                                        <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
                                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                                        <option value="America/New_York">EST (Eastern Time)</option>
                                        <option value="America/Los_Angeles">PST (Pacific Time)</option>
                                        <option value="Europe/London">GMT (Greenwich Mean Time)</option>
                                      </select>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Duration</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. 60 mins"
                                        value={round.duration || ''}
                                        onChange={(e) => updateRound(round.id, 'duration', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg text-sm dark:text-white focus:outline-none shadow-sm"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {round.type === "Online Assessment" && (
                                  <div className="p-4 bg-slate-50 dark:bg-[#1e293b]/30 rounded-xl border border-slate-100 dark:border-white/5 space-y-3">
                                     <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                                      <Settings2 size={16} className="text-blue-500" /> Assessment Configuration
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-slate-300 dark:border-white/20 focus:ring-blue-600 dark:focus:ring-blue-500 dark:bg-[#0f172a]" />
                                        Enable Webcam Proctoring
                                      </label>
                                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-slate-300 dark:border-white/20 focus:ring-blue-600 dark:focus:ring-blue-500 dark:bg-[#0f172a]" />
                                        Tab Switching Detection
                                      </label>
                                      <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600 dark:text-blue-500 rounded border-slate-300 dark:border-white/20 focus:ring-blue-600 dark:focus:ring-blue-500 dark:bg-[#0f172a]" />
                                        Auto Evaluation
                                      </label>
                                    </div>
                                  </div>
                                )}

                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {rounds.length === 0 && (
              <div className="p-8 text-center bg-slate-50 dark:bg-[#070b14] border border-slate-200 dark:border-white/10 border-dashed rounded-xl">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No rounds added yet. Click "Add Round" to build your pipeline.</p>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
          <Link href="/recruiter/drives" className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={loading || rounds.length === 0 || !title}
            className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:hover:shadow-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" /> Publishing...
              </span>
            ) : "Publish Hiring Drive"}
          </button>
        </div>

      </form>
    </div>
  );
}
