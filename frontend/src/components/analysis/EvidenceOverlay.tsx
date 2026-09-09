"use client";

import React, { useState, useRef } from "react";
import { EvidencePayload, EvidenceRegion, AnalysisMode } from "../../types/investigation";

interface EvidenceOverlayProps {
  evidence: EvidencePayload;
  mode: AnalysisMode;
  confidence: number | null;
  isLoading?: boolean;
  sarMetrics?: Record<string, string | number>;
  imageUrls?: string[];
}

// Mode accent config
const MODE_ACCENT: Record<
  AnalysisMode,
  { boxColor: string; maskColor: string; label: string }
> = {
  single_image: {
    boxColor: "rgba(6,182,212,1)",
    maskColor: "rgba(6,182,212,0.28)",
    label: "cyan",
  },
  bi_temporal: {
    boxColor: "rgba(239,68,68,1)",
    maskColor: "rgba(239,68,68,0.30)",
    label: "red",
  },
  optical_sar: {
    boxColor: "rgba(139,92,246,1)",
    maskColor: "rgba(139,92,246,0.28)",
    label: "purple",
  },
};

function scoreColor(score?: number | null) {
  if (!score) return "text-gray-400";
  if (score >= 0.85) return "text-emerald-400";
  if (score >= 0.65) return "text-amber-400";
  return "text-rose-400";
}

