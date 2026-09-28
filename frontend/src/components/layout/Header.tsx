"use client";

import React from "react";

import { AuthUser } from "../auth/AuthGatekeeper";

export type AppTab =
  | "home"
  | "mission_view"
  | "workspace"
  | "debate"
  | "evaluation"
  | "analysis_results"
  | "new_analysis"
  | "history"
  | "image_compare"
  | "defense_ops"
  | "sar_reader"
  | "disaster_routing";

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  systemHealth?: string;
  gateway?: string;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  systemHealth = "online",
  gateway = "FreeLLMAPI / OmniRoute",
  currentUser,
  onLogout,
}: HeaderProps) {
  return (
    <header className="w-full bg-[#0A0F1C] border-b border-[#1F2937] text-white px-4 py-2.5 select-none sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Identity */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab("home")}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight text-base text-white font-mono">BHUVISION</span>
              <span className="text-[9px] uppercase font-semibold tracking-wider bg-blue-900/60 text-blue-300 px-1 py-0.5 rounded border border-blue-500/30">
                SIH26167
              </span>
              <span className="text-[9px] uppercase font-semibold tracking-wider bg-amber-950/60 text-amber-300 px-1 py-0.5 rounded border border-amber-500/30">
                ISRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 -mt-0.5 hidden sm:block">Agentic Earth &amp; Defense Intelligence</p>
          </div>
        </div>

        {/* Center: Mode Navigation (horizontal scrolling if needed on compact screens) */}
        <nav className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-[#1F2937] font-mono text-xs overflow-x-auto max-w-[950px] scrollbar-none">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === "home"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("new_analysis")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "new_analysis"
                ? "bg-cyan-600 text-white shadow-sm shadow-cyan-500/20"
                : "text-cyan-300 hover:text-white hover:bg-cyan-950/40"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            New Analysis
          </button>
          <button
            onClick={() => setActiveTab("image_compare")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              activeTab === "image_compare"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                : "text-emerald-400 hover:text-white hover:bg-emerald-950/40"
            }`}
          >
            <span>Image Compare</span>
          </button>
          <button
            onClick={() => setActiveTab("defense_ops")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              activeTab === "defense_ops"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-500/20"
                : "text-amber-400 hover:text-white hover:bg-amber-950/40"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            Defense Ops
          </button>
          <button
            onClick={() => setActiveTab("sar_reader")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === "sar_reader"
                ? "bg-teal-600 text-white shadow-sm shadow-teal-500/20"
                : "text-teal-300 hover:text-white hover:bg-teal-950/40"
            }`}
          >
            SAR Radar
          </button>
          <button
            onClick={() => setActiveTab("disaster_routing")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
              activeTab === "disaster_routing"
                ? "bg-rose-600 text-white shadow-sm shadow-rose-500/20"
                : "text-rose-400 hover:text-white hover:bg-rose-950/40"
            }`}
          >
            Disaster Corridor
          </button>
          <button
            onClick={() => setActiveTab("new_analysis")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "new_analysis"
                ? "bg-cyan-600 text-white shadow-sm shadow-cyan-500/20"
                : "text-cyan-300 hover:text-white hover:bg-cyan-950/40"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            New Analysis
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === "history"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            Analysis History
          </button>
          <button
            onClick={() => setActiveTab("mission_view")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === "mission_view"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            3D HUD
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === "workspace"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            Cockpit
          </button>
          <button
            onClick={() => setActiveTab("debate")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === "debate"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-purple-300 hover:text-white hover:bg-purple-950/40"
            }`}
          >
            Debate Studio
          </button>
          <button
            onClick={() => setActiveTab("evaluation")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === "evaluation"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            Benchmark & Eval
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              activeTab === "history"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            History
          </button>
          {activeTab === "analysis_results" && (
            <span className="px-2.5 py-1 rounded-md bg-indigo-900/70 text-indigo-300 border border-indigo-500/40 text-xs font-mono uppercase tracking-wider shrink-0">
              ● Results
            </span>
          )}
        </nav>

        {/* Right: Operational Status Indicator & Officer Profile */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <div className="hidden md:flex items-center gap-2 bg-[#111827] px-2.5 py-1 rounded-lg border border-[#1F2937]">
            <span
              className={`w-2 h-2 rounded-full ${
                systemHealth === "online"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-gray-300 font-mono text-[10px]">{gateway}</span>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-2 bg-[#111827] px-2.5 py-1 rounded-lg border border-cyan-500/30">
              <div className="w-6 h-6 rounded-full bg-cyan-900/80 border border-cyan-400 flex items-center justify-center text-[10px] font-bold text-cyan-300">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "O"}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-[11px] font-mono font-bold text-white leading-tight truncate max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="text-[9px] font-mono text-cyan-400 -mt-0.5 truncate max-w-[110px]">
                  {currentUser.clearance_level.split(":")[0] || "Authorized"}
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Logout clearance"
                  className="ml-1 text-[10px] text-gray-400 hover:text-rose-400 font-mono p-1 rounded hover:bg-rose-950/40 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
