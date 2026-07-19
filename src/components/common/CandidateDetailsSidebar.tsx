import React from 'react';
import { X, Check, FileText, Code, Briefcase, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CandidateDetailsSidebarProps {
  candidate: any;
  job: any;
  onClose: () => void;
  onSelect: () => void;
  onReject: () => void;
}

const parseScore = (scoreStr: string) => {
  if (!scoreStr) return { earned: 0, total: 0 };
  const parts = scoreStr.toString().split('/');
  if (parts.length === 2) {
    return { earned: parseFloat(parts[0]) || 0, total: parseFloat(parts[1]) || 0 };
  }
  return { earned: parseFloat(scoreStr) || 0, total: 100 }; // fallback for single number
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

export function CandidateDetailsSidebar({ candidate, job, onClose, onSelect, onReject }: CandidateDetailsSidebarProps) {
  const isOpen = !!candidate;

  let totalEarned = 0;
  let totalMax = 0;
  
  const roundsToProcess = (job?.rounds && job.rounds.length > 0) 
    ? job.rounds 
    : [
        { id: 'mock1', name: 'Online Assessment', type: 'OA' },
        { id: 'mock2', name: 'Technical Interview', type: 'Technical' }
      ];

  const enrichedRounds = roundsToProcess.map((round: any, idx: number) => {
    const scoreStr = getRoundScore(candidate, round, idx);
    const parsed = parseScore(scoreStr);
    totalEarned += parsed.earned;
    totalMax += parsed.total;
    return { ...round, displayScore: scoreStr };
  });

  const overallScoreDisplay = totalMax > 0 ? `${totalEarned}/${totalMax}` : (candidate?.score || '0/0');

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 dark:bg-slate-900/40 backdrop-blur-sm z-[60] transition-opacity" 
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-300 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col rounded-l-3xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {candidate && (
          <>
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{candidate.name}</h3>
                <div className="text-slate-500 dark:text-slate-400 text-sm mt-1">{candidate.email}</div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-8">
              
              {/* Overall Score */}
              <div>
                <div className="text-slate-500 dark:text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Overall Score</div>
                <div className="text-4xl font-bold text-emerald-500 dark:text-emerald-400">{overallScoreDisplay}</div>
              </div>

              {/* Round Results */}
              <div>
                <div className="text-slate-800 dark:text-slate-200 font-bold mb-4 pb-2 border-b border-slate-200 dark:border-white/10">Round Results</div>
                <div className="space-y-4">
                  {enrichedRounds.map((round: any, idx: number) => (
                    <div key={round.id || idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{round.name || round.type}</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {round.displayScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Links */}
              <div>
                <div className="text-slate-800 dark:text-slate-200 font-bold mb-4 pb-2 border-b border-slate-200 dark:border-white/10">Candidate Profile</div>
                
                {candidate?.resumeData && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex flex-col items-center text-center justify-center space-y-3 mb-4">
                    <div className="w-12 h-12 bg-white dark:bg-[#0f172a] rounded-full flex items-center justify-center shadow-sm text-indigo-600 dark:text-indigo-400 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">AI Parsed Profile Available</h3>
                      <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1 px-4">Experience, skills, education, and resume document</p>
                    </div>
                    <Link
                      href={`/recruiter/drives/${job?.id}/candidates/${candidate.id}`}
                      className="mt-2 w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 dark:shadow-none"
                    >
                      View Full Profile <ArrowRight size={16} />
                    </Link>
                  </div>
                )}

                <div className="space-y-3">
                  {candidate?.resumeFile ? (
                    <a href={candidate.resumeFile.startsWith('http') ? candidate.resumeFile : `http://localhost:3001/uploads/${candidate.resumeFile}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
                      <FileText size={18} /> Resume <ExternalLink size={14} className="ml-auto opacity-50" />
                    </a>
                  ) : (
                    <a href="#" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
                      <FileText size={18} /> Resume <ExternalLink size={14} className="ml-auto opacity-50" />
                    </a>
                  )}
                  {candidate?.github && (
                    <a href={candidate.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
                      <Code size={18} /> GitHub <ExternalLink size={14} className="ml-auto opacity-50" />
                    </a>
                  )}
                  {candidate?.linkedin && (
                    <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
                      <Briefcase size={18} /> LinkedIn <ExternalLink size={14} className="ml-auto opacity-50" />
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 dark:border-white/10 flex gap-4 bg-slate-50/50 dark:bg-transparent">
              <button 
                onClick={onSelect}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md hover:shadow-emerald-500/20 active:scale-[0.98]"
              >
                Select Candidate
              </button>
              <button 
                onClick={onReject}
                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                Reject
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