function RegionBox({
  region,
  accent,
  isActive,
  isHighlighted,
  onClick,
}: {
  region: EvidenceRegion;
  accent: { boxColor: string; maskColor: string };
  isActive: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  if (!region.bbox) return null;
  const { x, y, width, height } = region.bbox;

  const boxColor = accent.boxColor;
  const glowOpacity = isHighlighted ? "0.8" : isActive ? "0.6" : "0.35";
  const borderOpacity = isHighlighted ? "1" : isActive ? "0.9" : "0.55";

  const isMask = region.type === "mask";
  const fillColor = isMask ? accent.maskColor : "transparent";

  return (
    <div
      className="absolute cursor-pointer transition-all duration-200 group"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${width * 100}%`,
        height: `${height * 100}%`,
        border: `${isHighlighted ? 2 : 1.5}px ${isMask ? "dashed" : "solid"} ${boxColor}`,
        opacity: borderOpacity,
        background: isHighlighted ? fillColor : isMask ? fillColor : "transparent",
        boxShadow: isActive || isHighlighted ? `0 0 12px ${boxColor.replace("1)", `${glowOpacity})`)}` : "none",
        borderRadius: "2px",
      }}
      onClick={onClick}
    >
      {/* Label chip */}
      <div
        className="absolute -top-5 left-0 whitespace-nowrap z-10"
        style={{ pointerEvents: "none" }}
      >
        <span
          className="px-1.5 py-0.5 text-[9px] font-mono font-bold text-black rounded"
          style={{ background: boxColor }}
        >
          {region.label}
          {region.score != null && ` · ${region.score.toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}

function SarPhysicsChip({ metrics }: { metrics: Record<string, string | number> }) {
  return (
    <div className="absolute top-3 left-3 z-20 bg-[#0A0F1C]/90 border border-purple-500/50 rounded-lg p-2.5 text-[10px] font-mono shadow-lg shadow-purple-900/30">
      <div className="text-purple-400 font-bold uppercase tracking-wider text-[9px] mb-1.5">
        SAR Physics Readout
      </div>
      {Object.entries(metrics).slice(0, 4).map(([k, v]) => (
        <div key={k} className="flex items-center justify-between gap-4">
          <span className="text-gray-400">{k}:</span>
          <span className="text-purple-300 font-bold">{v}</span>
        </div>
      ))}
    </div>
  );
}

function EmptyEvidence() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center p-6">
      <div className="w-12 h-12 rounded-xl bg-[#1F2937] border border-[#2D3748] flex items-center justify-center">
        <svg className="w-6 h-6 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-400">No Distinct Regions Identified</p>
        <p className="text-xs text-gray-600 mt-1 font-mono">
          The agent council found no distinct spatial evidence regions above the confidence threshold.
        </p>
      </div>
    </div>
  );
}

export function EvidenceOverlay({
  evidence,
  mode,
  confidence,
  isLoading = false,
  sarMetrics,
  imageUrls,
}: EvidenceOverlayProps) {
  const [showOverlay, setShowOverlay] = useState(true);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const accent = MODE_ACCENT[mode];
  const hasRegions = evidence.regions.length > 0;

  const modeAccentClass =
    mode === "single_image"
      ? "text-cyan-400"
      : mode === "bi_temporal"
      ? "text-rose-400"
      : "text-purple-400";

  const handleRegionClick = (id: string) => {
    setActiveRegionId((prev) => (prev === id ? null : id));
  };

  const regionTypeLabel = {
    bounding_box: "Bounding Box",
    mask: "Segmentation Mask",
    region: "Spatial Region",
  }[evidence.type] ?? "Evidence Region";

  if (isLoading) {
    return (
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl flex flex-col shadow-xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[#1F2937] bg-[#0A0F1C] flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">Evidence Overlay</span>
        </div>
        <div className="h-64 animate-pulse bg-[#111827]" />
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl flex flex-col shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1F2937] bg-[#0A0F1C]">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${modeAccentClass.replace("text", "bg")}`} />
          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${modeAccentClass}`}>
            Evidence Overlay
          </span>
          <span className="text-[10px] font-mono text-gray-500 ml-1">
            — {regionTypeLabel}
          </span>
        </div>
        <button
          onClick={() => setShowOverlay((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer bg-[#0A0F1C] text-gray-400 border-[#1F2937] hover:border-gray-600"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {showOverlay ? (
              <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </>
            ) : (
              <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </>
            )}
          </svg>
          {showOverlay ? "HIDE OVERLAY" : "SHOW OVERLAY"}
        </button>
      </div>

      {/* Overlay canvas area */}
      <div
        ref={containerRef}
        className="relative overflow-hidden bg-[#0A0F1C]"
        style={{ height: "300px" }}
      >
        {/* Background imagery: Real uploaded raster or representative gradient */}
        {imageUrls && imageUrls.length > 0 && imageUrls[0] ? (
          <img
            src={imageUrls[0]}
            alt="Evidence Base Scene"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              mode === "optical_sar"
                ? "from-gray-900 via-zinc-800 to-stone-900"
                : mode === "bi_temporal"
                ? "from-slate-700 via-blue-900 to-indigo-900"
                : "from-amber-900 via-orange-800 to-rose-900"
            } opacity-80`}
          />
        )}
        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Evidence regions */}
        {showOverlay && hasRegions && (
          <div className="absolute inset-0">
            {evidence.regions.map((region) => (
              <RegionBox
                key={region.id}
                region={region}
                accent={accent}
                isActive={false}
                isHighlighted={activeRegionId === region.id}
                onClick={() => handleRegionClick(region.id)}
              />
            ))}
          </div>
        )}

        {/* SAR physics chip */}
        {mode === "optical_sar" && sarMetrics && showOverlay && (
          <SarPhysicsChip metrics={sarMetrics} />
        )}

        {/* Empty state */}
        {!hasRegions && <EmptyEvidence />}

        {/* Region count badge */}
        {hasRegions && showOverlay && (
          <div className="absolute top-2 right-2 z-20">
            <span className="px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-gray-300 border border-gray-700">
              {evidence.regions.length} region{evidence.regions.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Numbered region list */}
      {hasRegions && (
        <div className="border-t border-[#1F2937] p-3 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">
            Detected Regions — click to highlight
          </span>
          {evidence.regions.map((region, idx) => (
            <button
              key={region.id}
              onClick={() => handleRegionClick(region.id)}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg border text-left transition-all cursor-pointer w-full ${
                activeRegionId === region.id
                  ? mode === "single_image"
                    ? "bg-cyan-950/60 border-cyan-500/60 text-cyan-200"
                    : mode === "bi_temporal"
                    ? "bg-rose-950/60 border-rose-500/60 text-rose-200"
                    : "bg-purple-950/60 border-purple-500/60 text-purple-200"
                  : "bg-[#0A0F1C] border-[#1F2937] text-gray-300 hover:border-gray-600"
              }`}
            >
              {/* Index badge */}
              <span className="w-5 h-5 shrink-0 rounded bg-black/50 flex items-center justify-center text-[10px] font-mono font-bold text-gray-400">
                {idx + 1}
              </span>
              {/* Label */}
              <span className="flex-1 text-xs font-medium truncate">{region.label}</span>
              {/* Type chip */}
              <span className="text-[9px] font-mono uppercase text-gray-500 shrink-0">
                {region.type.replace("_", " ")}
              </span>
              {/* Score */}
              {region.score != null && (
                <span className={`text-[10px] font-mono font-bold shrink-0 ${scoreColor(region.score)}`}>
                  {(region.score * 100).toFixed(0)}%
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
