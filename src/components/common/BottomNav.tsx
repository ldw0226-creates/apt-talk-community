"use client";

import React from "react";
import { useApp, NavTab } from "@/context/AppContext";
import { MessageSquare, Megaphone, Wrench, Vote, User } from "lucide-react";

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setActiveRoomId, chatRooms, complaints } = useApp();

  const totalUnreadChat = chatRooms.reduce((acc, r) => acc + (r.unreadCount || 0), 0);
  const pendingComplaints = complaints.filter(c => c.status === "pending").length;

  const handleTabClick = (tab: NavTab) => {
    setActiveRoomId(null);
    setActiveTab(tab);
  };

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: "chat",
      label: "채팅",
      icon: MessageSquare,
      badge: totalUnreadChat > 0 ? totalUnreadChat : undefined,
    },
    {
      id: "community",
      label: "광장/공지",
      icon: Megaphone,
    },
    {
      id: "complaint",
      label: "민원센터",
      icon: Wrench,
      badge: pendingComplaints > 0 ? pendingComplaints : undefined,
    },
    {
      id: "vote",
      label: "전자투표",
      icon: Vote,
    },
    {
      id: "profile",
      label: "내정보",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex flex-col items-center justify-center transition-all ${
                isActive
                  ? "text-blue-600 font-bold scale-105"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-blue-600 stroke-[2.4]" : "stroke-[1.8]"}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-1 ${isActive ? "text-blue-600 font-bold" : "text-slate-500"}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
