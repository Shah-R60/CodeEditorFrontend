"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Clock } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionLink: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userId = isMounted && typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const userRole = isMounted && typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

  const fetchNotifications = async () => {
    if (!userId || !userRole) return;
    try {
      const res = await fetch(`http://localhost:3001/db/notifications?userId=${userId}&role=${userRole}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userId, userRole]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`http://localhost:3001/db/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId || !userRole) return;
    try {
      await fetch(`http://localhost:3001/db/notifications/read-all`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: userRole })
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / 1000 / 60; // diff in minutes
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (!userId) return null;

  return (
    <>
      <button
        onClick={() => {
          if (!isOpen) {
            setIsOpen(true);
            fetchNotifications();
          }
        }}
        className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-white shadow-[0_0_0_2px_white] dark:shadow-[0_0_0_2px_#0f172a]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-[100] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 w-full sm:w-[380px] bg-white dark:bg-[#161722] z-[101] shadow-2xl flex flex-col border-l border-slate-200 dark:border-white/5 rounded-l-3xl overflow-hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-600/20 text-amber-600 dark:text-amber-500 text-xs font-bold border border-amber-200 dark:border-amber-500/20">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                  <Bell className="w-10 h-10 mb-4 text-slate-300 dark:text-slate-600 opacity-50" />
                  <p className="text-sm font-medium">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {notifications.map((n) => {
                    const content = (
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5">
                          <div className="w-6 h-6 rounded-full border border-amber-500 flex items-center justify-center text-amber-500 bg-amber-50 dark:bg-amber-500/10">
                            <span className="text-xs font-bold italic">i</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-1.5">
                            <h4 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">{n.title}</h4>
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                              {formatDate(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-1">
                            {n.message}
                          </p>
                        </div>
                        {!n.isRead && (
                          <div className="shrink-0 flex items-center justify-center mt-6">
                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                          </div>
                        )}
                      </div>
                    );

                    return n.actionLink ? (
                      <Link
                        key={n.id}
                        href={n.actionLink}
                        onClick={(e) => {
                          setIsOpen(false);
                          if (!n.isRead) handleMarkAsRead(n.id, e as any);
                        }}
                        className={`block relative p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          !n.isRead ? 'bg-amber-50/30 dark:bg-[#1c1d29]' : ''
                        }`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div
                        key={n.id}
                        onClick={(e) => {
                          if (!n.isRead) handleMarkAsRead(n.id, e);
                        }}
                        className={`relative p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${
                          !n.isRead ? 'bg-amber-50/30 dark:bg-[#1c1d29]' : ''
                        }`}
                      >
                        {content}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-[#12131c] border-t border-slate-200 dark:border-white/5 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
              Showing latest {notifications.length} notifications
            </div>
          </div>
    </>
  );
}
