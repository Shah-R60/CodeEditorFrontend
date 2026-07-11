"use client";

import { Plus } from "lucide-react";

export default function QuestionsTab() {
  const questions = [
    { id: 1, title: "Two Sum", difficulty: "EASY", tags: ["Arrays", "Hash Table"] },
    { id: 2, title: "LRU Cache", difficulty: "MEDIUM", tags: ["Design", "Linked List"] },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Assessment Questions</h3>
          <p className="text-sm text-slate-500">Coding problems assigned to the Online Assessment stage.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-xl transition-all shadow-sm font-semibold text-sm">
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div className="grid gap-4">
        {questions.map((q) => (
          <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm hover:border-blue-300 transition-colors">
            <div>
              <h4 className="font-semibold text-slate-900">{q.title}</h4>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  q.difficulty === 'EASY' ? 'bg-blue-100/50 text-blue-700' : 
                  q.difficulty === 'MEDIUM' ? 'bg-amber-100/50 text-amber-700' : 
                  'bg-rose-100/50 text-rose-700'
                }`}>
                  {q.difficulty}
                </span>
                <div className="flex gap-2">
                  {q.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium border border-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
