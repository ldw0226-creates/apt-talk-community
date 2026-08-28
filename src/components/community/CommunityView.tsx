"use client";

import React, { useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { Notice, MarketItem } from "@/types";
import {
  Megaphone,
  ShoppingBag,
  MessageSquare,
  Plus,
  Heart,
  MapPin,
  Eye,
  Pin,
  AlertTriangle,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  Trash2
} from "lucide-react";

export const CommunityView: React.FC = () => {
  const { notices, addNotice, deleteNotice, marketItems, addMarketItem, likeMarketItem, currentUser, openDirectChat } = useApp();
  const [subTab, setSubTab] = useState<'notices' | 'market'>('notices');
  
  // Track which notices are expanded (First notice expanded by default)
  const [expandedNoticeIds, setExpandedNoticeIds] = useState<Record<string, boolean>>({
    "notice-1": true,
  });

  const toggleNoticeExpand = (id: string) => {
    setExpandedNoticeIds(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteNotice = (e: React.MouseEvent, notice: Notice) => {
    e.stopPropagation();
    if (window.confirm(`"${notice.title}" 공지사항을 정말 삭제하시겠습니까?`)) {
      deleteNotice(notice.id);
    }
  };

  // Notice modal
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeCategory, setNoticeCategory] = useState<'urgent' | 'maintenance' | 'general' | 'event'>('general');
  const [isNoticePinned, setIsNoticePinned] = useState(false);

  // Market modal
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [marketTitle, setMarketTitle] = useState("");
  const [marketDesc, setMarketDesc] = useState("");
  const [marketPrice, setMarketPrice] = useState("");
  const [isFreeSharing, setIsFreeSharing] = useState(true);
  const [locationTip, setLocationTip] = useState(`${currentUser.building} 로비 앞`);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const marketFileRef = useRef<HTMLInputElement>(null);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    addNotice({
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      category: noticeCategory,
      author: currentUser.name,
      authorRole: currentUser.roleTitle || (currentUser.role === 'representative' ? '동대표' : '관리사무소'),
      isPinned: isNoticePinned,
    });

    setNoticeTitle("");
    setNoticeContent("");
    setIsNoticeModalOpen(false);
  };

  const handleMarketPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      setCustomImage(loadEvt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMarket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketTitle.trim()) return;

    addMarketItem({
      title: marketTitle.trim(),
      description: marketDesc.trim(),
      price: isFreeSharing ? 0 : Number(marketPrice) || 0,
      isFree: isFreeSharing,
      locationTip: locationTip.trim() || `${currentUser.building} 앞`,
      imageUrl: customImage || (isFreeSharing
        ? "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=500&auto=format&fit=crop&q=60"
        : "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=500&auto=format&fit=crop&q=60"),
    });

    setMarketTitle("");
    setMarketDesc("");
    setMarketPrice("");
    setCustomImage(null);
    setIsMarketModalOpen(false);
  };

  const handleDirectChat = (item: MarketItem) => {
    openDirectChat({
      id: item.authorId,
      name: item.authorName,
      building: item.authorBuilding,
      unit: item.authorUnit,
    });
  };

  const isManagerOrRep = currentUser.role === 'manager' || currentUser.role === 'representative' || currentUser.role === 'admin';

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Sub Tabs */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('notices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'notices'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>단지 공식 공지사항</span>
          </button>

          <button
            onClick={() => setSubTab('market')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'market'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>이웃 나눔 & 장터</span>
          </button>
        </div>

        {/* Action Button */}
        {subTab === 'notices' && isManagerOrRep && (
          <button
            onClick={() => setIsNoticeModalOpen(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>공지 등록</span>
          </button>
        )}

        {subTab === 'market' && (
          <button
            onClick={() => setIsMarketModalOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>물품 등록</span>
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Notices Tab (Accordion / Expandable Cards) */}
        {subTab === 'notices' && (
          <div className="space-y-3">
            {notices.map((notice) => {
              const isExpanded = !!expandedNoticeIds[notice.id];

              return (
                <div
                  key={notice.id}
                  className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                    notice.category === 'urgent'
                      ? 'border-red-300 bg-red-50/20'
                      : isExpanded
                      ? 'border-blue-300 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Clickable Header */}
                  <div
                    onClick={() => toggleNoticeExpand(notice.id)}
                    className="p-4 cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {notice.isPinned && (
                          <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                            <Pin className="w-2.5 h-2.5" /> 중요고정
                          </span>
                        )}
                        {notice.category === 'urgent' && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-xs">
                            <AlertTriangle className="w-2.5 h-2.5" /> 긴급공지
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 font-medium">
                          {notice.createdAt} · {notice.authorRole} ({notice.author})
                        </span>
                      </div>

                      {/* Right: Delete (if manager) & Expand/Collapse Chevron */}
                      <div className="flex items-center gap-1.5">
                        {isManagerOrRep && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteNotice(e, notice)}
                            className="p-1 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="관리자 권한: 공지 삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex-shrink-0"
                          title={isExpanded ? "접기" : "내용 펼치기"}
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Notice Title */}
                    <h3 className={`font-bold text-slate-900 text-sm md:text-base leading-snug ${isExpanded ? "text-blue-950" : ""}`}>
                      {notice.title}
                    </h3>

                    {/* Collapsed Preview (2 lines) */}
                    {!isExpanded && (
                      <div className="mt-1.5">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {notice.content}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-blue-600">
                          <span>자세히 보기</span>
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Full Content Section */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 animate-fadeIn space-y-3">
                      <p className="text-xs md:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap pt-2">
                        {notice.content}
                      </p>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> 읽음 {notice.views}회
                        </span>

                        <div className="flex items-center gap-2">
                          {isManagerOrRep && (
                            <button
                              onClick={(e) => handleDeleteNotice(e, notice)}
                              className="text-red-600 hover:text-red-800 font-medium text-xs px-2.5 py-1 rounded-md hover:bg-red-50 border border-red-200 transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>공지 삭제</span>
                            </button>
                          )}
                          <button
                            onClick={() => toggleNoticeExpand(notice.id)}
                            className="text-slate-500 hover:text-slate-800 font-medium text-xs px-2 py-1 rounded-md hover:bg-slate-100 transition-colors"
                          >
                            접기 ▲
                          </button>
                          <button
                            onClick={() => handleDirectChat({
                              id: "user-manager-1",
                              authorId: "user-manager-1",
                              authorName: "정소장",
                              authorBuilding: "관리동",
                              authorUnit: "관리사무소",
                              title: notice.title,
                              description: "",
                              price: 0,
                              isFree: true,
                              status: "selling",
                              locationTip: "",
                              createdAt: "",
                              likesCount: 0,
                              chatsCount: 0,
                            })}
                            className="text-blue-600 font-bold hover:underline flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            <span>관리소 1:1 문의</span>
                            <MessageSquare className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Market Tab */}
        {subTab === 'market' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {marketItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {item.imageUrl && (
                    <div className="h-44 w-full bg-slate-100 relative overflow-hidden">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      {item.isFree && (
                        <div className="absolute top-3 left-3 bg-emerald-500 text-white font-extrabold text-xs px-2.5 py-1 rounded-full shadow-md">
                          🎁 무료 나눔
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                      <span>{item.authorBuilding} {item.authorUnit} ({item.authorName})</span>
                      <span>{item.createdAt}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm md:text-base leading-snug mb-1">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="text-base font-extrabold text-slate-900">
                        {item.isFree ? "0원 (나눔)" : `${item.price.toLocaleString()}원`}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        <span>{item.locationTip}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => likeMarketItem(item.id)}
                    className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span className="font-bold">{item.likesCount}</span>
                  </button>

                  <button
                    onClick={() => handleDirectChat(item)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>판매자와 1:1 대화</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notice Create Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">단지 공식 공지사항 작성</h3>
              <button onClick={() => setIsNoticeModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateNotice} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">공지 분류</label>
                <select
                  value={noticeCategory}
                  onChange={(e) => setNoticeCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                >
                  <option value="general">일반 안내 (주차, 시설 이용 등)</option>
                  <option value="urgent">긴급 공지 (단수, 단전, 소독 등)</option>
                  <option value="maintenance">정기 점검 (승강기, 소방 점검)</option>
                  <option value="event">행사/축제 (주민 나눔 장터)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">제목</label>
                <input
                  type="text"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="공지 제목을 입력하세요"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상세 내용</label>
                <textarea
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="주민들에게 안내할 상세 내용을 작성해주세요..."
                  rows={5}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={isNoticePinned}
                  onChange={(e) => setIsNoticePinned(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="pin" className="text-xs font-medium text-slate-700">
                  게시판 및 톡방 상단에 고정하기
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  공지 등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Market Create Modal */}
      {isMarketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">이웃 나눔 / 중고 물품 등록</h3>
              <button onClick={() => setIsMarketModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMarket} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">물품명</label>
                <input
                  type="text"
                  value={marketTitle}
                  onChange={(e) => setMarketTitle(e.target.value)}
                  placeholder="예: 어린이 자전거, 원목 식탁 등"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              {/* Photo Upload for Item */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">물품 사진</label>
                <input
                  type="file"
                  ref={marketFileRef}
                  accept="image/*"
                  onChange={handleMarketPhotoUpload}
                  className="hidden"
                />
                {customImage ? (
                  <div className="relative rounded-xl overflow-hidden h-36 border border-slate-300">
                    <img src={customImage} alt="선택 사진" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCustomImage(null)}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => marketFileRef.current?.click()}
                    className="w-full py-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-700 transition-colors"
                  >
                    <Camera className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold">내 사진 올리기</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFreeSharing(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isFreeSharing ? "bg-emerald-50 border-emerald-600 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  🎁 무료 나눔
                </button>
                <button
                  type="button"
                  onClick={() => setIsFreeSharing(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                    !isFreeSharing ? "bg-blue-50 border-blue-600 text-blue-800" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  💰 중고 판매
                </button>
              </div>

              {!isFreeSharing && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">가격 (원)</label>
                  <input
                    type="number"
                    value={marketPrice}
                    onChange={(e) => setMarketPrice(e.target.value)}
                    placeholder="예: 25000"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">희망 직거래 장소</label>
                <input
                  type="text"
                  value={locationTip}
                  onChange={(e) => setLocationTip(e.target.value)}
                  placeholder="예: 101동 1층 필로티, 관리동 분수대 앞"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">상세 설명</label>
                <textarea
                  value={marketDesc}
                  onChange={(e) => setMarketDesc(e.target.value)}
                  placeholder="물품의 상태나 거래 가능한 시간대를 적어주세요..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  등록 완료하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
