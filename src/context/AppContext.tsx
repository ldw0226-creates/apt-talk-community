"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User, ChatRoom, ChatMessage, Notice, Complaint, Vote, MarketItem, UserRole, ComplaintStatus, ToastNotification } from "@/types";
import { DEMO_USERS, INITIAL_CHAT_ROOMS, INITIAL_MESSAGES, INITIAL_NOTICES, INITIAL_COMPLAINTS, INITIAL_VOTES, INITIAL_MARKET_ITEMS, APARTMENT_NAME } from "@/lib/constants";
import { notificationManager } from "@/lib/notification";

export type NavTab = 'chat' | 'community' | 'complaint' | 'vote' | 'directory' | 'profile';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  chatRooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  sendMessage: (roomId: string, content: string, imageUrl?: string) => void;
  notices: Notice[];
  addNotice: (notice: Omit<Notice, "id" | "createdAt" | "views">) => void;
  deleteNotice: (id: string) => void;
  complaints: Complaint[];
  addComplaint: (complaint: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "status" | "authorId" | "authorName" | "authorBuilding" | "authorUnit">) => void;
  deleteComplaint: (id: string) => void;
  updateComplaintStatus: (id: string, status: ComplaintStatus, replyContent?: string) => void;
  votes: Vote[];
  castVote: (voteId: string, optionId: string) => void;
  createVote: (vote: Omit<Vote, "id" | "createdAt" | "totalVotes" | "votedUserIds" | "status">) => void;
  marketItems: MarketItem[];
  addMarketItem: (item: Omit<MarketItem, "id" | "createdAt" | "authorId" | "authorName" | "authorBuilding" | "authorUnit" | "likesCount" | "chatsCount" | "status">) => void;
  likeMarketItem: (id: string) => void;
  openDirectChat: (targetUser: { id: string; name: string; building: string; unit: string; roleTitle?: string; role?: UserRole }) => string;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isDemoSwitcherOpen: boolean;
  setIsDemoSwitcherOpen: (open: boolean) => void;
  canAccessRoom: (room: ChatRoom) => { canAccess: boolean; reason?: string };
  switchDemoUser: (userId: string) => void;
  registerUser: (newUser: Omit<User, "id" | "isVerified" | "joinedAt">) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => Promise<void>;
  toastNotification: ToastNotification | null;
  dismissToast: () => void;
  showToast: (toast: Omit<ToastNotification, "id" | "timestamp">) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: "apt_talk_user_v3",
  MESSAGES: "apt_talk_messages_v3",
  COMPLAINTS: "apt_talk_complaints_v3",
  VOTES: "apt_talk_votes_v3",
  NOTICES: "apt_talk_notices_v3",
  MARKET: "apt_talk_market_v3",
  ROOMS: "apt_talk_rooms_v3",
  NOTIF_ENABLED: "apt_talk_notif_enabled_v3",
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User>(DEMO_USERS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(INITIAL_CHAT_ROOMS);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [notices, setNotices] = useState<Notice[]>(INITIAL_NOTICES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [votes, setVotes] = useState<Vote[]>(INITIAL_VOTES);
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET_ITEMS);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDemoSwitcherOpen, setIsDemoSwitcherOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [toastNotification, setToastNotification] = useState<ToastNotification | null>(null);

  // Show in-app drop down toast with auto-dismiss
  const showToast = useCallback((toastData: Omit<ToastNotification, "id" | "timestamp">) => {
    const newToast: ToastNotification = {
      ...toastData,
      id: `toast-${Date.now()}`,
      timestamp: "방금",
    };
    setToastNotification(newToast);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToastNotification(prev => (prev?.id === newToast.id ? null : prev));
    }, 4000);
  }, []);

  const dismissToast = useCallback(() => {
    setToastNotification(null);
  }, []);

  // Request & Toggle Push Notification Permissions
  const toggleNotifications = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (!notificationsEnabled) {
      const perm = await notificationManager.requestPermission();
      if (perm === "granted") {
        setNotificationsEnabled(true);
        localStorage.setItem(STORAGE_KEYS.NOTIF_ENABLED, "true");
        notificationManager.playMessageSound();
        notificationManager.triggerVibration(100);
        notificationManager.sendPushNotification("설악디엘본아파트톡 알림 활성화", {
          body: "실시간 대화방 및 아파트 공지, 민원 알림을 정상적으로 수신합니다.",
        });
        showToast({
          title: "🔔 알림 활성화 완료",
          message: "새 메시지와 민원 답변 시 푸시 및 소리 알림이 전송됩니다.",
          type: "notice",
        });
      } else {
        alert("브라우저 설정에서 알림 권한이 차단되어 있습니다. 브라우저 주소창 왼쪽 자물쇠 아이콘에서 알림을 허용해주세요.");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem(STORAGE_KEYS.NOTIF_ENABLED, "false");
      showToast({
        title: "🔕 알림 꺼짐",
        message: "푸시 및 소리 알림이 비활성화되었습니다.",
        type: "notice",
      });
    }
  }, [notificationsEnabled, showToast]);

  // Load initial data from localStorage if available with legacy fallback
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem("apt_talk_user_v2");
      if (savedUser) setCurrentUserState(JSON.parse(savedUser));

      const savedMsgs = localStorage.getItem(STORAGE_KEYS.MESSAGES) || localStorage.getItem("apt_talk_messages_v2");
      if (savedMsgs) setMessages(JSON.parse(savedMsgs));

      const savedComplaints = localStorage.getItem(STORAGE_KEYS.COMPLAINTS) || localStorage.getItem("apt_talk_complaints_v2");
      if (savedComplaints) setComplaints(JSON.parse(savedComplaints));

      const savedVotes = localStorage.getItem(STORAGE_KEYS.VOTES) || localStorage.getItem("apt_talk_votes_v2");
      if (savedVotes) setVotes(JSON.parse(savedVotes));

      const savedNotices = localStorage.getItem(STORAGE_KEYS.NOTICES) || localStorage.getItem("apt_talk_notices_v2");
      if (savedNotices) setNotices(JSON.parse(savedNotices));

      const savedMarket = localStorage.getItem(STORAGE_KEYS.MARKET) || localStorage.getItem("apt_talk_market_v2");
      if (savedMarket) setMarketItems(JSON.parse(savedMarket));

      const savedRooms = localStorage.getItem(STORAGE_KEYS.ROOMS) || localStorage.getItem("apt_talk_rooms_v2");
      if (savedRooms) setChatRooms(JSON.parse(savedRooms));

      const savedNotifPref = localStorage.getItem(STORAGE_KEYS.NOTIF_ENABLED);
      if (savedNotifPref === "true" && notificationManager.getPermissionStatus() === "granted") {
        setNotificationsEnabled(true);
      }
    } catch (e) {
      console.warn("Storage loading fallback to initial constants", e);
    }
  }, []);

  const setCurrentUser = useCallback((user: User) => {
    setCurrentUserState(user);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const switchDemoUser = useCallback((userId: string) => {
    const target = DEMO_USERS.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setIsDemoSwitcherOpen(false);
      showToast({
        title: `👤 계정 변경: ${target.name}`,
        message: `${target.building} ${target.unit} (${target.roleTitle || target.role}) 모드로 전환되었습니다.`,
        type: "notice",
      });
    }
  }, [setCurrentUser, showToast]);

  const registerUser = useCallback((userData: Omit<User, "id" | "isVerified" | "joinedAt">) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    
    let roleTitle = userData.roleTitle;
    if (!roleTitle) {
      if (userData.role === 'representative') roleTitle = `${userData.building} 동대표 👑`;
      else if (userData.role === 'manager') roleTitle = '관리사무소 직원 🏢';
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      roleTitle,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userData.name)}`,
      isVerified: true,
      joinedAt: formattedDate,
    };

    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
  }, [setCurrentUser]);

  // Open or Create a Direct 1:1 Chat Room
  const openDirectChat = useCallback((targetUser: { id: string; name: string; building: string; unit: string; roleTitle?: string; role?: UserRole }) => {
    const roomId = `room-direct-${[currentUser.id, targetUser.id].sort().join('-')}`;
    
    // Check if room already exists
    setChatRooms(prev => {
      const exists = prev.find(r => r.id === roomId);
      if (exists) return prev;

      const newRoom: ChatRoom = {
        id: roomId,
        name: `💬 1:1 대화: ${targetUser.name} (${targetUser.building} ${targetUser.unit})`,
        type: 'direct',
        description: `${currentUser.name}님과 ${targetUser.name}님의 1:1 안전 직거래 및 이웃 대화방입니다.`,
        memberCount: 2,
        unreadCount: 0,
        lastMessage: "대화방이 개설되었습니다.",
        lastMessageTime: "방금",
      };

      const updated = [newRoom, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setActiveRoomId(roomId);
    setActiveTab('chat');
    return roomId;
  }, [currentUser]);

  // Check if current user has permission to access a chat room
  const canAccessRoom = useCallback((room: ChatRoom): { canAccess: boolean; reason?: string } => {
    if (currentUser.role === 'admin' || currentUser.role === 'manager') {
      return { canAccess: true };
    }

    if (room.type === 'complex' || room.type === 'direct') {
      return { canAccess: true };
    }

    if (room.type === 'building') {
      if (currentUser.building === room.targetBuilding) {
        return { canAccess: true };
      }
      return {
        canAccess: false,
        reason: `해당 방은 [${room.targetBuilding}] 입주민 전용 톡방입니다. (현재 소속: ${currentUser.building})`
      };
    }

    if (room.type === 'rep_council') {
      if (currentUser.role === 'representative') {
        return { canAccess: true };
      }
      return {
        canAccess: false,
        reason: `[입주자대표회의] 비공개 회의방입니다. 동대표 또는 관리소 임원만 입장할 수 있습니다.`
      };
    }

    if (room.type === 'manager_1on1') {
      return { canAccess: true };
    }

    return { canAccess: true };
  }, [currentUser]);

  // Send message with instant Optimistic UI + Sound/Vibration/WebPush for incoming replies
  const sendMessage = useCallback((roomId: string, content: string, imageUrl?: string) => {
    if (!content.trim() && !imageUrl) return;

    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHour = hours % 12 || 12;
    const timeStr = `${ampm} ${displayHour}:${minutes}`;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      roomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      senderBuilding: currentUser.building,
      senderUnit: currentUser.unit,
      senderRoleTitle: currentUser.roleTitle,
      avatarUrl: currentUser.avatarUrl,
      content,
      imageUrl,
      timestamp: timeStr,
      unreadMembersCount: 0,
    };

    // 1. Optimistic instant state update
    setMessages(prev => {
      const roomMsgs = prev[roomId] || [];
      const updated = { ...prev, [roomId]: [...roomMsgs, newMsg] };
      try {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 2. Update chat room last message
    setChatRooms(prev => {
      const updated = prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            lastMessage: imageUrl ? '📷 사진을 보냈습니다.' : content,
            lastMessageTime: timeStr,
          };
        }
        return room;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // 3. Simulated delightful interactive response for Manager 1:1 or Complex Chat
    if (roomId === 'room-manager-1on1' && currentUser.role === 'resident') {
      setTimeout(() => {
        const replyTime = `${ampm} ${displayHour}:${String(Number(minutes) + 1).padStart(2, '0')}`;
        const autoReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          roomId: 'room-manager-1on1',
          senderId: 'user-manager-1',
          senderName: '정소장',
          senderRole: 'manager',
          senderBuilding: '관리동',
          senderUnit: '관리사무소',
          senderRoleTitle: '관리사무소장 🏢',
          avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=ManagerJeong',
          content: `[관리사무소 확인] ${currentUser.name}님(${currentUser.building} ${currentUser.unit}), 문의 사항이 정상 접수되었습니다. 시설팀 담당자가 신속히 확인 후 조치하겠습니다.`,
          timestamp: replyTime,
          unreadMembersCount: 0,
        };

        // Notify incoming message from other user
        notificationManager.playMessageSound();
        notificationManager.triggerVibration(70);
        notificationManager.sendPushNotification("📢 관리사무소 실시간 답변 도착", {
          body: `${currentUser.name}님의 문의사항에 관리소장이 답변을 등록했습니다.`,
        });

        setMessages(prev => {
          const roomMsgs = prev['room-manager-1on1'] || [];
          const updated = { ...prev, ['room-manager-1on1']: [...roomMsgs, autoReply] };
          try {
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });

        // Show in-app toast if user is on another screen
        if (activeRoomId !== 'room-manager-1on1') {
          showToast({
            title: "💬 관리사무소 1:1 새 답변",
            message: "접수하신 민원에 대한 답변이 등록되었습니다.",
            type: "message",
            linkRoomId: "room-manager-1on1",
          });
        }
      }, 1200);
    }
  }, [currentUser, activeRoomId, showToast]);

  // Notice actions
  const addNotice = useCallback((noticeData: Omit<Notice, "id" | "createdAt" | "views">) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const newNotice: Notice = {
      ...noticeData,
      id: `notice-${Date.now()}`,
      createdAt: formattedDate,
      views: 1,
    };

    notificationManager.playAlertSound();
    notificationManager.triggerVibration([100, 50, 100]);
    notificationManager.sendPushNotification(`📢 아파트 새 공지: ${noticeData.title}`, {
      body: noticeData.content.slice(0, 80) + "...",
    });

    setNotices(prev => {
      const updated = [newNotice, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast({
      title: "📢 새로운 공식 공지 등록",
      message: noticeData.title,
      type: "notice",
    });
  }, [showToast]);

  const deleteNotice = useCallback((id: string) => {
    setNotices(prev => {
      const updated = prev.filter(n => n.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast({
      title: "🗑️ 공지사항 삭제 완료",
      message: "해당 공지사항이 정상적으로 삭제되었습니다.",
      type: "notice",
    });
  }, [showToast]);

  // Complaint actions
  const addComplaint = useCallback((complaintData: Omit<Complaint, "id" | "createdAt" | "updatedAt" | "status" | "authorId" | "authorName" | "authorBuilding" | "authorUnit">) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const newComplaint: Complaint = {
      ...complaintData,
      id: `comp-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorBuilding: currentUser.building,
      authorUnit: currentUser.unit,
      status: 'pending',
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    setComplaints(prev => {
      const updated = [newComplaint, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast({
      title: "🛠️ 스마트 민원 접수 완료",
      message: "관리사무소 담당자에게 알림이 전송되었습니다.",
      type: "complaint",
    });
  }, [currentUser, showToast]);

  const deleteComplaint = useCallback((id: string) => {
    setComplaints(prev => {
      const updated = prev.filter(c => c.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast({
      title: "🗑️ 민원 내역 삭제 완료",
      message: "해당 민원이 목록에서 삭제되었습니다.",
      type: "complaint",
    });
  }, [showToast]);

  const updateComplaintStatus = useCallback((id: string, status: ComplaintStatus, replyContent?: string) => {
    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let targetComplaintTitle = "민원";

    setComplaints(prev => {
      const updated = prev.map(c => {
        if (c.id === id) {
          targetComplaintTitle = c.title;
          return {
            ...c,
            status,
            updatedAt: timeStr,
            managerReply: replyContent ? {
              repliedBy: currentUser.name,
              roleTitle: currentUser.roleTitle || '관리사무소',
              content: replyContent,
              repliedAt: timeStr,
            } : c.managerReply,
          };
        }
        return c;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save updated complaints:", e);
      }
      return updated;
    });

    // Sound & Notification
    notificationManager.playAlertSound();
    notificationManager.triggerVibration(100);
    const statusLabel = status === "resolved" ? "처리 완료" : status === "in_progress" ? "처리 중" : "접수 대기";
    notificationManager.sendPushNotification(`[민원 ${statusLabel}] ${targetComplaintTitle}`, {
      body: replyContent || `민원 상태가 [${statusLabel}](으)로 변경되었습니다.`,
    });

    showToast({
      title: `🛠️ 민원 상태 변경: [${statusLabel}]`,
      message: replyContent ? `답변: "${replyContent.slice(0, 35)}..."` : targetComplaintTitle,
      type: "complaint",
    });
  }, [currentUser, showToast]);

  // Vote actions
  const castVote = useCallback((voteId: string, optionId: string) => {
    setVotes(prev => {
      const updated = prev.map(vote => {
        if (vote.id === voteId) {
          if (vote.votedUserIds.includes(currentUser.id)) return vote; // already voted
          const nextOptions = vote.options.map(opt => {
            if (opt.id === optionId) {
              return { ...opt, votesCount: opt.votesCount + 1 };
            }
            return opt;
          });
          return {
            ...vote,
            totalVotes: vote.totalVotes + 1,
            votedUserIds: [...vote.votedUserIds, currentUser.id],
            options: nextOptions,
          };
        }
        return vote;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast({
      title: "🗳️ 투표 참여 완료",
      message: "설악디엘본 주민 전자투표에 소중한 1표가 반영되었습니다.",
      type: "vote",
    });
  }, [currentUser, showToast]);

  const createVote = useCallback((voteData: Omit<Vote, "id" | "createdAt" | "totalVotes" | "votedUserIds" | "status">) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const newVote: Vote = {
      ...voteData,
      id: `vote-${Date.now()}`,
      createdAt: formattedDate,
      totalVotes: 0,
      votedUserIds: [],
      status: 'ongoing',
    };

    notificationManager.playAlertSound();
    notificationManager.sendPushNotification(`🗳️ 새 주민투표 시작: ${voteData.title}`, {
      body: voteData.description.slice(0, 70) + "...",
    });

    setVotes(prev => {
      const updated = [newVote, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast({
      title: "🗳️ 신규 주민투표 상정",
      message: voteData.title,
      type: "vote",
    });
  }, [showToast]);

  // Market actions
  const addMarketItem = useCallback((itemData: Omit<MarketItem, "id" | "createdAt" | "authorId" | "authorName" | "authorBuilding" | "authorUnit" | "likesCount" | "chatsCount" | "status">) => {
    const newItem: MarketItem = {
      ...itemData,
      id: `market-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorBuilding: currentUser.building,
      authorUnit: currentUser.unit,
      createdAt: "방금 전",
      likesCount: 0,
      chatsCount: 0,
      status: "selling",
    };
    setMarketItems(prev => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.MARKET, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    showToast({
      title: "🎁 나눔/장터 물품 등록 완료",
      message: `${newItem.title}이(가) 이웃 장터에 등록되었습니다.`,
      type: "notice",
    });
  }, [currentUser, showToast]);

  const likeMarketItem = useCallback((id: string) => {
    setMarketItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, likesCount: item.likesCount + 1 } : item);
      try {
        localStorage.setItem(STORAGE_KEYS.MARKET, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeTab,
        setActiveTab,
        activeRoomId,
        setActiveRoomId,
        chatRooms,
        messages,
        sendMessage,
        notices,
        addNotice,
        deleteNotice,
        complaints,
        addComplaint,
        deleteComplaint,
        updateComplaintStatus,
        votes,
        castVote,
        createVote,
        marketItems,
        addMarketItem,
        likeMarketItem,
        openDirectChat,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isDemoSwitcherOpen,
        setIsDemoSwitcherOpen,
        canAccessRoom,
        switchDemoUser,
        registerUser,
        notificationsEnabled,
        toggleNotifications,
        toastNotification,
        dismissToast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
