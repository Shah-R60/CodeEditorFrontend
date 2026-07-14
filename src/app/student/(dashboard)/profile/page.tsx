"use client";

import { useEffect, useState } from "react";
import { User, Mail, Calendar, Briefcase, Award, Clock } from "lucide-react";

type Assessment = {
  id: string;
  score: string | null;
  status: string;
  createdAt: string;
  hiringDrive: {
    title: string;
    department: string | null;
    status: string;
  };
};

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
};

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return;

        const res = await fetch(`http://localhost:3001/db/users/${userId}/profile`);
        const json = await res.json();

        if (json.success) {
          setProfile(json.data.user);
          setAssessments(json.data.assessments);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 max-w-5xl mx-auto w-full flex items-center justify-center min-h-[50vh]">
        <p className="text-rose-500 font-medium bg-rose-50 px-6 py-3 rounded-lg border border-rose-100">
          Failed to load profile data.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Your Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account and view assessment history</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Basic Details */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
            
            <div className="relative mt-8 mb-4 w-24 h-24 rounded-full bg-white p-1 shadow-md">
              <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-3xl text-emerald-700 font-bold border border-emerald-200">
                {profile.name ? profile.name.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-900">{profile.name || "Student User"}</h2>
            <p className="text-sm text-slate-500 mb-6 capitalize">{profile.role.toLowerCase()}</p>
            
            <div className="w-full space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span className="truncate">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assessment History */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Assessment History
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                {assessments.length} Total
              </span>
            </div>
            
            <div className="divide-y divide-slate-100">
              {assessments.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  You haven't participated in any assessments yet.
                </div>
              ) : (
                assessments.map((assessment) => (
                  <div key={assessment.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{assessment.hiringDrive.title}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {assessment.hiringDrive.department || "No Department"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Score</div>
                        <div className="font-mono text-sm font-semibold text-slate-700">
                          {assessment.score || "Pending"}
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        assessment.status === 'HIRED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        assessment.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        assessment.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {assessment.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
