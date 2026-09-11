"use client";

import React, { useState } from "react";
import { InvestigationResponse, DemoScenario } from "../../types/investigation";
import { runInvestigation } from "../../lib/api";
import { AgentPipelineTracker } from "../workspace/AgentPipelineTracker";
import { SatelliteViewer } from "../workspace/SatelliteViewer";
import { EvidencePanel } from "../workspace/EvidencePanel";
import { ConfidenceCard } from "../workspace/ConfidenceCard";
import { AuditTraceModal } from "../workspace/AuditTraceModal";
import { LocationSearchBar, LocationItem } from "../shared/LocationSearchBar";

interface InvestigationWorkspaceProps {
  initialScenarioId?: string;
  initialQuery?: string;
}

export function InvestigationWorkspace({
  initialScenarioId,
  initialQuery = "Where has construction increased between these two dates?",
}: InvestigationWorkspaceProps) {
  const [query, setQuery] = useState<string>(initialQuery);
  const [loading, setLoading] = useState<boolean>(false);
  const [investigation, setInvestigation] = useState<InvestigationResponse | null>(null);
  const [showTraceModal, setShowTraceModal] = useState<boolean>(false);

  // Selected geographic location state for live satellite viewport
  const [currentLocation, setCurrentLocation] = useState<{
    name: string;
    lat: number;
    lon: number;
    zoom: number;
  }>({
    name: "NCR Delhi Urban Fringe",
    lat: 28.6139,
    lon: 77.209,
    zoom: 13,
  });

  const scenarios: DemoScenario[] = [
    {
      id: "scenario-construction-01",
      name: "Urban Construction",
      description: "Bi-temporal analysis of new commercial and residential developments.",
      question: "Where has construction increased between these two dates?",
      imagery_ids: ["demo-construction-before", "demo-construction-after"],
      expected_task_type: "change_detection",
      category: "construction",
    },
    {
      id: "scenario-flood-01",
      name: "Flood Expansion (SAR)",
      description: "Sentinel-1 radar backscatter water delineation.",
      question: "Where did flooding expand?",
      imagery_ids: ["demo-flood-pre-optical", "demo-flood-post-sar"],
      expected_task_type: "change_detection",
      category: "flood",
    },
    {
      id: "scenario-vegetation-01",
      name: "Forest Canopy Loss",
      description: "Assessment of seasonal vegetation loss and canopy depletion.",
      question: "Where has vegetation changed?",
      imagery_ids: ["demo-veg-t1", "demo-veg-t2"],
      expected_task_type: "change_detection",
      category: "vegetation",
    },
  ];

  const handleExecute = async (overrideQuery?: string, imageryIds?: string[]) => {
    const q = overrideQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const imgs = imageryIds || ["demo-construction-before", "demo-construction-after"];
      const res = await runInvestigation(q, imgs, "auto");
      setInvestigation(res);
    } catch (err) {
      console.error("Investigation error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (loc: LocationItem) => {
    setCurrentLocation({
      name: loc.name,
      lat: loc.lat,
      lon: loc.lon,
      zoom: 13,
    });
    // Dynamically adjust query if generic
    if (query.includes("between these two dates")) {
      setQuery(`Where has construction increased in ${loc.name}?`);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 text-white select-none">
      {/* ================= LOCATION SEARCH & TARGET ACQUISITION ================= */}
      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#1F2937]/70 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider">GLOBAL SATELLITE TARGET SEARCH</span>
          </div>
          <span className="text-gray-400">Search any city, district, or landmark worldwide</span>
        </div>

        <LocationSearchBar
          onSelectLocation={handleLocationSelect}
          selectedLocationName={currentLocation.name}
        />
      </div>

      {/* ================= INVESTIGATION QUERY BAR ================= */}
      <div className="bg-[#111827] border border-[#1F2937] p-4 rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleExecute()}
              placeholder="Ask the Earth a question... (e.g., Where did flooding expand? Where has construction increased?)"
              className="w-full bg-[#0A0F1C] border border-[#1F2937] focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors font-mono"
            />
          </div>

          <button
            onClick={() => handleExecute()}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:from-blue-900 disabled:to-cyan-900 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Investigating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Investigate Target</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Scenario Chips */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1F2937]/60 overflow-x-auto text-xs">
          <span className="text-[10px] font-mono uppercase text-gray-400 shrink-0">Demo Scenarios:</span>
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setQuery(sc.question);
                handleExecute(sc.question, sc.imagery_ids);
              }}
              className="px-3 py-1 rounded-lg bg-[#0A0F1C] hover:bg-gray-800 text-gray-300 hover:text-white border border-[#1F2937] text-xs font-mono transition-colors shrink-0 cursor-pointer"
            >
              {sc.name}
            </button>
          ))}
        </div>
      </div>

      {/* 9-Agent Pipeline Status Tracker */}
      <AgentPipelineTracker
        status={investigation ? investigation.status : loading ? "analyzing" : "pending"}
        trace={investigation?.trace}
      />

      {/* Main Analysis Grid: Satellite Viewport on Left, Evidence & Findings on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Satellite Viewport with Live Satellite Streaming */}
        <div className="lg:col-span-7">
          <SatelliteViewer
            lat={currentLocation.lat}
            lon={currentLocation.lon}
            zoom={currentLocation.zoom}
            locationName={currentLocation.name}
            overlays={investigation?.visual_overlays || []}
            isTemporal={true}
            investigationId={investigation?.investigation_id || "inv-live-01"}
            onCoordinatesChange={(nLat, nLon, nZoom) => {
              setCurrentLocation((prev) => ({
                ...prev,
                lat: nLat,
                lon: nLon,
                zoom: nZoom,
              }));
            }}
          />
        </div>

        {/* Right Column: Evidence Synthesis & Confidence */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <EvidencePanel
            answer={investigation?.answer}
            fusedEvidence={investigation?.fused_evidence}
            sensorDecision={investigation?.sensor_decision}
          />

          <ConfidenceCard
            confidence={investigation?.confidence}
            onOpenTrace={() => setShowTraceModal(true)}
          />
        </div>
      </div>

      {/* Observable Execution Trace Modal */}
      <AuditTraceModal
        trace={investigation?.trace}
        isOpen={showTraceModal}
        onClose={() => setShowTraceModal(false)}
      />
    </div>
  );
}
