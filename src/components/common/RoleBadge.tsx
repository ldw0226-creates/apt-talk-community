import React from "react";
import { UserRole } from "@/types";

interface RoleBadgeProps {
  role: UserRole;
  roleTitle?: string;
  building?: string;
  unit?: string;
  size?: "sm" | "md" | "lg";
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  roleTitle,
  building,
  unit,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 rounded",
    md: "text-xs px-2 py-0.5 rounded-md",
    lg: "text-sm px-2.5 py-1 rounded-lg font-medium",
  }[size];

  if (role === "representative") {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold bg-amber-100 text-amber-900 border border-amber-300 shadow-xs ${sizeClasses}`}>
        <span>👑</span>
        <span>{roleTitle || `${building || ''} 동대표`}</span>
      </span>
    );
  }

  if (role === "manager" || role === "admin") {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold bg-blue-100 text-blue-900 border border-blue-300 shadow-xs ${sizeClasses}`}>
        <span>🏢</span>
        <span>{roleTitle || "관리사무소"}</span>
      </span>
    );
  }

  // Resident
  return (
    <span className={`inline-flex items-center gap-1 bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
      <span className="text-slate-500 font-medium">
        {building && unit ? `${building} ${unit}` : "입주민"}
      </span>
    </span>
  );
};
