"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { ChatRoom } from "@/types";
import { MessageSquare, Lock, Users, ShieldAlert, Sparkles, Building, Megaphone, ShieldCheck } from "lucide-react";

export const ChatListView: React.FC = () => {
  const { chatRooms, setActiveRoomId, canAccessRoom, currentUser, setIsDemoSwitcherOpen } = useApp();
  const [filter, setFilter] = useState<'all' | 'complex' | 'building' | 'rep_council' | 'manager_1on1'>('all');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  const filteredRooms = chatRooms.filter(room => {
    if (filter === 'all') return true;
    return room.type === filter;
  });

  const handleRoomClick = (room: ChatRoom) => {
    const access = canAccessRoom(room);
    if (!access.canAccess) {
      setAccessDeniedMessage(access.reason || "접근 권한이 없는 톡방입니다.");
      return;
    }
    setActiveRoomId(room.id);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Banner with Resident Info */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-amber-400 text-amber-950 font-extrabold px-2 py-0.5 rounded-full">
                내 소속
              </span>
              <span className="font-bold text-sm md:text-base">
                {currentUser.building} {currentUser.unit} ({currentUser.name})
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1">
              {currentUser.role === "resident" && "✅ 전체 광장톡 및 거주 동 전용 톡방에 자동 참여 중입니다."}
              {currentUser.role === "representative" && "👑 동대표 권한으로 입대위 전용 비공개 톡방 접근이 가능합니다."}
              {currentUser.role === "manager" && "🏢 관리소 권한으로 모든 세대 1:1 민원 및 단지 톡방 관제가 가능합니다."}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          전체 톡방
        </button>
        <button
          onClick={() => setFilter('complex')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'complex'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          📢 광장 톡
        </button>
        <button
          onClick={() => setFilter('building')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'building'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          🏢 동별 소통방
        </button>
        <button
          onClick={() => setFilter('rep_council')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'rep_council'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ⚖️ 입대위 비공개
        </button>
        <button
          onClick={() => setFilter('manager_1on1')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            filter === 'manager_1on1'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          💬 관리소 1:1
        </button>
      </div>

      {/* Access Denied Alert Modal/Popup */}
      {accessDeniedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-900 text-base mb-1">입장 제한 안내</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {accessDeniedMessage}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setAccessDeniedMessage(null);
                  setIsDemoSwitcherOpen(true);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>해당 권한 계정으로 변경해 체험해보기</span>
              </button>
              <button
                onClick={() => setAccessDeniedMessage(null)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-all"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Room List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white">
        {filteredRooms.map((room) => {
          const access = canAccessRoom(room);
          const isAccessible = access.canAccess;

          return (
            <div
              key={room.id}
              onClick={() => handleRoomClick(room)}
              className={`p-4 flex items-center gap-3.5 transition-all cursor-pointer select-none ${
                isAccessible
                  ? 'hover:bg-slate-50 active:bg-slate-100'
                  : 'opacity-70 bg-slate-50/70 hover:bg-slate-100/50'
              }`}
            >
              {/* Room Icon Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-13 h-13 rounded-2xl flex items-center justify-center text-2xl shadow-xs ${
                    room.type === 'complex'
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                      : room.type === 'building'
                      ? isAccessible
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                        : 'bg-slate-300 text-slate-600'
                      : room.type === 'rep_council'
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white'
                      : 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white'
                  }`}
                >
                  {room.type === 'complex' && '📢'}
                  {room.type === 'building' && '🏢'}
                  {room.type === 'rep_council' && '⚖️'}
                  {room.type === 'manager_1on1' && '💬'}
                </div>

                {/* Locked indicator if not accessible */}
                {!isAccessible && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center shadow-xs">
                    <Lock className="w-3 h-3 text-amber-300" />
                  </div>
                )}
              </div>

              {/* Room Text & Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {room.name}
                    </h3>
                    <span className="text-slate-400 text-xs flex items-center gap-0.5 flex-shrink-0">
                      <Users className="w-3 h-3" />
                      {room.memberCount}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 flex-shrink-0">
                    {room.lastMessageTime}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500 truncate">
                    {!isAccessible ? (
                      <span className="text-amber-700 font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        {room.targetBuilding ? `${room.targetBuilding} 입주민 전용 방 (잠김)` : "입대위 전용 비공개 (잠김)"}
                      </span>
                    ) : (
                      room.lastMessage || room.description
                    )}
                  </p>

                  {/* Unread badge */}
                  {isAccessible && (room.unreadCount || 0) > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1.5 bg-red-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center flex-shrink-0 shadow-xs">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
