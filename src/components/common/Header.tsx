"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { RoleBadge } from "./RoleBadge";
import { Building2, Bell, BellOff, BellRing, ShieldCheck, Sparkles } from "lucide-react";

export const Header: React.FC = () => {
  const { currentUser, setIsDemoSwitcherOpen, setIsAuthModalOpen, notificationsEnabled, toggleNotifications } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Left: Apt Title / Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md">
            <Building2 className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm md:text-base leading-tight tracking-tight">
                {currentUser.apartmentName}
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> 인증단지
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              420세대 (101동~106동) 입주민 전용 스마트 커뮤니티
            </p>
          </div>
        </div>

        {/* Right: Notification Toggle, Role Switcher & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Push Notification Toggle Button */}
          <button
            onClick={toggleNotifications}
            className={`p-2 rounded-xl transition-all flex items-center justify-center relative shadow-xs active:scale-95 ${
              notificationsEnabled
                ? "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
                : "bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200"
            }`}
            title={notificationsEnabled ? "푸시/소리 알림 켜짐 (클릭 시 끄기)" : "푸시/소리 알림 켜기"}
          >
            {notificationsEnabled ? (
              <>
                <BellRing className="w-4 h-4 text-blue-600" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600" />
              </>
            ) : (
              <Bell className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Switch Role Quick Button */}
          <button
            onClick={() => setIsDemoSwitcherOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95"
            title="입주민 / 동대표 / 관리사무소 역할 빠르게 변경하기"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span className="hidden sm:inline">역할 변경</span>
            <span className="sm:hidden">역할</span>
          </button>

          {/* User Profile Pill */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full transition-all text-left group"
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden border border-slate-300 flex-shrink-0">
              <img
                src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/notionists/svg?seed=Resident"}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {currentUser.name}
                </span>
                <RoleBadge
                  role={currentUser.role}
                  roleTitle={currentUser.roleTitle}
                  building={currentUser.building}
                  unit={currentUser.unit}
                  size="sm"
                />
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
