export type UserRole = 'resident' | 'representative' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  apartmentName: string;
  building: string; // e.g. "101동"
  unit: string;     // e.g. "1203호"
  roleTitle?: string; // e.g. "101동 동대표", "관리소장", "시설팀장"
  avatarUrl?: string;
  phone?: string;
  isVerified: boolean;
  joinedAt: string;
}

export type ChatRoomType = 'complex' | 'building' | 'rep_council' | 'manager_1on1' | 'direct';

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatRoomType;
  description: string;
  targetBuilding?: string; // For 'building' rooms (e.g. "101동")
  unreadCount?: number;
  lastMessage?: string;
  lastMessageTime?: string;
  pinnedNotice?: string;
  icon?: string;
  memberCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderBuilding: string;
  senderUnit: string;
  senderRoleTitle?: string;
  senderAvatar?: string;
  avatarUrl?: string;
  content: string;
  imageUrl?: string;
  timestamp: string;
  unreadMembersCount?: number;
  isNotice?: boolean;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'urgent' | 'maintenance' | 'general' | 'event';
  author: string;
  authorRole: string;
  createdAt: string;
  views: number;
  isPinned: boolean;
  images?: string[];
}

export type ComplaintStatus = 'pending' | 'in_progress' | 'resolved';

export interface Complaint {
  id: string;
  title: string;
  content: string;
  category: 'parking' | 'noise' | 'facility' | 'elevator' | 'landscape' | 'other';
  authorId: string;
  authorName: string;
  authorBuilding: string;
  authorUnit: string;
  isPrivate: boolean;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  managerReply?: {
    repliedBy: string;
    roleTitle: string;
    content: string;
    repliedAt: string;
  };
}

export interface VoteOption {
  id: string;
  text: string;
  votesCount: number;
}

export interface Vote {
  id: string;
  title: string;
  description: string;
  targetBuilding?: string; // 'all' or specific building
  author: string;
  authorRole: string;
  deadline: string;
  options: VoteOption[];
  totalVotes: number;
  votedUserIds: string[]; // List of users who have cast their vote
  status: 'ongoing' | 'closed';
  createdAt: string;
}

export interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number; // 0 for free sharing (나눔)
  isFree: boolean;
  status: 'selling' | 'reserved' | 'completed';
  authorId: string;
  authorName: string;
  authorBuilding: string;
  authorUnit: string;
  locationTip: string;
  createdAt: string;
  imageUrl?: string;
  likesCount: number;
  chatsCount: number;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'message' | 'complaint' | 'vote' | 'notice';
  timestamp: string;
  linkRoomId?: string;
}


