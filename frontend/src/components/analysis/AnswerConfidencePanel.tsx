"use client";

import React from "react";
import { AnalysisResult, AnalysisMode } from "../../types/investigation";

interface AnswerConfidencePanelProps {
  result: AnalysisResult;
  isLoading?: boolean;
}

// ─── Circular confidence gauge (SVG arc) ──────────────────────────────────
function ConfidenceGauge({ value }: { value: number | null }) {
  if (value === null) {
    return (
      <div className="flex flex-col items-center justify-center w-28 h-28 rounded-full border-2 border-dashed border-gray-700">
        <span className="text-gray-500 text-[10px] font-mono uppercase text-center leading-tight">
          Pending
        </span>
      </div>
    );
  }

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const clampedVal = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clampedVal / 100);

  // Color thresholds
  const color =
    clampedVal >= 80
      ? { stroke: "#34D399", text: "text-emerald-400", label: "HIGH", bg: "text-emerald-300" }
      : clampedVal >= 50
      ? { stroke: "#FBBF24", text: "text-amber-400", label: "MODERATE", bg: "text-amber-300" }
      : { stroke: "#F87171", text: "text-rose-400", label: "LOW", bg: "text-rose-300" };

  return (
    <div className="relative flex items-center justify-center w-28 h-28">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
        {/* Background track */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="8"
        />
        {/* Progress arc */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)",
            filter: `drop-shadow(0 0 6px ${color.stroke}88)`,
          }}
        />
      </svg>
      {/* Center text */}
      <div className="flex flex-col items-center z-10">
        <span className={`text-2xl font-bold font-mono ${color.text}`}>{clampedVal}%</span>
        <span className={`text-[9px] font-mono uppercase font-bold ${color.bg} mt-0.5`}>
          {color.label}
        </span>
      </div>
    </div>
  );
}

// ─── Inconclusive State Card ───────────────────────────────────────────────
function InconclusiveCard({ answer }: { answer: string }) {
  return (
    <div className="rounded-xl border-2 border-amber-500/50 bg-amber-950/30 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-amber-900/60 border border-amber-500/50 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            Inconclusive — Insufficient Evidence
          </p>
          <p className="text-[11px] text-amber-200/70 mt-0.5">
            The 9-agent council cannot form a verified consensus at this confidence threshold.
          </p>
        </div>
      </div>
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-3">
        <p className="text-xs text-amber-100/80 leading-relaxed italic">{answer}</p>
      </div>
      <p className="text-[11px] text-amber-300/60 font-mono">
        Recommended action: Acquire additional sensor coverage or increase image resolution before acting on this result.
      </p>
    </div>
  );
}

// ─── Mode-specific metric colors ──────────────────────────────────────────
const MODE_METRIC_COLOR: Record<AnalysisMode, string> = {
  single_image: "text-cyan-400",
  bi_temporal: "text-blue-400",
  optical_sar: "text-purple-400",
};

// ─── Main Component ────────────────────────────────────────────────────────
export function AnswerConfidencePanel({ result, isLoading = false }: AnswerConfidencePanelProps) {
  const { status, confidence, answer, metrics, limitations, mode } = result;

  const isInconclusive = status === "inconclusive" || (confidence !== null && confidence < 40);
  const metricColor = MODE_METRIC_COLOR[mode];
  const showLimitations =
    limitations.length > 0 && (confidence === null || confidence < 80 || status === "inconclusive");

  if (isLoading) {
    return (
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5 flex flex-col gap-4 shadow-xl">
        <div className="h-5 bg-[#1F2937] rounded animate-pulse w-1/2" />
        <div className="h-20 bg-[#1F2937] rounded animate-pulse" />
        <div className="h-5 bg-[#1F2937] rounded animate-pulse w-2/3" />
        <div className="h-16 bg-[#1F2937] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl flex flex-col shadow-xl overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-3 border-b border-[#1F2937] bg-[#0A0F1C] flex items-center justify-between">
        <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${metricColor}`}>
          STEP 05 — Answer &amp; Evidence Synthesis
        </span>
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            confidence !== null && confidence >= 80
              ? "bg-emerald-950 text-emerald-300 border-emerald-500/40"
              : confidence !== null && confidence >= 50
              ? "bg-amber-950 text-amber-300 border-amber-500/40"
              : "bg-rose-950 text-rose-300 border-rose-500/40"
          }`}
        >
          {confidence !== null
            ? confidence >= 80
              ? "HIGH CONFIDENCE"
              : confidence >= 50
              ? "MODERATE CONFIDENCE"
              : "LOW CONFIDENCE"
            : "PENDING"}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* ── Answer card ──────────────────────────────────────── */}
        {isInconclusive ? (
          <InconclusiveCard answer={answer} />
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">
                SYNTHESIS FINDING
              </span>
            </div>
            <div className="bg-[#0A0F1C] border border-[#1F2937] rounded-xl p-4">
              <p className="text-sm text-gray-100 leading-relaxed font-sans">{answer}</p>
            </div>
          </div>
        )}

        {/* ── Confidence gauge ─────────────────────────────────── */}
        {!isInconclusive && (
          <div className="flex items-center gap-5">
            <ConfidenceGauge value={confidence} />
            <div className="flex-1">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">
                Empirical Calibration
              </p>
              <div className="space-y-1.5">
                {confidence !== null && confidence >= 80 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span>✓</span>
                    <span>All agent consensus thresholds met</span>
                  </div>
                )}
                {confidence !== null && confidence < 80 && confidence >= 50 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400">
                    <span>!</span>
                    <span>Partial evidence — review limitations</span>
                  </div>
                )}
                {confidence !== null && confidence < 50 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-400">
                    <span>✕</span>
                    <span>Low-confidence result — do not act without verification</span>
                  </div>
                )}
                <p className="text-[10px] text-gray-500 font-mono">
                  Score wired to Agent 8 empirical calibration. Never fabricated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Metrics block ─────────────────────────────────────── */}
        {Object.keys(metrics).length > 0 && (
          <div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block mb-2">
              Task Metrics
            </span>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(metrics).map(([key, val]) => (
                <div
                  key={key}
                  className="bg-[#0A0F1C] border border-[#1F2937] rounded-lg px-3 py-2"
                >
                  <span className="text-[9px] font-mono text-gray-500 uppercase block mb-0.5 leading-none">
                    {key}
                  </span>
                  <span className={`text-sm font-bold font-mono ${metricColor}`}>
                    {typeof val === "number" ? val.toLocaleString() : val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Limitations panel ─────────────────────────────────── */}
        {showLimitations && (
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2.5">
              <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                Known Limitations &amp; Caveats
              </span>
            </div>
            <ul className="space-y-2">
              {limitations.map((lim, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-200/80 leading-snug">
                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">!</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
