"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Bell, MessageSquare, Wrench, Vote, Megaphone, X } from "lucide-react";

export const ToastNotificationBar: React.FC = () => {
  const { toastNotification, dismissToast, setActiveRoomId, setActiveTab } = useApp();

  if (!toastNotification) return null;

  const handleClick = () => {
    if (toastNotification.linkRoomId) {
      setActiveRoomId(toastNotification.linkRoomId);
      setActiveTab("chat");
    } else if (toastNotification.type === "complaint") {
      setActiveTab("complaint");
      setActiveRoomId(null);
    } else if (toastNotification.type === "vote") {
      setActiveTab("vote");
      setActiveRoomId(null);
    } else if (toastNotification.type === "notice") {
      setActiveTab("community");
      setActiveRoomId(null);
    }
    dismissToast();
  };

  const getIcon = () => {
    switch (toastNotification.type) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "complaint":
        return <Wrench className="w-4 h-4 text-amber-600" />;
      case "vote":
        return <Vote className="w-4 h-4 text-indigo-600" />;
      case "notice":
      default:
        return <Megaphone className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="absolute top-2 left-3 right-3 z-50 animate-bounce-in shadow-2xl">
      <div
        onClick={handleClick}
        className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl border border-slate-700/80 flex items-start gap-3 cursor-pointer hover:bg-slate-800 transition-all"
      >
        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h5 className="font-bold text-xs text-white truncate">
              {toastNotification.title}
            </h5>
            <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
              {toastNotification.timestamp}
            </span>
          </div>
          <p className="text-xs text-slate-300 truncate mt-0.5">
            {toastNotification.message}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            dismissToast();
          }}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
