"use client";

import React from "react";
import { EvaluationView } from "../../components/screens/EvaluationView";

export default function BenchmarkPage() {
  return (
    <div className="min-h-screen bg-[#070B16] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <EvaluationView />
      </div>
    </div>
  );
}
