"use client";

import React, { useState } from "react";
import { TraceStep } from "../../types/investigation";

interface ExecutionTraceProps {
  steps: TraceStep[];
  totalDurationMs?: number | null;
  isLoading?: boolean;
  defaultExpanded?: boolean;
}

const STATUS_ICON = {
  success: {
    icon: "✓",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-950/20",
  },
  warning: {
    icon: "!",
    color: "text-amber-400",
    dot: "bg-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-950/20",
  },
  failed: {
    icon: "✕",
    color: "text-rose-400",
    dot: "bg-rose-400",
    border: "border-rose-500/30",
    bg: "bg-rose-950/20",
  },
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatOffset(ms: number | null | undefined): string {
  if (ms == null) return "+0ms";
  if (ms < 1000) return `+${ms}ms`;
  return `+${(ms / 1000).toFixed(2)}s`;
}

function TraceStepCard({
  step,
  index,
  isLast,
}: {
  step: TraceStep;
  index: number;
  isLast: boolean;
}) {
  const s = STATUS_ICON[step.status];

  return (
    <div className="flex gap-3 group">
      {/* Timeline spine */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold z-10 ${s.bg} ${s.border} ${s.color}`}
        >
          {s.icon}
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-1 bg-gradient-to-b from-[#1F2937] to-transparent min-h-[1.5rem]" />
        )}
      </div>

      {/* Step content */}
      <div className="flex-1 pb-4">
        <div
          className={`rounded-xl border p-3.5 ${s.bg} ${s.border} group-hover:border-gray-600 transition-all`}
        >
          {/* Step header row */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {/* Step number badge */}
              <span className="w-5 h-5 rounded bg-black/40 flex items-center justify-center text-[9px] font-mono text-gray-400 font-bold shrink-0">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span className="text-sm font-semibold text-white">{step.step}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {step.timestamp_offset_ms != null && (
                <span className="text-[10px] font-mono text-gray-500">
                  {formatOffset(step.timestamp_offset_ms)}
                </span>
              )}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${s.bg} border ${s.border} ${s.color}`}
              >
                {formatDuration(step.duration_ms)}
              </span>
            </div>
          </div>

          {/* Tool row */}
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-3 h-3 text-gray-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <span className="text-[11px] font-mono text-gray-400">{step.tool}</span>
          </div>

          {/* Detail */}
          {step.detail && (
            <p className="text-[11px] text-gray-300 font-mono leading-relaxed pl-5 border-l border-gray-800">
              {step.detail}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-[#1F2937] animate-pulse shrink-0" />
          <div className="flex-1">
            <div className="h-14 bg-[#1F2937] rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExecutionTrace({
  steps,
  totalDurationMs,
  isLoading = false,
  defaultExpanded = true,
}: ExecutionTraceProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const successCount = steps.filter((s) => s.status === "success").length;
  const warningCount = steps.filter((s) => s.status === "warning").length;
  const failedCount = steps.filter((s) => s.status === "failed").length;

  return (
    <div className="bg-[#090E1A] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden">
      {/* ─── Collapsed / header bar ─────────────────────────────── */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-[#0A0F1C] border-b border-[#1F2937] hover:bg-[#111827] transition-colors cursor-pointer"
        aria-expanded={isExpanded}
      >
        {/* Left: label */}
        <div className="flex items-center gap-3">
          {/* Flight recorder icon */}
          <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-500/40 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className="text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400">
              STEP 09 — Observable Execution Trace
            </span>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
              Flight recorder · Millisecond audit log · {steps.length} events
            </p>
          </div>
        </div>

        {/* Right: summary badges + chevron */}
        <div className="flex items-center gap-2">
          {successCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
              {successCount}✓
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 text-[10px] font-mono border border-amber-500/30">
              {warningCount}!
            </span>
          )}
          {failedCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 text-[10px] font-mono border border-rose-500/30">
              {failedCount}✕
            </span>
          )}
          {totalDurationMs != null && (
            <span className="px-2 py-0.5 rounded bg-[#111827] text-gray-400 text-[10px] font-mono border border-[#1F2937]">
              {formatDuration(totalDurationMs)} total
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ml-1 ${isExpanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* ─── Expanded trace content ──────────────────────────────── */}
      {isExpanded && (
        <div>
          {isLoading ? (
            <LoadingSkeleton />
          ) : steps.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 font-mono">No trace events recorded.</p>
            </div>
          ) : (
            <>
              {/* Metadata strip */}
              <div className="px-5 py-3 bg-[#050810] border-b border-[#1F2937] flex flex-wrap gap-4 text-[10px] font-mono text-gray-500">
                <span>
                  AGENTS: <span className="text-blue-400 font-bold">9</span>
                </span>
                <span>
                  STEPS: <span className="text-white font-bold">{steps.length}</span>
                </span>
                {successCount > 0 && (
                  <span>
                    VERIFIED: <span className="text-emerald-400 font-bold">{successCount}</span>
                  </span>
                )}
                {warningCount > 0 && (
                  <span>
                    WARNINGS: <span className="text-amber-400 font-bold">{warningCount}</span>
                  </span>
                )}
                {totalDurationMs != null && (
                  <span>
                    WALL TIME: <span className="text-white font-bold">{formatDuration(totalDurationMs)}</span>
                  </span>
                )}
                <span className="ml-auto text-gray-600 italic">
                  SIH26167 Auditable Compliance Record
                </span>
              </div>

              {/* Steps */}
              <div className="p-5 pt-4">
                {steps.map((step, i) => (
                  <TraceStepCard
                    key={i}
                    step={step}
                    index={i}
                    isLast={i === steps.length - 1}
                  />
                ))}
              </div>

              {/* Completion footer */}
              <div className="px-5 py-3 bg-[#050810] border-t border-[#1F2937] flex items-center gap-2 text-[10px] font-mono text-gray-500">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>
                  Pipeline complete · Total {formatDuration(
                    steps.reduce((acc, s) => acc + s.duration_ms, 0)
                  )} agent wall-clock time
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
