"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { BUILDINGS, APARTMENT_NAME } from "@/lib/constants";
import { UserRole } from "@/types";
import { X, Building2, UserCheck, Shield, Home, Phone, User as UserIcon } from "lucide-react";

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, registerUser } = useApp();

  const [role, setRole] = useState<UserRole>("resident");
  const [name, setName] = useState("");
  const [building, setBuilding] = useState("101동");
  const [unit, setUnit] = useState("");
  const [phone, setPhone] = useState("010-");
  const [roleTitle, setRoleTitle] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (role !== "manager" && !unit.trim()) {
      alert("호수(예: 1204호)를 입력해주세요.");
      return;
    }

    let finalUnit = unit.trim();
    if (role === "manager") {
      finalUnit = finalUnit || "관리사무소";
    } else if (!finalUnit.endsWith("호")) {
      finalUnit = `${finalUnit}호`;
    }

    let finalRoleTitle = roleTitle.trim();
    if (!finalRoleTitle) {
      if (role === "representative") finalRoleTitle = `${building} 동대표 👑`;
      else if (role === "manager") finalRoleTitle = "관리사무소 직원 🏢";
    }

    registerUser({
      name: name.trim(),
      role,
      apartmentName: APARTMENT_NAME,
      building: role === "manager" ? "관리동" : building,
      unit: finalUnit,
      phone: phone.trim(),
      roleTitle: finalRoleTitle || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-lg">아파트 입주민 / 관계자 가입</h3>
              <p className="text-xs text-blue-100">{APARTMENT_NAME}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              1. 가입 유형 (역할 선택) <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole("resident")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === "resident"
                    ? "bg-blue-50 border-blue-600 text-blue-900 font-bold ring-2 ring-blue-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Home className="w-5 h-5 text-blue-600" />
                <span className="text-xs">일반 입주민</span>
                <span className="text-[10px] text-slate-400 font-normal">동/호수 거주자</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("representative")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === "representative"
                    ? "bg-amber-50 border-amber-600 text-amber-900 font-bold ring-2 ring-amber-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg leading-none">👑</span>
                <span className="text-xs">동대표 (입대위)</span>
                <span className="text-[10px] text-slate-400 font-normal">대표회의 권한</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("manager")}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  role === "manager"
                    ? "bg-indigo-50 border-indigo-600 text-indigo-900 font-bold ring-2 ring-indigo-500/20"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Shield className="w-5 h-5 text-indigo-600" />
                <span className="text-xs">관리사무소</span>
                <span className="text-[10px] text-slate-400 font-normal">행정/시설 관제</span>
              </button>
            </div>
          </div>

          {/* Step 2: Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              2. 이름 (실명 또는 닉네임) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 홍길동"
                required
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Step 3: Building & Unit */}
          {role !== "manager" ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  거주 동 <span className="text-red-500">*</span>
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-medium"
                >
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  호수 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="예: 1204호"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                소속 부서 / 직책 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="예: 관리소장, 시설팀장, 경비반장 등"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          )}

          {/* Step 4: Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              연락처 (선택)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              ※ 아파트 입주민 인증 및 긴급 안내(단수/주차 이동 등) 시에만 활용됩니다.
            </p>
          </div>

          {/* Submit button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>가입 완료하고 아파트 톡 시작하기</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
