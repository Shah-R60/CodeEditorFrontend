"use client";

import { GripVertical, Clock, Settings, Plus, Calendar, AlertTriangle, ArrowDown, Users, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PipelinePlanTab() {
  const params = useParams();
  const jobId = params.jobId as string;
  const [rounds, setRounds] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Round Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRound, setNewRound] = useState({
    name: '',
    type: 'Online Assessment',
    duration: '60 mins',
    description: ''
  });

  const handleAddRound = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const recruiterId = localStorage.getItem('userId');
      const res = await fetch(`http://localhost:3001/db/drives/${jobId}/rounds`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': recruiterId || '' 
        },
        body: JSON.stringify(newRound)
      });
      const json = await res.json();
      if (json.success) {
        setRounds([...rounds, json.data]);
        setIsModalOpen(false);
        setNewRound({ name: '', type: 'Online Assessment', duration: '60 mins', description: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        const recruiterId = localStorage.getItem('userId');
        const res = await fetch(`http://localhost:3001/db/drives/${jobId}`, {
          headers: { 'x-user-id': recruiterId || '' }
        });
        const json = await res.json();
        if (json.success && json.data.rounds) {
          setRounds(json.data.rounds);
          setCandidates(json.data.candidates || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRounds();
  }, [jobId]);

  // Derived overall metrics
  const activeCandidates = candidates.filter(c => c.status !== 'Rejected');
  const candidatesRemaining = activeCandidates.length;

  let maxRoundReached = 0;
  activeCandidates.forEach(c => {
    const rIndex = rounds.findIndex(r => r.name === c.stage);
    if (rIndex > maxRoundReached) maxRoundReached = rIndex;
  });

  const currentRoundNum = rounds.length > 0 ? Math.min(maxRoundReached, rounds.length - 1) : 0;
  const overallProgressPercentage = rounds.length > 0 ? Math.round((currentRoundNum / rounds.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Overall Progress Section */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-lg font-semibold text-slate-300 border-b border-slate-700 pb-3 mb-6">
          Hiring Drive
        </h2>
        
        <div className="space-y-6">
          <div>
            <div className="text-sm font-medium text-slate-400 mb-3">Overall Progress</div>
            <div className="w-full max-w-md bg-slate-800 rounded-full h-4 mb-2 overflow-hidden border border-slate-700">
              <div 
                className="bg-white h-4 rounded-full transition-all duration-1000" 
                style={{ width: `${overallProgressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="text-xl font-bold text-white mb-1">Round {currentRoundNum} of {rounds.length || 0}</div>
            <div className="text-slate-400">{candidatesRemaining} Candidates Remaining</div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hiring Rounds</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Define the assessment flow for this role.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl transition-all shadow-sm font-semibold text-sm"
        >
          <Plus size={16} /> Add Round
        </button>
      </div>

      <div className="flex flex-col">
        {loading ? (
          <div className="p-4 text-slate-500">Loading rounds...</div>
        ) : rounds.length === 0 ? (
          <div className="p-4 text-slate-500">No rounds defined yet.</div>
        ) : rounds.map((round, index) => {
          let status = 'Draft';
          let statusColor = 'bg-amber-400';

          if (round.startDate) {
            const now = new Date();
            const start = new Date(round.startDate);
            
            if (start > now) {
              status = 'Scheduled';
              statusColor = 'bg-emerald-500';
            } else {
              if (round.endDate) {
                const end = new Date(round.endDate);
                if (end < now) {
                  status = 'Completed';
                  statusColor = 'bg-slate-500';
                } else {
                  status = 'Live';
                  statusColor = 'bg-blue-500';
                }
              } else {
                status = 'Live';
                statusColor = 'bg-blue-500';
              }
            }
          }

          let invited = 0;
          let completed = 0;
          let qualified = 0;

          candidates.forEach(c => {
            const cRoundIndex = rounds.findIndex(r => r.name === c.stage);
            
            // If they reached this round or beyond, they were invited
            if (cRoundIndex >= index) {
              invited++;
              
              // If they are strictly past this round, they completed and qualified it
              if (cRoundIndex > index) {
                completed++;
                qualified++;
              } else if (cRoundIndex === index) {
                // If they are currently IN this round
                if (c.status === 'Passed') {
                  completed++;
                  qualified++; // They passed it but haven't been officially moved to the next round name yet
                } else if (c.status === 'Rejected' || (c.status === 'In Review' && c.score)) {
                  completed++; // They finished it (failed or in review with a score)
                }
              }
            }
          });
          
          const pending = invited - completed;
          
          const isInterview = round.type.includes('Interview');
          const totalMetric = invited; 
          const finishedMetric = completed;
          const percentage = totalMetric > 0 ? Math.round((finishedMetric / totalMetric) * 100) : 0;

          return (
          <div key={round.id} className="flex flex-col">
            <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-start gap-4 shadow-sm group hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors">
              <div className="mt-1 text-slate-300 dark:text-slate-500 group-hover:text-blue-500 cursor-grab transition-colors">
                <GripVertical size={20} />
              </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-bold">
                    {index}
                  </span>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{round.name}</h4>
                  
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-[#1e293b] text-slate-600 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-white/10">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColor}`}></div>
                    {status}
                  </div>
                  
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-slate-200 dark:border-white/10 ml-2">
                    {round.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock size={14} /> {round.duration}
                  </div>
                  <button className="hover:text-slate-700 transition-colors">
                    <Settings size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-9">{round.description}</p>
              
              <div className="mt-4 ml-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Timeline Section */}
                <div className="bg-slate-50 dark:bg-[#1e293b]/30 border border-slate-100 dark:border-white/5 rounded-xl p-4 flex flex-col transition-colors">
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Timeline</span>
                  {round.startDate ? (
                    <div className="flex items-start gap-4 w-full">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          <Calendar size={16} className="text-blue-500" />
                          {new Date(round.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {new Date(round.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                        <div className="text-slate-400 dark:text-slate-500 my-1">
                          <ArrowDown size={14} />
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                          {round.endDate ? new Date(round.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBD'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-500/20 w-full mt-auto mb-auto">
                      <AlertTriangle size={16} />
                      <span>Schedule not set</span>
                    </div>
                  )}
                </div>

                {/* Candidate Summary Section */}
                <div className="bg-slate-50 dark:bg-[#1e293b]/30 border border-slate-100 dark:border-white/5 rounded-xl p-4 flex flex-col transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                    <Users size={14} /> Candidates
                  </div>
                  
                  <div className="space-y-2 mt-1">
                    {isInterview ? (
                      <>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-600 dark:text-slate-400">Assigned</span>
                          <span className="text-slate-900 dark:text-white bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">{invited}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-600 dark:text-slate-400">Completed</span>
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">{completed}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-600 dark:text-slate-400">Pending</span>
                          <span className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-md">{pending}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-600 dark:text-slate-400">Invited</span>
                          <span className="text-slate-900 dark:text-white bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">{invited}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-600 dark:text-slate-400">Appeared</span>
                          <span className="text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-md">{completed}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="text-slate-600 dark:text-slate-400">Qualified</span>
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">{qualified}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Progress Section */}
                <div className="bg-slate-50 dark:bg-[#1e293b]/30 border border-slate-100 dark:border-white/5 rounded-xl p-4 flex flex-col justify-between transition-colors">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                    <Activity size={14} /> Progress
                  </div>
                  
                  {(() => {
                    return (
                      <div className="mt-auto">
                        <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-3.5 mb-4 overflow-hidden border border-slate-300 dark:border-white/10">
                          <div 
                            className="bg-blue-500 h-3.5 rounded-full transition-all duration-1000" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{percentage}%</div>
                          <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                            <span className="text-slate-800 dark:text-slate-200">{finishedMetric}</span> / {totalMetric} Finished
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            </div>
            
            {/* Timeline Connector */}
            {index < rounds.length - 1 && (
              <div className="flex flex-col items-center justify-center py-1 -my-1 relative z-10">
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                <ArrowDown size={14} className="text-slate-400 dark:text-slate-500 my-1" />
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
              </div>
            )}
          </div>
        )})}
      </div>
      </div>

      {/* Add Round Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Add New Round</h2>
              <p className="text-sm text-slate-500 mt-1">Define a new assessment stage for this pipeline.</p>
            </div>
            
            <form onSubmit={handleAddRound} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Round Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Technical Interview"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  value={newRound.name}
                  onChange={e => setNewRound({...newRound, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Round Type</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  value={newRound.type}
                  onChange={e => setNewRound({...newRound, type: e.target.value})}
                >
                  <option value="Online Assessment">Online Assessment</option>
                  <option value="Technical Interview">Technical Interview</option>
                  <option value="HR Interview">HR Interview</option>
                  <option value="Take-home Assignment">Take-home Assignment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Duration</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. 60 mins"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  value={newRound.duration}
                  onChange={e => setNewRound({...newRound, duration: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Briefly describe what this round entails"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 resize-none"
                  value={newRound.description}
                  onChange={e => setNewRound({...newRound, description: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Add Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
