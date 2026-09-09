"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnalysisResultsView } from "../../../components/analysis/AnalysisResultsView";
import {
  MOCK_SINGLE_IMAGE,
  MOCK_BI_TEMPORAL,
  MOCK_OPTICAL_SAR,
} from "../../../lib/mock-results";
import { AnalysisResult } from "../../../types/investigation";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<AnalysisResult>(MOCK_SINGLE_IMAGE);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    let chosen = MOCK_SINGLE_IMAGE;

    if (modeParam === "bi_temporal") {
      chosen = MOCK_BI_TEMPORAL;
    } else if (modeParam === "optical_sar") {
      chosen = MOCK_OPTICAL_SAR;
    } else {
      chosen = MOCK_SINGLE_IMAGE;
    }

    // Check if session storage has a custom question
    try {
      const stored = sessionStorage.getItem("satquery_last_run");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.question) {
          chosen = {
            ...chosen,
            question: parsed.question,
            mission_context: parsed.disasterType
              ? `Disaster Assessment - ${parsed.disasterType.toUpperCase()}`
              : parsed.missionContext || chosen.mission_context,
          };
        }
      }
    } catch (e) {
      console.warn("Could not read stored run:", e);
    }

    setResult(chosen);
  }, [searchParams]);

  return (
    <AnalysisResultsView
      result={result}
      onBack={() => router.push("/analysis/new")}
    />
  );
}

export default function AnalysisResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-cyan-400 font-mono">Loading Results...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
