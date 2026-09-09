"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { MissionHome } from "../components/screens/MissionHome";
import { MissionView } from "../components/screens/MissionView";
import { InvestigationWorkspace } from "../components/screens/InvestigationWorkspace";
import { AgentDebateView } from "../components/screens/AgentDebateView";
import { EvaluationView } from "../components/screens/EvaluationView";
import { AnalysisResultsView } from "../components/analysis/AnalysisResultsView";
import { NewAnalysisView, NewAnalysisState } from "../components/analysis/NewAnalysisView";
import {
  MOCK_SINGLE_IMAGE,
  MOCK_BI_TEMPORAL,
  MOCK_OPTICAL_SAR,
} from "../lib/mock-results";
import { checkHealth } from "../lib/api";
import { AnalysisResult } from "../types/investigation";
import { AppTab } from "../components/layout/Header";

export default function Home() {
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [selectedScenario, setSelectedScenario] = useState<string | undefined>(undefined);
  const [initialQuery, setInitialQuery] = useState<string>("Where has construction increased between these two dates?");
  const [healthStatus, setHealthStatus] = useState<string>("online");
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    checkHealth().then((h) => {
      setHealthStatus(h.status || "online");
    });
  }, []);

  const handleStartInvestigation = (scenarioId?: string) => {
    if (scenarioId) {
      setSelectedScenario(scenarioId);
      if (scenarioId.includes("flood")) {
        setInitialQuery("Where did flooding expand?");
      } else if (scenarioId.includes("veg")) {
        setInitialQuery("Where has vegetation changed?");
      } else {
        setInitialQuery("Where has construction increased between these two dates?");
      }
    }
    setActiveTab("workspace");
  };

  const handleTriggerSpatialInvestigation = (areaName: string, query: string) => {
    setInitialQuery(query);
    setActiveTab("workspace");
  };

  const handleRunPipelineFromIntake = (state: NewAnalysisState) => {
    let base = MOCK_SINGLE_IMAGE;
    if (state.mode === "bi_temporal") {
      base = MOCK_BI_TEMPORAL;
    } else if (state.mode === "optical_sar") {
      base = MOCK_OPTICAL_SAR;
    }

    const compiledResult: AnalysisResult = {
      ...base,
      question: state.question || base.question,
      mission_context: state.disasterType
        ? `Disaster Assessment - ${state.disasterType.toUpperCase()}`
        : state.missionContext === "disaster_assessment"
        ? "Disaster Assessment"
        : "General Change Analysis",
      input_ids: [
        state.slot1?.name || base.input_ids[0],
        ...(state.slot2?.name ? [state.slot2.name] : base.input_ids.slice(1)),
      ],
    };

    setCurrentResult(compiledResult);
    setActiveTab("analysis_results");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0F1C] text-gray-100 font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemHealth={healthStatus}
      />

      <main className="flex-1 flex flex-col">
        {activeTab === "home" && (
          <MissionHome
            onStartInvestigation={handleStartInvestigation}
            onOpenMissionView={() => setActiveTab("mission_view")}
          />
        )}

        {activeTab === "new_analysis" && (
          <NewAnalysisView
            onRunPipeline={handleRunPipelineFromIntake}
            onNavigateHome={() => setActiveTab("home")}
          />
        )}

        {activeTab === "mission_view" && (
          <MissionView onTriggerInvestigation={handleTriggerSpatialInvestigation} />
        )}

        {activeTab === "workspace" && (
          <InvestigationWorkspace
            initialScenarioId={selectedScenario}
            initialQuery={initialQuery}
            onViewResults={(result) => {
              setCurrentResult(result);
              setActiveTab("analysis_results");
            }}
          />
        )}

        {activeTab === "analysis_results" && (
          <AnalysisResultsView
            result={currentResult}
            onBack={() => setActiveTab("new_analysis")}
          />
        )}

        {activeTab === "debate" && (
          <AgentDebateView
            onTriggerInvestigation={(scId, query) => {
              setSelectedScenario(scId);
              setInitialQuery(query);
              setActiveTab("workspace");
            }}
          />
        )}

        {activeTab === "evaluation" && <EvaluationView />}
      </main>

      {/* Global Mission-Critical Footer */}
      <footer className="w-full bg-[#070B14] border-t border-[#1F2937] px-6 py-4 text-xs text-gray-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>BHUVISION (SIH26167) // Team BANKAI // ISRO Theme: Space Technology</span>
          </div>
          <div className="flex items-center gap-4 text-gray-400">
            <span>FreeLLMAPI + OmniRoute AI Gateway</span>
            <span>|</span>
            <span>Sentinel-1 (SAR) &bull; Sentinel-2 (MSI)</span>
            <span>|</span>
            <span className="text-emerald-400">9 Agents Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
