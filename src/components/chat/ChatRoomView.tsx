"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { RoleBadge } from "@/components/common/RoleBadge";
import {
  ArrowLeft,
  Send,
  Plus,
  Image as ImageIcon,
  Camera,
  Pin,
  ChevronDown,
  ChevronUp,
  Users,
  Wrench,
  Megaphone,
  ArrowDown,
  X,
  Maximize2
} from "lucide-react";

export const ChatRoomView: React.FC = () => {
  const { activeRoomId, setActiveRoomId, chatRooms, messages, sendMessage, currentUser, setActiveTab } = useApp();
  const [inputText, setInputText] = useState("");
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentRoom = chatRooms.find((r) => r.id === activeRoomId);
  const roomMessages = activeRoomId ? messages[activeRoomId] || [] : [];

  // Track scroll position to decide whether to auto-scroll or show floating down button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 120;
    setShowScrollBottomBtn(isScrolledUp);
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom on initial room enter or new messages if user isn't scrolled up
  useEffect(() => {
    if (!showScrollBottomBtn) {
      scrollToBottom("smooth");
    }
  }, [roomMessages.length]);

  // Initial scroll on mount
  useEffect(() => {
    scrollToBottom("auto");
  }, [activeRoomId]);

  if (!currentRoom) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(currentRoom.id, inputText.trim());
    setInputText("");
    setShowScrollBottomBtn(false);
    setTimeout(() => scrollToBottom("smooth"), 50);
    inputRef.current?.focus();
  };

  // Real Image Upload Handler (Converts file to base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        sendMessage(currentRoom.id, "📸 사진을 공유했습니다.", dataUrl);
        setIsPlusMenuOpen(false);
        setTimeout(() => scrollToBottom("smooth"), 100);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input
  };

  const handleSendQuickPhoto = (url: string, label: string) => {
    sendMessage(currentRoom.id, label, url);
    setIsPlusMenuOpen(false);
    setTimeout(() => scrollToBottom("smooth"), 100);
  };

  return (
    <div className="flex flex-col h-full bg-[#BACEE0] relative">
      {/* Hidden File Input for Native Camera / Photo Library */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top KakaoTalk Style Header */}
      <div className="bg-[#A2B8CC]/90 backdrop-blur-md px-3 py-2.5 flex items-center justify-between border-b border-[#92A8BC] shadow-xs z-10">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setActiveRoomId(null)}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors text-slate-800"
            title="대화방 목록으로 나가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 text-sm md:text-base truncate">
                {currentRoom.name}
              </h3>
              <span className="text-slate-700 text-xs font-semibold flex items-center gap-0.5 flex-shrink-0">
                <Users className="w-3.5 h-3.5" />
                {currentRoom.memberCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-700 truncate">
              {currentRoom.targetBuilding ? `${currentRoom.targetBuilding} 입주민 전용 인증 채널` : currentRoom.description}
            </p>
          </div>
        </div>

        {/* Right side info */}
        <div className="flex items-center gap-1">
          <RoleBadge
            role={currentUser.role}
            roleTitle={currentUser.roleTitle}
            building={currentUser.building}
            unit={currentUser.unit}
            size="sm"
          />
        </div>
      </div>

      {/* Pinned Notice Header if available */}
      {currentRoom.pinnedNotice && (
        <div className="bg-white/95 border-b border-slate-200 px-4 py-2 text-xs shadow-xs transition-all z-10">
          <div
            onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
              <Pin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 rotate-45" />
              <span className="truncate">{currentRoom.pinnedNotice}</span>
            </div>
            <button className="text-slate-400 hover:text-slate-700 p-0.5">
              {isNoticeExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          {isNoticeExpanded && (
            <div className="mt-2 pt-2 border-t border-slate-100 text-slate-600 text-[11px] leading-relaxed animate-fadeIn">
              <p>
                본 톡방은 <strong>{currentRoom.name}</strong> 입주민 전용 채널입니다.
                상호 존중과 배려를 바탕으로 쾌적한 아파트 커뮤니티 문화를 함께 만들어가요!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Message Stream */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3.5 relative"
      >
        {/* Date Divider */}
        <div className="flex justify-center my-2 sticky top-0 z-0">
          <span className="bg-black/25 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-xs">
            2026년 8월 28일 금요일
          </span>
        </div>

        {roomMessages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 animate-fadeIn ${isMe ? "justify-end" : "justify-start"}`}
            >
              {/* Other sender Avatar */}
              {!isMe && (
                <div className="w-9 h-9 rounded-xl bg-white overflow-hidden border border-black/10 shadow-xs flex-shrink-0 mt-0.5">
                  <img
                    src={msg.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(msg.senderName)}`}
                    alt={msg.senderName}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Message Content Area */}
              <div className={`flex flex-col max-w-[78%] ${isMe ? "items-end" : "items-start"}`}>
                {/* Sender Name & Role Badges */}
                {!isMe && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-bold text-xs text-slate-900">
                      {msg.senderName}
                    </span>
                    <RoleBadge
                      role={msg.senderRole}
                      roleTitle={msg.senderRoleTitle}
                      building={msg.senderBuilding}
                      unit={msg.senderUnit}
                      size="sm"
                    />
                  </div>
                )}

                {/* Bubble & Time wrapper */}
                <div className={`flex items-end gap-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  {/* Bubble */}
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm shadow-xs break-words whitespace-pre-wrap leading-relaxed ${
                      isMe
                        ? "bg-[#FEE500] text-[#3A1D1D] rounded-tr-none font-medium"
                        : "bg-white text-slate-900 rounded-tl-none border border-black/5"
                    }`}
                  >
                    {/* Image if any */}
                    {msg.imageUrl && (
                      <div
                        onClick={() => setPreviewImage(msg.imageUrl || null)}
                        className="mb-2 rounded-xl overflow-hidden max-w-[260px] border border-black/10 cursor-pointer relative group"
                      >
                        <img
                          src={msg.imageUrl}
                          alt="전송 이미지"
                          className="w-full h-auto object-cover max-h-[300px] group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Maximize2 className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                    {msg.content}
                  </div>

                  {/* Metadata (Time) */}
                  <div className={`flex flex-col text-[10px] text-slate-600 font-medium ${isMe ? "items-end" : "items-start"}`}>
                    <span className="whitespace-nowrap">{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottomBtn && (
        <button
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-20 right-4 z-20 bg-slate-900/90 hover:bg-slate-900 text-white px-3 py-1.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-1.5 animate-bounce"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>최신 대화 보기</span>
        </button>
      )}

      {/* Quick Suggestion Pills */}
      <div className="px-3 py-1.5 bg-[#BACEE0] flex gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-2.5 py-1 bg-white/95 hover:bg-white text-blue-900 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs whitespace-nowrap active:scale-95 transition-all"
        >
          <Camera className="w-3 h-3 text-blue-600" />
          <span>사진 촬영 / 앨범</span>
        </button>
        <button
          onClick={() => setActiveTab("complaint")}
          className="px-2.5 py-1 bg-white/95 hover:bg-white text-blue-900 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs whitespace-nowrap active:scale-95 transition-all"
        >
          <Wrench className="w-3 h-3 text-amber-600" />
          <span>관리소 민원 접수</span>
        </button>
        <button
          onClick={() => setInputText("안녕하세요! 설악디엘본 입주민 여러분 좋은 하루 되세요 😊")}
          className="px-2.5 py-1 bg-white/95 hover:bg-white text-slate-800 rounded-full text-[11px] font-medium shadow-xs whitespace-nowrap active:scale-95 transition-all"
        >
          👋 이웃 인사
        </button>
      </div>

      {/* Plus Menu Popup */}
      {isPlusMenuOpen && (
        <div className="bg-white border-t border-slate-200 p-4 grid grid-cols-3 gap-3 animate-fadeIn">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-200 flex flex-col items-center gap-1.5 text-center transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-blue-950">내 사진 첨부</span>
          </button>

          <button
            onClick={() => {
              setIsPlusMenuOpen(false);
              setActiveTab("complaint");
            }}
            className="p-3 bg-amber-50 hover:bg-amber-100 rounded-2xl border border-amber-200 flex flex-col items-center gap-1.5 text-center transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-amber-950">스마트 민원</span>
          </button>

          <button
            onClick={() => {
              setIsPlusMenuOpen(false);
              setActiveTab("vote");
            }}
            className="p-3 bg-indigo-50 hover:bg-indigo-100 rounded-2xl border border-indigo-200 flex flex-col items-center gap-1.5 text-center transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-indigo-950">전자 투표</span>
          </button>
        </div>
      )}

      {/* Bottom KakaoTalk Input Bar */}
      <form
        onSubmit={handleSend}
        className="bg-white border-t border-slate-200 p-2.5 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
          className={`p-2 rounded-full transition-all text-slate-600 ${isPlusMenuOpen ? "bg-slate-200 rotate-45" : "hover:bg-slate-100 active:scale-90"}`}
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-slate-100 rounded-2xl px-3.5 py-2 flex items-center gap-2 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="메시지를 입력하세요... (Enter 전송)"
            className="w-full bg-transparent text-sm text-slate-900 focus:outline-none placeholder-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xs ${
            inputText.trim()
              ? "bg-[#FEE500] hover:bg-[#FADA0A] text-[#3A1D1D] active:scale-95 cursor-pointer font-bold"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

      {/* Image Zoom Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out"
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full hover:bg-white/40"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={previewImage}
            alt="확대 사진"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
