"use client";

import React from "react";
import { AnalysisResult, AnalysisMode, AnalysisStatus } from "../../types/investigation";

interface RunHeaderProps {
  result: AnalysisResult;
  onBack?: () => void;
}

const MODE_META: Record<
  AnalysisMode,
  { label: string; shortLabel: string; color: string; border: string; dotColor: string }
> = {
  single_image: {
    label: "Single Image — VQA / Grounding",
    shortLabel: "SINGLE IMAGE",
    color: "bg-cyan-950 text-cyan-300",
    border: "border-cyan-500/50",
    dotColor: "bg-cyan-400",
  },
  bi_temporal: {
    label: "Bi-Temporal — Change Detection",
    shortLabel: "BI-TEMPORAL",
    color: "bg-blue-950 text-blue-300",
    border: "border-blue-500/50",
    dotColor: "bg-blue-400",
  },
  optical_sar: {
    label: "Optical + SAR — Cross-Modal Fusion",
    shortLabel: "OPTICAL + SAR",
    color: "bg-purple-950 text-purple-300",
    border: "border-purple-500/50",
    dotColor: "bg-purple-400",
  },
};

const STATUS_META: Record<
  AnalysisStatus,
  { label: string; color: string; border: string; pulse: boolean }
> = {
  processing: {
    label: "PROCESSING",
    color: "bg-blue-950 text-blue-300",
    border: "border-blue-500/60",
    pulse: true,
  },
  complete: {
    label: "COMPLETE",
    color: "bg-emerald-950 text-emerald-300",
    border: "border-emerald-500/50",
    pulse: false,
  },
  inconclusive: {
    label: "INCONCLUSIVE",
    color: "bg-amber-950 text-amber-300",
    border: "border-amber-500/60",
    pulse: false,
  },
  error: {
    label: "ERROR",
    color: "bg-rose-950 text-rose-300",
    border: "border-rose-500/60",
    pulse: false,
  },
};

function formatRunId(id: string) {
  return id.startsWith("RUN-") ? id : `RUN-${id.slice(0, 5)}`;
}

function formatTimestamp(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

export function RunHeader({ result, onBack }: RunHeaderProps) {
  const mode = MODE_META[result.mode];
  const status = STATUS_META[result.status];

  return (
    <div className="bg-[#090E1A] border border-[#1F2937] rounded-xl p-5 shadow-2xl">
      {/* Top row: back button + status + run metadata */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-[#111827] border border-[#1F2937] hover:border-gray-600 transition-colors cursor-pointer mr-1"
            aria-label="Back to workspace"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            BACK
          </button>
        )}

        {/* Status pill */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${status.color} ${status.border}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              status.pulse ? "bg-blue-400 animate-pulse" : "bg-current"
            }`}
          />
          {status.label}
        </span>

        {/* Mode badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${mode.color} ${mode.border}`}
        >
          {mode.shortLabel}
        </span>

        {/* Mission context */}
        {result.mission_context && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-gray-900 text-gray-300 border border-gray-700">
            {result.mission_context}
          </span>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Run ID + timestamp */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400">
          <span className="text-gray-300 bg-[#111827] border border-[#1F2937] px-2 py-0.5 rounded">
            {formatRunId(result.run_id)}
          </span>
          <span>{formatTimestamp(result.created_at)}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#1F2937] to-transparent mb-4" />

      {/* Question recap */}
      <div className="flex items-start gap-3">
        {/* Mode color stripe */}
        <div
          className={`w-1 shrink-0 self-stretch rounded-full ${mode.dotColor} opacity-70`}
          style={{ minHeight: "2.5rem" }}
        />
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500 block mb-1.5">
            INVESTIGATION QUERY
          </span>
          <p className="text-lg sm:text-xl font-semibold text-white leading-snug font-sans">
            &ldquo;{result.question}&rdquo;
          </p>
        </div>
      </div>

      {/* Input scene IDs */}
      <div className="mt-3 flex flex-wrap gap-2">
        {result.input_ids.map((id) => (
          <span
            key={id}
            className="px-2 py-0.5 rounded bg-[#111827] border border-[#1F2937] text-[10px] font-mono text-gray-400"
          >
            {id}
          </span>
        ))}
      </div>
    </div>
  );
}
