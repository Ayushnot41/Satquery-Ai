"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AnalysisHistoryView } from "../../../components/screens/AnalysisHistoryView";
import { AnalysisResult } from "../../../types/investigation";

export default function AnalysisHistoryPage() {
  const router = useRouter();

  const handleSelectResult = (result: AnalysisResult) => {
    try {
      sessionStorage.setItem("satquery_last_run", JSON.stringify(result));
    } catch (e) {
      console.warn("Storage failed:", e);
    }
    router.push(`/analysis/results?id=${result.id}&mode=${result.mode}`);
  };

  const handleNewAnalysis = () => {
    router.push("/analysis/new");
  };

  return (
    <div className="min-h-screen bg-[#070B16] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AnalysisHistoryView
          onSelectResult={handleSelectResult}
          onNewAnalysis={handleNewAnalysis}
        />
      </div>
    </div>
  );
}
