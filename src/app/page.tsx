"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/common/Header";
import { BottomNav } from "@/components/common/BottomNav";
import { DemoSwitcherModal } from "@/components/common/DemoSwitcherModal";
import { AuthModal } from "@/components/common/AuthModal";
import { ToastNotificationBar } from "@/components/common/ToastNotificationBar";
import { ChatListView } from "@/components/chat/ChatListView";
import { ChatRoomView } from "@/components/chat/ChatRoomView";
import { CommunityView } from "@/components/community/CommunityView";
import { ComplaintView } from "@/components/complaint/ComplaintView";
import { VoteView } from "@/components/vote/VoteView";
import { ProfileView } from "@/components/profile/ProfileView";

export default function Home() {
  const { activeTab, activeRoomId } = useApp();

  return (
    <main className="min-h-screen bg-slate-900 flex justify-center items-center sm:p-4">
      {/* Mobile-sized Container on Desktop / Full Screen on Mobile */}
      <div className="w-full sm:max-w-md h-[100dvh] sm:h-[92vh] sm:max-h-[900px] bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden sm:border sm:border-slate-800 relative">
        {/* Real-time In-App Toast Notification */}
        <ToastNotificationBar />

        {/* Top App Header (Always present except when inside full-screen chat) */}
        {!activeRoomId && <Header />}

        {/* Dynamic Screen View */}
        <div className="flex-1 overflow-hidden relative">
          {activeRoomId ? (
            <ChatRoomView />
          ) : (
            <>
              {activeTab === "chat" && <ChatListView />}
              {activeTab === "community" && <CommunityView />}
              {activeTab === "complaint" && <ComplaintView />}
              {activeTab === "vote" && <VoteView />}
              {activeTab === "profile" && <ProfileView />}
            </>
          )}
        </div>

        {/* Bottom Navigation (Only visible when not in active chat room) */}
        {!activeRoomId && (
          <div className="h-16 flex-shrink-0">
            <BottomNav />
          </div>
        )}

        {/* Global Modals */}
        <DemoSwitcherModal />
        <AuthModal />
      </div>
    </main>
  );
}
