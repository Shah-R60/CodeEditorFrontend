"use client";

export default function AnalyticsTab() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div>
        <h3 className="text-lg font-bold text-slate-900">Pipeline Analytics</h3>
        <p className="text-sm text-slate-500">Key metrics for this hiring plan.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-500 text-sm font-medium">Total Applicants</h4>
          <p className="text-3xl font-bold text-slate-900 mt-2">142</p>
          <span className="inline-block mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+12 this week</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-500 text-sm font-medium">Pass Rate (OA)</h4>
          <p className="text-3xl font-bold text-slate-900 mt-2">34%</p>
          <span className="inline-block mt-2 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full border border-slate-200">Avg. 38%</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-500 text-sm font-medium">Avg. Time to Hire</h4>
          <p className="text-3xl font-bold text-slate-900 mt-2">18 days</p>
          <span className="inline-block mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">-2 days</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-slate-500 text-sm font-medium">Offers Accepted</h4>
          <p className="text-3xl font-bold text-slate-900 mt-2">2</p>
          <span className="inline-block mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Target: 3</span>
        </div>
      </div>
    </div>
  );
}
