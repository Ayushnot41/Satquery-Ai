"use client";

import React from "react";

interface HeaderProps {
  activeTab: "home" | "mission_view" | "workspace" | "debate" | "evaluation";
  setActiveTab: (tab: "home" | "mission_view" | "workspace" | "debate" | "evaluation") => void;
  systemHealth?: string;
  gateway?: string;
}

export function Header({
  activeTab,
  setActiveTab,
  systemHealth = "online",
  gateway = "FreeLLMAPI / OmniRoute",
}: HeaderProps) {
  return (
    <header className="w-full bg-[#0A0F1C] border-b border-[#1F2937] text-white px-6 py-3 select-none sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand & Identity */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab("home")}>
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
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-white font-mono">BHUVISION</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/30">
                SIH26167
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                ISRO / BANKAI
              </span>
            </div>
            <p className="text-xs text-gray-400 -mt-0.5">Agentic Earth Intelligence for Government</p>
          </div>
        </div>

        {/* Center: Mode Navigation */}
        <nav className="flex items-center gap-1 bg-[#111827] p-1 rounded-lg border border-[#1F2937] font-mono text-xs">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === "home"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            Mission Home
          </button>
          <button
            onClick={() => setActiveTab("mission_view")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === "mission_view"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            God&apos;s Eye (3D HUD)
          </button>
          <button
            onClick={() => setActiveTab("workspace")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === "workspace"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            Surveillance Cockpit
          </button>
          <button
            onClick={() => setActiveTab("debate")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === "debate"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-purple-300 hover:text-white hover:bg-purple-950/40"
            }`}
          >
            Agent Debate Studio
          </button>
          <button
            onClick={() => setActiveTab("evaluation")}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === "evaluation"
                ? "bg-[#3B82F6] text-white shadow-sm"
                : "text-gray-300 hover:text-white hover:bg-gray-800/60"
            }`}
          >
            Scientific Evaluation
          </button>
        </nav>

        {/* Right: Operational Status Indicator */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1F2937]">
            <span
              className={`w-2 h-2 rounded-full ${
                systemHealth === "online"
                  ? "bg-emerald-400 animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span className="text-gray-300 font-mono text-[11px]">{gateway}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
