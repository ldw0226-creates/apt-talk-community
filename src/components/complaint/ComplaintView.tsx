"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Complaint, ComplaintStatus } from "@/types";
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  X,
  Lock,
  Trash2,
  MessageSquarePlus,
  Send
} from "lucide-react";

export const ComplaintView: React.FC = () => {
  const { complaints, addComplaint, deleteComplaint, updateComplaintStatus, currentUser } = useApp();
  const [filter, setFilter] = useState<'all' | 'my' | 'pending' | 'in_progress' | 'resolved'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<'parking' | 'noise' | 'facility' | 'elevator' | 'landscape' | 'other'>('facility');
  const [isPrivate, setIsPrivate] = useState(false);

  // Manager reply state
  const [replyingCompId, setReplyingCompId] = useState<string | null>(null);
  const [managerReplyText, setManagerReplyText] = useState("");
  const [replyTargetStatus, setReplyTargetStatus] = useState<ComplaintStatus>('resolved');

  const isManager = currentUser.role === 'manager' || currentUser.role === 'admin';

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'my') return c.authorId === currentUser.id;
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'in_progress') return c.status === 'in_progress';
    if (filter === 'resolved') return c.status === 'resolved';
    return true;
  });

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    addComplaint({
      title: title.trim(),
      content: content.trim(),
      category,
      isPrivate,
    });

    setTitle("");
    setContent("");
    setIsCreateModalOpen(false);
  };

  const handleDelete = (comp: Complaint) => {
    if (window.confirm(`"${comp.title}" 민원을 정말 삭제하시겠습니까?`)) {
      deleteComplaint(comp.id);
    }
  };

  const handleStatusChange = (id: string, newStatus: ComplaintStatus) => {
    updateComplaintStatus(id, newStatus);
  };

  const handleSaveReply = (id: string) => {
    updateComplaintStatus(id, replyTargetStatus, managerReplyText.trim() || undefined);
    setReplyingCompId(null);
    setManagerReplyText("");
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      facility: "🛠️ 시설 하자/고장",
      parking: "🚗 주차/통행",
      noise: "🔊 층간소음",
      elevator: "🛗 승강기",
      landscape: "🌳 조경/환경",
      other: "📝 일반 민원",
    };
    return map[cat] || cat;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span>실시간 스마트 민원 접수 및 관제</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isManager
                ? "🏢 [관리사무소 모드] 접수된 세대별 민원을 확인하고 처리 상태를 변경하세요."
                : "접수된 민원은 관리사무소로 즉시 전송되며 처리 현황이 실시간 업데이트됩니다."}
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>새 민원 접수</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 민원 ({complaints.length})
          </button>
          <button
            onClick={() => setFilter('my')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'my' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            내 민원
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'pending' ? 'bg-slate-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            접수대기 ({complaints.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'in_progress' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            처리중 ({complaints.filter(c => c.status === 'in_progress').length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              filter === 'resolved' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            처리완료 ({complaints.filter(c => c.status === 'resolved').length})
          </button>
        </div>
      </div>

      {/* Complaint List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredComplaints.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Wrench className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-medium">해당 조건의 민원 내역이 없습니다.</p>
          </div>
        ) : (
          filteredComplaints.map((comp) => {
            const isAuthor = comp.authorId === currentUser.id;
            const canDelete = isManager || isAuthor;

            return (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-3"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                      {getCategoryLabel(comp.category)}
                    </span>
                    {comp.isPrivate && (
                      <span className="text-[11px] text-amber-700 font-medium flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> 비밀글
                      </span>
                    )}
                  </div>

                  {/* Status Badge & Delete Button */}
                  <div className="flex items-center gap-1.5">
                    {comp.status === 'pending' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>접수대기</span>
                      </span>
                    )}
                    {comp.status === 'in_progress' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>처리중</span>
                      </span>
                    )}
                    {comp.status === 'resolved' && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>처리완료</span>
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(comp)}
                      className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                      title="민원 내역 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & Content */}
                <div>
                  <h4 className="font-bold text-slate-900 text-sm md:text-base mb-1">
                    {comp.title}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {comp.content}
                  </p>
                </div>

                {/* Author & Time */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
                  <span>
                    작성자: {comp.authorBuilding} {comp.authorUnit} ({comp.authorName})
                  </span>
                  <span>{comp.createdAt}</span>
                </div>

                {/* Manager Official Reply Box */}
                {comp.managerReply && (
                  <div className="bg-blue-50/80 rounded-xl p-3.5 border border-blue-200 mt-2 space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>관리사무소 공식 조치 답변 ({comp.managerReply.roleTitle} {comp.managerReply.repliedBy})</span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-normal">{comp.managerReply.repliedAt}</span>
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed whitespace-pre-wrap">
                      {comp.managerReply.content}
                    </p>
                  </div>
                )}

                {/* Management Action Bar for Managers (3-way Segmented Control) */}
                {isManager && (
                  <div className="mt-3 pt-3 border-t border-slate-200 bg-slate-50/90 -mx-4 -mb-4 p-3 rounded-b-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        🏢 관리자 상태 지정:
                      </span>
                      <button
                        onClick={() => {
                          setReplyingCompId(replyingCompId === comp.id ? null : comp.id);
                          setManagerReplyText(comp.managerReply?.content || "");
                          setReplyTargetStatus(comp.status === 'pending' ? 'in_progress' : comp.status);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        <span>{comp.managerReply ? "답변 수정" : "공식 답변 등록"}</span>
                      </button>
                    </div>

                    {/* 3-way Segmented Status Buttons */}
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-200/80 p-1 rounded-xl">
                      <button
                        onClick={() => handleStatusChange(comp.id, 'pending')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          comp.status === 'pending'
                            ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>접수대기</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(comp.id, 'in_progress')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          comp.status === 'in_progress'
                            ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>처리중</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange(comp.id, 'resolved')}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                          comp.status === 'resolved'
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>처리완료</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Manager Reply Inline Box */}
                {replyingCompId === comp.id && (
                  <div className="mt-3 p-3.5 bg-blue-50 border border-blue-300 rounded-xl space-y-2.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-blue-950">
                        입주민에게 전달할 공식 조치 답변 입력:
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-blue-900 font-medium">저장 후 상태:</span>
                        <select
                          value={replyTargetStatus}
                          onChange={(e) => setReplyTargetStatus(e.target.value as ComplaintStatus)}
                          className="px-2 py-0.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-blue-900"
                        >
                          <option value="in_progress">처리중</option>
                          <option value="resolved">처리완료</option>
                          <option value="pending">접수대기</option>
                        </select>
                      </div>
                    </div>

                    <textarea
                      value={managerReplyText}
                      onChange={(e) => setManagerReplyText(e.target.value)}
                      placeholder="예: 금일 시설팀 기사님이 현장 점검을 마쳤으며, 교체 자재 입고 후 내일 오전 10시 처리 예정입니다..."
                      rows={3}
                      className="w-full p-2.5 bg-white border border-blue-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 text-slate-900"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setReplyingCompId(null)}
                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-600 rounded-lg text-xs font-medium"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleSaveReply(comp.id)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
                      >
                        답변 저장 및 상태 반영
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Complaint Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">스마트 민원 / 하자 접수</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-3.5 pt-4">
              <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600">
                접수 세대: <strong>{currentUser.building} {currentUser.unit}</strong> ({currentUser.name})
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">민원 카테고리</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="facility">🛠️ 세대/공용 시설 고장 및 하자</option>
                  <option value="parking">🚗 지하주차장 및 불법주차</option>
                  <option value="noise">🔊 층간소음 / 야간 소음</option>
                  <option value="elevator">🛗 승강기 고장 및 이상 소음</option>
                  <option value="landscape">🌳 단지 청소 / 조경 관리</option>
                  <option value="other">📝 기타 일반 문의</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">민원 제목</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 101동 1호 라인 승강기 덜컹거림 점검 요청"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상세 내용</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="증상, 발생 위치, 희망 조치 사항 등을 상세히 기재해주세요..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="comp-private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="comp-private" className="text-xs font-medium text-slate-700">
                  비공개 민원으로 등록 (관리사무소와 본인만 열람)
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md active:scale-95 transition-all"
                >
                  민원접수 올리기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
