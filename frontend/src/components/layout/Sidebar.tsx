"use client";

import React, { useState } from "react";
import { AppTab } from "./Header";

interface SidebarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenProfile?: () => void;
  onOpenSpecialists?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  onOpenProfile,
  onOpenSpecialists,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      id: "home" as AppTab,
      label: "Dashboard",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      action: () => setActiveTab("home"),
    },
    {
      id: "new_analysis" as AppTab,
      label: "New Analysis",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      action: () => setActiveTab("new_analysis"),
    },
    {
      id: "history" as AppTab,
      label: "Analysis History",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      ),
      action: () => setActiveTab("history"),
    },
    {
      id: "profile",
      label: "Operator Profile",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      action: () => {
        if (onOpenProfile) onOpenProfile();
      },
    },
    {
      id: "evaluation" as AppTab,
      label: "Benchmark & Eval",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="6" />
          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
      ),
      action: () => setActiveTab("evaluation"),
    },
    {
      id: "specialists",
      label: "Specialist Registry",
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      ),
      action: () => {
        if (onOpenSpecialists) onOpenSpecialists();
        else setActiveTab("debate");
      },
    },
  ];

  return (
    <aside
      className={`bg-[#070B13] border-r border-[#162032] flex flex-col justify-between transition-all duration-300 select-none shrink-0 z-40 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div>
        <div className="p-4 border-b border-[#162032] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="font-bold text-sm tracking-tight text-white font-sans flex items-center gap-1.5">
                <span>SatQuery</span>
                <span className="text-cyan-400">-AI</span>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-cyan-400/80 -mt-0.5">
                ISRO MISSION CTRL
              </div>
            </div>
          )}
        </div>
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.label}
                onClick={item.action}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0c2238] text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950/50 font-bold"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#0f172a]/60 border border-transparent"
                }`}
              >
                <div className={`shrink-0 ${isActive ? "text-cyan-400" : "text-gray-400"}`}>
                  {item.icon}
                </div>
                {!collapsed && (
                  <span className="truncate tracking-wide">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="p-3 border-t border-[#162032] space-y-2">
        {!collapsed && (
          <div className="bg-[#0b1322] border border-[#1e2f4a] rounded-lg p-2.5 font-mono text-[11px] space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] tracking-wide">Telemetry Stream</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                SYNCED
              </span>
            </div>
            <div className="text-[10px] text-gray-500 truncate">
              Node: ISRO-GEO-VQA-01
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full py-1.5 rounded text-gray-500 hover:text-gray-300 hover:bg-[#0f172a] text-xs font-mono flex items-center justify-center cursor-pointer transition-colors"
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? "->" : "<"}
        </button>
      </div>
    </aside>
  );
}
