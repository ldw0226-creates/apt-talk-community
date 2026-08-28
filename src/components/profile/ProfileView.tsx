"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { RoleBadge } from "@/components/common/RoleBadge";
import { User, ShieldCheck, Building, Phone, Users, Sparkles, UserPlus, FileText, Settings, Bell, HelpCircle } from "lucide-react";

export const ProfileView: React.FC = () => {
  const { currentUser, setIsDemoSwitcherOpen, setIsAuthModalOpen } = useApp();

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-xs flex-shrink-0">
            <img
              src={currentUser.avatarUrl || "https://api.dicebear.com/7.x/notionists/svg?seed=Resident"}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-slate-900 text-lg truncate">
                {currentUser.name}
              </h3>
              <RoleBadge
                role={currentUser.role}
                roleTitle={currentUser.roleTitle}
                building={currentUser.building}
                unit={currentUser.unit}
                size="md"
              />
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {currentUser.apartmentName} <span className="text-blue-600 font-bold">(총 420세대)</span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              거주위치: <strong>{currentUser.building} {currentUser.unit}</strong>
            </p>
          </div>
        </div>

        {/* Verification Status */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>설악디엘본 입주민 실거주 인증 완료</span>
          </div>
          <span className="text-[11px] text-slate-400">가입일: {currentUser.joinedAt}</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsDemoSwitcherOpen(true)}
            className="py-2.5 px-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>역할 빠른 전환</span>
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>새 동/호수로 가입</span>
          </button>
        </div>
      </div>

      {/* Apartment Directory & Contacts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>설악디엘본 주요 연락처 & 단지안내</span>
          </h4>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            101동~106동 (420세대)
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
            <div>
              <div className="font-bold text-slate-800">관리사무소 (행정/민원실)</div>
              <div className="text-slate-500 text-[11px]">평일 09:00 ~ 18:00 (점심 12~13시)</div>
            </div>
            <a
              href="tel:033-631-4567"
              className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 flex items-center gap-1 hover:bg-blue-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>033-631-4567</span>
            </a>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
            <div>
              <div className="font-bold text-slate-800">24시간 보안 경비실 (중앙초소)</div>
              <div className="text-slate-500 text-[11px]">야간 긴급 상황 및 출차/불법주차 문의</div>
            </div>
            <a
              href="tel:033-631-4568"
              className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 flex items-center gap-1 hover:bg-blue-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>033-631-4568</span>
            </a>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
            <div>
              <div className="font-bold text-slate-800">시설관리 / 승강기 긴급출동</div>
              <div className="text-slate-500 text-[11px]">세대 누수, 정전, 승강기 갇힘 사고</div>
            </div>
            <a
              href="tel:033-631-4569"
              className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 flex items-center gap-1 hover:bg-blue-100 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>033-631-4569</span>
            </a>
          </div>
        </div>
      </div>

      {/* App Guide & Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          <span>아파트톡 권한 및 사용 안내</span>
        </h4>

        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p>
            • <strong>일반 입주민</strong>: 거주하는 동/호수로 가입하여 단지 전체 톡방 및 소속 동 단톡방에 참여합니다.
          </p>
          <p>
            • <strong>동대표(입대위)</strong>: 입주자대표회의 비공개 의사결정 톡방 및 주민 투표 발의 권한을 가집니다.
          </p>
          <p>
            • <strong>관리사무소</strong>: 공식 공지 발송 및 세대별 1:1 민원 실시간 처리/답변 관제를 수행합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
