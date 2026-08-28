"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_USERS } from "@/lib/constants";
import { RoleBadge } from "./RoleBadge";
import { X, CheckCircle, Sparkles, UserPlus, ShieldAlert, ArrowRight } from "lucide-react";

export const DemoSwitcherModal: React.FC = () => {
  const { isDemoSwitcherOpen, setIsDemoSwitcherOpen, currentUser, switchDemoUser, setIsAuthModalOpen } = useApp();

  if (!isDemoSwitcherOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="font-bold text-lg">테스트 계정 / 역할 빠른 전환</h3>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              입주민, 동대표, 관리소 직원의 권한 차이를 직접 체험해 보세요!
            </p>
          </div>
          <button
            onClick={() => setIsDemoSwitcherOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User list */}
        <div className="p-4 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {DEMO_USERS.map((user) => {
            const isSelected = currentUser.id === user.id;

            return (
              <button
                key={user.id}
                onClick={() => switchDemoUser(user.id)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-400/30 shadow-xs"
                    : "bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white border border-slate-200 overflow-hidden shadow-xs flex-shrink-0">
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{user.name}</span>
                      <RoleBadge
                        role={user.role}
                        roleTitle={user.roleTitle}
                        building={user.building}
                        unit={user.unit}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {user.role === 'resident' && `🏢 ${user.building} ${user.unit} 입주민 (동별 톡방 및 민원)`}
                      {user.role === 'representative' && `👑 ${user.building} 동대표 (입대위 비공개 톡방 접근 가능)`}
                      {user.role === 'manager' && `🏢 관리사무소 (공지 등록, 민원 답변/처리 관제)`}
                    </p>
                  </div>
                </div>

                {isSelected ? (
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 flex-shrink-0" />
                )}
              </button>
            );
          })}

          {/* Create Custom User Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                setIsDemoSwitcherOpen(false);
                setIsAuthModalOpen(true);
              }}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>직접 동/호수 및 이름 지정하여 새 주민으로 가입하기</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>역할을 변경하면 접근 가능한 톡방과 민원 처리 권한이 즉시 전환됩니다.</span>
        </div>
      </div>
    </div>
  );
};
