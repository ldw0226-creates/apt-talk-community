"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Vote } from "@/types";
import { Vote as VoteIcon, Plus, CheckCircle2, Users, Calendar, AlertCircle, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";

export const VoteView: React.FC = () => {
  const { votes, castVote, createVote, currentUser } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New vote form
  const [voteTitle, setVoteTitle] = useState("");
  const [voteDesc, setVoteDesc] = useState("");
  const [deadline, setDeadline] = useState("2026.09.15");
  const [options, setOptions] = useState<string[]>(["찬성", "반대", "기권"]);

  const isManagerOrRep = currentUser.role === 'representative' || currentUser.role === 'manager' || currentUser.role === 'admin';

  const handleVoteSubmit = (voteId: string, optionId: string) => {
    castVote(voteId, optionId);
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}
  };

  const handleCreateVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voteTitle.trim()) return;

    createVote({
      title: voteTitle.trim(),
      description: voteDesc.trim(),
      author: currentUser.name,
      authorRole: currentUser.roleTitle || "동대표",
      deadline,
      options: options.filter(o => o.trim()).map((text, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: text.trim(),
        votesCount: 0,
      })),
    });

    setVoteTitle("");
    setVoteDesc("");
    setIsCreateModalOpen(false);
  };

  const addOptionField = () => {
    setOptions(prev => [...prev, ""]);
  };

  const updateOptionText = (index: number, val: string) => {
    setOptions(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
            <VoteIcon className="w-5 h-5 text-indigo-600" />
            <span>아파트 주민 전자투표 및 안건 설문</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            단지 내 주요 의사결정(장충금 사용, 시설 개선 등)을 투명하게 결정합니다.
          </p>
        </div>

        {isManagerOrRep && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>새 안건 발의</span>
          </button>
        )}
      </div>

      {/* Vote Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {votes.map((vote) => {
          const hasVoted = vote.votedUserIds.includes(currentUser.id);

          return (
            <div
              key={vote.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-md border border-indigo-200">
                    진행중
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    발의: {vote.author} ({vote.authorRole})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>마감: {vote.deadline}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1.5">
                  {vote.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {vote.description}
                </p>
              </div>

              {/* Total votes */}
              <div className="flex items-center gap-1 text-xs font-bold text-slate-700 pb-1">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>총 참여 세대수: {vote.totalVotes}세대</span>
                {hasVoted && (
                  <span className="ml-2 text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 투표완료
                  </span>
                )}
              </div>

              {/* Options & Progress Bars */}
              <div className="space-y-2.5">
                {vote.options.map((opt) => {
                  const percent = vote.totalVotes > 0 ? Math.round((opt.votesCount / vote.totalVotes) * 100) : 0;

                  return (
                    <div
                      key={opt.id}
                      className="relative overflow-hidden bg-slate-50 border border-slate-200 rounded-xl p-3 transition-all"
                    >
                      {/* Background fill for vote percentage */}
                      <div
                        className="absolute top-0 bottom-0 left-0 bg-indigo-100/70 transition-all duration-500 rounded-xl"
                        style={{ width: `${percent}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 text-xs md:text-sm">
                            {opt.text}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {opt.votesCount}표 ({percent}%)
                          </div>
                        </div>

                        {/* Vote Button */}
                        {!hasVoted ? (
                          <button
                            onClick={() => handleVoteSubmit(vote.id, opt.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95 flex-shrink-0"
                          >
                            선택 투표
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-indigo-900">
                            {percent}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Vote Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">새 주민 안건 투표 발의</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVote} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">안건 제목</label>
                <input
                  type="text"
                  value={voteTitle}
                  onChange={(e) => setVoteTitle(e.target.value)}
                  placeholder="예: 단지 내 분리수거장 비가림막 설치 찬반 투표"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">안건 설명</label>
                <textarea
                  value={voteDesc}
                  onChange={(e) => setVoteDesc(e.target.value)}
                  placeholder="투표 목적 및 기대 효과를 주민들에게 설명해주세요..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">투표 마감일</label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="2026.09.15"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">투표 선택지 항목</label>
                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => updateOptionText(idx, e.target.value)}
                      placeholder={`선택지 ${idx + 1}`}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addOptionField}
                    className="text-xs text-indigo-600 font-bold hover:underline"
                  >
                    + 항목 추가
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  안건 투표 개시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
