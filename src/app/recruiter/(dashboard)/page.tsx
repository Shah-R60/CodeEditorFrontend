"use client";

import { Users, FileCode2, CheckCircle2, TrendingUp, Clock, CheckSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  stats: {
    totalCandidates: number;
    activeAssessments: number;
    completedAssessments: number;
    passRate: string;
  };
  recentActivity: Array<{
    id: string;
    candidate: string;
    test: string;
    score: string;
    time: string;
    status: string;
  }>;
};

export default function RecruiterDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const token = localStorage.getItem("token") || "";
        const userId = localStorage.getItem("userId") || "";
        
        const res = await fetch(`${apiUrl}/db/drives/dashboard/stats`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "x-user-id": userId
          }
        });
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);
  const stats = [
    { name: "Total Candidates", value: data?.stats.totalCandidates.toString() || "0", change: "+0%", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
    { name: "Active Assessments", value: data?.stats.activeAssessments.toString() || "0", change: "Active", icon: FileCode2, color: "text-emerald-600", bg: "bg-emerald-100" },
    { name: "Completed Assessments", value: data?.stats.completedAssessments.toString() || "0", change: "Done", icon: CheckSquare, color: "text-amber-600", bg: "bg-amber-100" },
    { name: "Avg. Pass Rate", value: data?.stats.passRate || "0%", change: "+0.0%", icon: CheckCircle2, color: "text-violet-600", bg: "bg-violet-100" },
  ];

  const recentActivity = data?.recentActivity || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, Recruiter!</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your technical assessments today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                <p className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Recent Candidate Activity</h2>
            <Link href="/recruiter/candidates" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            {isLoading ? (
               <div className="flex justify-center items-center h-[300px]">
                 <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
               </div>
            ) : recentActivity.length === 0 ? (
               <div className="flex justify-center items-center h-[300px] text-slate-500">
                 No candidate activity found. Let's create an assessment!
               </div>
            ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Candidate</th>
                  <th className="px-6 py-4 font-semibold">Assessment</th>
                  <th className="px-6 py-4 font-semibold">Score</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentActivity.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{activity.candidate}</div>
                      <div className="text-slate-500 text-xs flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" /> {activity.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{activity.test}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{activity.score}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        activity.status === 'Passed' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/recruiter/questions/new" className="flex items-center p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group">
              <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 mr-4 group-hover:bg-blue-200 transition-colors">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Create Question</h3>
                <p className="text-xs text-slate-500 mt-0.5">Add a new coding problem</p>
              </div>
            </Link>
            
            <button className="w-full flex items-center p-4 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group text-left">
              <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600 mr-4 group-hover:bg-blue-200 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Invite Candidate</h3>
                <p className="text-xs text-slate-500 mt-0.5">Send an assessment link</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
