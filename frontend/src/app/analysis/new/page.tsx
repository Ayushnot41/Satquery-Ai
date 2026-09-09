"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { NewAnalysisView, NewAnalysisState } from "../../../components/analysis/NewAnalysisView";

export default function NewAnalysisPage() {
  const router = useRouter();

  const handleRunPipeline = (state: NewAnalysisState) => {
    // Store in session storage so results page can hydrate it
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("satquery_last_run", JSON.stringify({
          mode: state.mode,
          missionContext: state.missionContext,
          disasterType: state.disasterType,
          question: state.question,
          slot1Name: state.slot1?.name,
          slot2Name: state.slot2?.name,
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn("Could not save run state:", e);
    }

    // Navigate to results page
    router.push(`/analysis/results?mode=${state.mode}`);
  };

  const handleNavigateHome = () => {
    router.push("/");
  };

  return (
    <NewAnalysisView
      onRunPipeline={handleRunPipeline}
      onNavigateHome={handleNavigateHome}
    />
  );
}
