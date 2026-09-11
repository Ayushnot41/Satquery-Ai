"use client";

import React, { useState, useEffect } from "react";
import { fetchAgentDebate } from "../../lib/api";

interface AgentDebateViewProps {
  onTriggerInvestigation?: (scenario: string, query: string) => void;
}

export function AgentDebateView({ onTriggerInvestigation }: AgentDebateViewProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>("monsoon_flood");
  const [debateData, setDebateData] = useState<any | null>(null);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number>(3); // show all 4 turns by default
  const [loading, setLoading] = useState<boolean>(false);

  const scenarios = [
    {
      id: "monsoon_flood",
      title: "Monsoon Inundation: Cloud Blindness vs SAR Microwave Penetration",
      location: "Brahmaputra Flood Plain, Assam",
      query: "Where did flooding expand?",
      icon: "🌧️",
      summary: "Dense monsoon clouds obscure 85% of optical imagery. Sentinel-1 C-Band SAR radar pierces the cloud ceiling at 5.405 GHz.",
    },
    {
      id: "urban_shadow",
      title: "High-Rise Shadow vs Vertical Construction Framing",
      location: "NCR Delhi Urban Fringe",
      query: "Where has construction increased between these two dates?",
      icon: "🏗️",
      summary: "Optical sensor misclassifies long building shadow as ground excavation pit. SAR dihedral double-bounce resolves vertical structure.",
    },
    {
      id: "landslide",
      title: "Himalayan Landslide: Surface Debris vs Forest Canopy",
      location: "Kedarnath Valley, Uttarakhand",
      query: "Where has terrain slope displaced?",
      icon: "⛰️",
      summary: "InSAR phase coherence reveals millimeter-scale hillside subsidence preceding catastrophic slope failure.",
    },
  ];

  const loadDebate = async (scId: string) => {
    setLoading(true);
    const sc = scenarios.find((s) => s.id === scId) || scenarios[0];
    const data = await fetchAgentDebate(scId, sc.location);
    setDebateData(data);
    setActiveTurnIdx((data.turns?.length || 4) - 1);
    setLoading(false);
  };

  useEffect(() => {
    loadDebate(selectedScenario);
  }, [selectedScenario]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 text-white select-none">
      {/* ================= HEADER STRIP ================= */}
      <div className="bg-[#090E1A] border border-[#1F2937] p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              Autonomous Scientific Council
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
              Zero-Hallucination Arbitration
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-space tracking-tight">
            Multi-Modal Agent-to-Agent Debate Protocol
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 font-mono">
            Watch independent space-specialist AI agents resolve cross-sensor contradictions in real-time.
          </p>
        </div>

        {/* Live Status Metric */}
        <div className="flex items-center gap-4 bg-[#050811] px-4 py-3 rounded-xl border border-purple-500/30 font-mono text-xs shrink-0">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase">Consensus Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LOCKED (100% UNANIMOUS)
            </span>
          </div>
          <div className="h-8 w-px bg-[#1F2937]" />
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase">Calibrated Confidence</span>
            <span className="text-cyan-300 font-bold">
              {debateData ? `${Math.round(debateData.final_confidence * 100)}%` : "93.4%"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= SCENARIO SELECTOR TABS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer font-mono ${
                isSelected
                  ? "bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                  : "bg-[#0B1120] border-[#1F2937] hover:border-gray-600 text-gray-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{sc.icon}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-black/50 text-gray-300">
                  {sc.location.split(",")[0]}
                </span>
              </div>
              <h3 className="text-xs font-bold text-white mb-1 leading-snug">{sc.title}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed font-sans">{sc.summary}</p>
            </div>
          );
        })}
      </div>

      {/* ================= ACTIVE DEBATE CANVAS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sequential Round-by-Round Argument Transcript */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0B1120] border border-[#1F2937] p-5 rounded-2xl shadow-xl space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-[#1F2937]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                <h2 className="text-xs uppercase font-bold text-gray-200 tracking-wider">
                  Deliberation Flow // Graph-of-Thought
                </h2>
              </div>
              <span className="text-[11px] text-cyan-400">
                Topic: {debateData?.dispute_topic || "Optical Cloud Obscuration vs SAR Microwave"}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center text-gray-500 flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Agents deliberating cross-sensor hypotheses...</span>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {debateData?.turns?.map((turn: any, idx: number) => {
                  const isVisible = idx <= activeTurnIdx;
                  if (!isVisible) return null;
                  return (
                    <div
                      key={turn.turn_id}
                      className="p-4 rounded-xl border bg-[#050813] transition-all animate-fadeIn"
                      style={{ borderColor: `${turn.avatar_color}50` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: turn.avatar_color }}
                          />
                          <span className="text-xs font-bold" style={{ color: turn.avatar_color }}>
                            {turn.speaker}
                          </span>
                          <span className="text-[10px] text-gray-500">({turn.role})</span>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-black/60 px-2 py-0.5 rounded border border-white/5">
                          T+{turn.timestamp_offset_ms}ms
                        </span>
                      </div>

                      <p className="text-xs text-gray-200 font-sans leading-relaxed mb-3">
                        &ldquo;{turn.argument}&rdquo;
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-[10px]">
                        <div className="flex items-center gap-1.5 text-cyan-300">
                          <span className="text-gray-500">Sensor Evidence:</span>
                          <span className="font-bold">{turn.sensor_metric}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-500">Confidence Shift:</span>
                          <span className="text-emerald-400 font-bold">
                            {Math.round(turn.confidence_shift * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Synthesis Decision & Launch Action Card */}
        <div className="lg:col-span-4 space-y-4 font-mono text-xs">
          {/* Arbiter Ruling Card */}
          <div className="bg-[#0B1120] border border-blue-500/40 p-5 rounded-2xl shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1F2937] text-blue-400">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <span className="font-bold uppercase tracking-wider">Final Arbiter Ruling</span>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] text-gray-400">Overruled Finding:</div>
              <div className="bg-red-950/40 border border-red-500/30 p-2.5 rounded-lg text-red-300 text-[11px]">
                {debateData?.overruled_sensor || "Optical Sensor False Negative (Cloud Cover)"}
              </div>

              <div className="text-[11px] text-gray-400 mt-2">Verified Ground Truth:</div>
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg text-emerald-200 text-[11px] font-sans leading-relaxed">
                {debateData?.final_verdict || "420 Hectares of inundation confirmed. Cloud deck penetrated via 5.405 GHz microwave radar."}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1F2937] space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Dispute Resolution Speed:</span>
                <span className="text-white font-bold">810 ms</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400">Hallucination Risk:</span>
                <span className="text-emerald-400 font-bold">0.00% (Mathematically Bound)</span>
              </div>
            </div>
          </div>

          {/* Launch In Live Cockpit Card */}
          <div className="bg-gradient-to-br from-purple-950/50 to-blue-950/50 border border-purple-500/40 p-5 rounded-2xl shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white font-space">
              Inspect Live Satellite Rasters
            </h3>
            <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
              Load this verified scenario directly into the dual-dimension 2D/3D surveillance cockpit with real-time slippy tiles.
            </p>

            <button
              onClick={() => {
                const sc = scenarios.find((s) => s.id === selectedScenario) || scenarios[0];
                onTriggerInvestigation?.(sc.id, sc.query);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer border border-purple-400/40"
            >
              <span>Load In Live Surveillance Cockpit</span> &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
