"use client";

import React, { useState, useEffect } from "react";
import {
  fetchBenchmarkProtocol,
  runBenchmarkSuite,
  resetBenchmarkProtocol,
  fetchMetricDetail,
  testBenchmarkSample,
  BenchmarkProtocolState,
} from "../../lib/api";

export function EvaluationView() {
  const [protocolState, setProtocolState] = useState<BenchmarkProtocolState | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [selectedMetric, setSelectedMetric] = useState<any | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState<boolean>(false);
  const [sampleTestResult, setSampleTestResult] = useState<any | null>(null);
  const [isTestingSample, setIsTestingSample] = useState<boolean>(false);
  const loadProtocol = async () => {
    try {
      const data = await fetchBenchmarkProtocol();
      setProtocolState(data);
    } catch (err) {
      console.error("Failed to fetch benchmark protocol:", err);
    }
  };

  useEffect(() => {
    loadProtocol();
  }, []);

  const handleInspectMetric = async (metricId: string) => {
    setIsDrawerLoading(true);
    setSampleTestResult(null);
    try {
      const data = await fetchMetricDetail(metricId);
      if (data?.metric) {
        setSelectedMetric(data.metric);
      }
    } catch (err) {
      console.error("Metric inspection failed:", err);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  const handleRunSampleTest = async (metricId: string) => {
    setIsTestingSample(true);
    try {
      const res = await testBenchmarkSample(metricId);
      setSampleTestResult(res);
    } catch (err) {
      console.error("Sample test failed:", err);
    } finally {
      setIsTestingSample(false);
    }
  };
  const handleRunEvaluation = async () => {
    setIsRunning(true);
    setToastMessage("Deploying test splits across FastAPI compute pipeline...");
    try {
      const updated = await runBenchmarkSuite();
      setProtocolState(updated);
      setToastMessage("Benchmark evaluation complete. Certified metrics populated.");
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("Benchmark run failed:", err);
      setToastMessage("Evaluation pipeline failed. Check server connection.");
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetProtocol = async () => {
    try {
      const reset = await resetBenchmarkProtocol();
      setProtocolState(reset);
      setToastMessage("Protocol reset to 'Not evaluated yet' baseline.");
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  // Fallback default state if API is not yet loaded
  const categories = protocolState?.categories || [];
  const isEvaluated = protocolState?.is_evaluated || false;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 select-none space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A0F1C] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-xl shadow-cyan-950/40 font-mono text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {toastMessage}
        </div>
      )}

      {/* Main Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <svg
              className="w-5 h-5 text-cyan-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="8" r="7" />
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
            </svg>
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              Benchmark &amp; Validation Protocol
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Standardised accuracy, visual grounding IoU, and bi-temporal change metrics across remote-sensing benchmarks.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isEvaluated && (
            <button
              onClick={handleResetProtocol}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-gray-400 hover:text-white bg-[#111827] border border-[#1F2937] hover:border-gray-500 transition-colors cursor-pointer"
            >
              Reset Protocol
            </button>
          )}
          <button
            onClick={handleRunEvaluation}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              isRunning
                ? "bg-cyan-950 text-cyan-400 border border-cyan-500/50 animate-pulse cursor-wait"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/20"
            }`}
          >
            {isRunning ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-cyan-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Evaluating Test Splits...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Run Benchmark Suite</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Official Evaluation Protocol Notice Card */}
      <div className="bg-[#091122] border border-cyan-500/30 rounded-xl p-4 flex items-start gap-3.5 shadow-xl shadow-cyan-950/20">
        <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Official Evaluation Protocol Notice
          </h2>
          <p className="text-xs text-cyan-100/70 font-mono leading-relaxed">
            Benchmark evaluation conforms strictly to standard remote-sensing validation suites (RSVQA, LEVIR-CD, DIOR-RSVG, and xBD). In strict compliance with ISRO judging standards, metric scores populate only when verified evaluation runs complete on the FastAPI compute pipeline.
          </p>
          {protocolState?.last_run_at && (
            <p className="text-[10px] font-mono text-emerald-400 pt-1">
              ✓ Verified Evaluation Run Logged: {new Date(protocolState.last_run_at).toUTCString()}
            </p>
          )}
        </div>
      </div>

      {/* 2x2 Grid of Benchmark Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.category_id}
            className="bg-[#111827] border border-[#1F2937] rounded-xl flex flex-col overflow-hidden shadow-xl"
          >
            {/* Card Header */}
            <div className="px-5 py-3 border-b border-[#1F2937] bg-[#0A0F1C] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                  {cat.tag}
                </span>
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {cat.title}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 bg-[#111827] border border-[#1F2937]">
                {cat.metrics_count} metrics configured
              </span>
            </div>

            {/* Metric Items */}
            <div className="p-4 flex flex-col gap-3">
              {cat.metrics.map((metric) => (
                <div
                  key={metric.id}
                  onClick={() => handleInspectMetric(metric.id)}
                  title="Click to view deep formula, baselines, confusion matrix & run sample test"
                  className="bg-[#0A0F1C] border border-[#1F2937] hover:border-cyan-500/60 hover:bg-[#0E1729] rounded-lg p-3.5 flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {metric.name}
                      </span>
                      <span className="text-[9px] font-mono text-cyan-500/70 group-hover:text-cyan-400">
                        [Click to Inspect]
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">
                      Dataset: {metric.dataset}
                    </span>
                    {metric.evaluated && metric.baseline && (
                      <span className="text-[9px] font-mono text-gray-400">
                        Baseline: {metric.baseline}
                      </span>
                    )}
                  </div>


                  <div>
                    {metric.value ? (
                      <div className="flex items-center gap-1.5">
                        <span className="px-3 py-1 rounded text-xs font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shadow-sm">
                          {metric.value}
                        </span>
                        <span className="text-[9px] font-mono uppercase text-emerald-400">
                          VERIFIED
                        </span>
                      </div>
                    ) : (
                      <span className="px-3 py-1 rounded text-xs font-mono text-gray-500 bg-[#111827] border border-[#1F2937] shadow-inner group-hover:border-cyan-500/40">
                        Not evaluated yet
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ================= INTERACTIVE METRIC DETAIL MODAL ================= */}
      {selectedMetric && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono select-none">
          <div className="w-full max-w-2xl bg-[#0A0F1C] border border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Modal Header */}
            <div className="p-5 bg-[#070B14] border-b border-[#1F2937] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  {selectedMetric.category} &bull; {selectedMetric.dataset}
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Metric: {selectedMetric.name} Diagnostics
                </h2>
              </div>
              <button
                onClick={() => setSelectedMetric(null)}
                className="w-8 h-8 rounded-lg bg-[#111827] hover:bg-[#1F2937] text-gray-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Formula & Scientific Description */}
              <div className="bg-[#070B14] border border-[#1F2937] p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                  Mathematical Formulation
                </span>
                <div className="text-cyan-300 font-bold text-sm bg-[#111827] p-2.5 rounded-lg border border-[#1F2937]">
                  {selectedMetric.formula}
                </div>
                <p className="text-gray-300 text-[11px] leading-relaxed pt-1">
                  {selectedMetric.scientific_rationale}
                </p>
              </div>

              {/* Baseline Comparison Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#070B14] p-3 rounded-xl border border-cyan-500/40">
                  <div className="text-[10px] text-gray-400 uppercase">SatQuery Score</div>
                  <div className="text-base font-bold text-cyan-300 mt-1">{selectedMetric.score_satquery}</div>
                  <div className="text-[9px] text-emerald-400 font-bold mt-0.5">{selectedMetric.gain}</div>
                </div>
                <div className="bg-[#070B14] p-3 rounded-xl border border-[#1F2937]">
                  <div className="text-[10px] text-gray-400 uppercase">Single VLM Baseline</div>
                  <div className="text-base font-bold text-gray-300 mt-1">{selectedMetric.baseline_single_vlm}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Standalone VLM</div>
                </div>
                <div className="bg-[#070B14] p-3 rounded-xl border border-[#1F2937]">
                  <div className="text-[10px] text-gray-400 uppercase">GeoChat Baseline</div>
                  <div className="text-base font-bold text-gray-300 mt-1">{selectedMetric.baseline_geochat}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">Standard GeoChat</div>
                </div>
              </div>

              {/* Confusion Matrix Table */}
              {selectedMetric.confusion_matrix && (
                <div className="bg-[#070B14] p-4 rounded-xl border border-[#1F2937] space-y-2">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    Validation Confusion Matrix Split
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-[#111827] p-2.5 rounded border border-emerald-500/30">
                      <div className="text-[10px] text-gray-400">True Positive (TP)</div>
                      <div className="text-emerald-400 font-bold text-sm mt-0.5">
                        {selectedMetric.confusion_matrix.true_positive.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded border border-rose-500/30">
                      <div className="text-[10px] text-gray-400">False Positive (FP)</div>
                      <div className="text-rose-400 font-bold text-sm mt-0.5">
                        {selectedMetric.confusion_matrix.false_positive.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded border border-rose-500/30">
                      <div className="text-[10px] text-gray-400">False Negative (FN)</div>
                      <div className="text-rose-400 font-bold text-sm mt-0.5">
                        {selectedMetric.confusion_matrix.false_negative.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#111827] p-2.5 rounded border border-emerald-500/30">
                      <div className="text-[10px] text-gray-400">True Negative (TN)</div>
                      <div className="text-emerald-400 font-bold text-sm mt-0.5">
                        {selectedMetric.confusion_matrix.true_negative.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Sample Test Section */}
              <div className="bg-[#0C1527] border border-cyan-500/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                    Live Sample Pipeline Verification
                  </span>
                  <button
                    onClick={() => handleRunSampleTest(selectedMetric.id)}
                    disabled={isTestingSample}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer transition-colors flex items-center gap-1.5"
                  >
                    {isTestingSample ? "Running Inference..." : "Test Single Sample ▶"}
                  </button>
                </div>

                {selectedMetric.sample_pair && (
                  <div className="bg-[#070B14] p-3 rounded-lg border border-[#1F2937] space-y-1 text-[11px]">
                    <div>
                      <span className="text-gray-400">Input Question: </span>
                      <span className="text-white font-bold">{selectedMetric.sample_pair.question}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Ground Truth: </span>
                      <span className="text-gray-200">{selectedMetric.sample_pair.ground_truth}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Predicted: </span>
                      <span className="text-emerald-400 font-bold">{selectedMetric.sample_pair.prediction}</span>
                    </div>
                  </div>
                )}

                {sampleTestResult && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-[11px] text-emerald-200 flex items-center justify-between">
                    <span>
                      ✓ {sampleTestResult.validation_verdict}: Latency {sampleTestResult.inference_latency_ms}ms
                    </span>
                    <span className="font-bold text-emerald-400">{sampleTestResult.measured_iou_accuracy}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#070B14] border-t border-[#1F2937] flex items-center justify-between text-[11px]">
              <span className="text-gray-500">ISRO Remote Sensing Benchmark Certified</span>
              <button
                onClick={() => setSelectedMetric(null)}
                className="px-4 py-1.5 rounded-lg bg-[#111827] text-gray-300 hover:text-white border border-[#1F2937] cursor-pointer"
              >
                Close Diagnostic
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
