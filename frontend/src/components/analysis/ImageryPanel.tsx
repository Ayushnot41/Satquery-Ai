"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { AnalysisMode } from "../../types/investigation";

interface ImageryPanelProps {
  mode: AnalysisMode;
  /** For bi_temporal: [beforeUrl, afterUrl]; single_image / optical_sar: [mainUrl] or [opticalUrl, sarUrl] */
  imageUrls?: string[];
  isLoading?: boolean;
}

// Satellite imagery placeholders using ESRI tile colors styled as real imagery
// We use data-URIs / CSS gradients as plausible imagery mocks — no external fetch
const PLACEHOLDER_COLORS = {
  optical_pre: "from-emerald-900 via-green-800 to-teal-900",
  optical_post: "from-slate-700 via-blue-900 to-indigo-900",
  sar: "from-gray-900 via-zinc-800 to-neutral-900",
  single: "from-amber-900 via-orange-800 to-rose-900",
};

function ImagePlaceholder({
  gradient,
  label,
  microLabel,
}: {
  gradient: string;
  label: string;
  microLabel?: string;
}) {
  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center select-none pointer-events-none`}
    >
      {/* Simulated satellite raster texture */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px), repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)",
        }}
      />
      <div className="text-center z-10">
        <p className="text-xs font-mono text-white/60 uppercase tracking-widest">{label}</p>
        {microLabel && (
          <p className="text-[10px] font-mono text-white/40 mt-1">{microLabel}</p>
        )}
      </div>
    </div>
  );
}

function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1">
      <button
        onClick={onZoomIn}
        className="w-7 h-7 bg-[#111827]/90 border border-[#1F2937] hover:bg-gray-700 text-white rounded-md flex items-center justify-center transition-colors cursor-pointer text-sm font-mono"
        aria-label="Zoom in"
      >
        +
      </button>
      <div className="w-7 h-5 bg-[#0A0F1C]/80 border border-[#1F2937] text-gray-400 rounded-md flex items-center justify-center text-[9px] font-mono">
        {zoom}x
      </div>
      <button
        onClick={onZoomOut}
        className="w-7 h-7 bg-[#111827]/90 border border-[#1F2937] hover:bg-gray-700 text-white rounded-md flex items-center justify-center transition-colors cursor-pointer text-sm font-mono"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  );
}

// ─── Wipe Slider for Bi-Temporal ───────────────────────────────────────────
function BiTemporalWipe({
  preGradient,
  postGradient,
  preUrl,
  postUrl,
}: {
  preGradient: string;
  postGradient: string;
  preUrl?: string;
  postUrl?: string;
}) {
  const [wipePos, setWipePos] = useState(50); // 0-100%
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateWipe = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setWipePos(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updateWipe(e.clientX);
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => { if (dragging.current) updateWipe(e.clientX); },
    [updateWipe]
  );
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    dragging.current = true;
    updateWipe(e.touches[0].clientX);
  };
  const onTouchMove = useCallback(
    (e: TouchEvent) => { if (dragging.current) updateWipe(e.touches[0].clientX); },
    [updateWipe]
  );

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [onMouseMove, onMouseUp, onTouchMove]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden cursor-ew-resize select-none"
      onMouseDown={onMouseDown} onTouchStart={onTouchStart}>
      {/* POST image (full width, below) */}
      {postUrl ? (
        <img src={postUrl} alt="Post Event" className="w-full h-full object-cover" />
      ) : (
        <ImagePlaceholder gradient={postGradient} label="T2 — POST-EVENT" microLabel="Sentinel-2 2026-07-19" />
      )}

      {/* PRE image clipped to left of wipe line */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${wipePos}%` }}
      >
        <div className="absolute inset-0" style={{ width: `${100 / (wipePos / 100)}%` }}>
          {preUrl ? (
            <img src={preUrl} alt="Pre Event" className="w-full h-full object-cover" />
          ) : (
            <ImagePlaceholder gradient={preGradient} label="T1 – PRE-EVENT" microLabel="Sentinel-2 2026-07-12" />
          )}
        </div>
      </div>

      {/* Wipe handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 pointer-events-none"
        style={{ left: `${wipePos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white/90 border-2 border-gray-300 shadow-lg flex items-center justify-center">
          <svg className="w-3 h-3 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 3 12 9 6" />
            <polyline points="15 18 21 12 15 6" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-2 left-2 z-10 pointer-events-none">
        <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white/80 uppercase tracking-wider border border-white/10">
          PRE-CHANGE BASELINE
        </span>
      </div>
      <div className="absolute top-2 right-2 z-10 pointer-events-none">
        <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-white/80 uppercase tracking-wider border border-white/10">
          POST-EVENT OBSERVATION
        </span>
      </div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-gray-300">
          ← drag to wipe →
        </span>
      </div>
    </div>
  );
}

// ─── SAR + Optical stacked panels ──────────────────────────────────────────
function OpticalSarPanels({
  showFusion,
  opticalUrl,
  sarUrl,
}: {
  showFusion: boolean;
  opticalUrl?: string;
  sarUrl?: string;
}) {
  return (
    <div className="flex flex-col h-full gap-px">
      {/* Optical top half */}
      <div className="relative flex-1 overflow-hidden rounded-t-lg">
        {opticalUrl ? (
          <img src={opticalUrl} alt="Optical Sensor" className="w-full h-full object-cover" />
        ) : (
          <ImagePlaceholder gradient="from-amber-900 via-orange-900 to-yellow-900" label="OPTICAL – CLOUD OBSCURED" microLabel="Sentinel-2 MSI – 100% cloud cover" />
        )}
        {showFusion && (
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
        )}
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-0.5 rounded bg-gray-800/90 text-[10px] font-mono text-cyan-300 uppercase border border-cyan-500/30">
            OPTICAL SENSOR
          </span>
        </div>
      </div>

      {/* SAR bottom half */}
      <div className="relative flex-1 overflow-hidden rounded-b-lg">
        {sarUrl ? (
          <img src={sarUrl} alt="SAR Radar" className="w-full h-full object-cover" />
        ) : (
          <ImagePlaceholder gradient="from-gray-900 via-zinc-800 to-stone-900" label="MICROWAVE BACKSCATTER" microLabel="Sentinel-1 C-Band IW-GRD VV+VH" />
        )}
        {showFusion && (
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
        )}
        <div className="absolute top-2 left-2 z-10">
          <span className="px-2 py-0.5 rounded bg-gray-800/90 text-[10px] font-mono text-purple-300 uppercase border border-purple-500/30">
            SAR RADAR
          </span>
        </div>
        <div className="absolute bottom-2 right-2 z-10">
          <span className="px-2 py-0.5 rounded bg-black/70 text-[10px] font-mono text-gray-300 border border-gray-700">
            σ⁰(VV) = −22.4 dB
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton shimmer ──────────────────────────────────────────────────────
function ShimmerPanel() {
  return (
    <div className="absolute inset-0 bg-[#111827] animate-pulse rounded-lg">
      <div className="absolute inset-0 opacity-30"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.4s infinite",
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function ImageryPanel({ mode, imageUrls, isLoading = false }: ImageryPanelProps) {
  const [zoom, setZoom] = useState(1);
  const [showFusion, setShowFusion] = useState(false);

  const zoomIn = () => setZoom((z) => Math.min(4, parseFloat((z + 0.5).toFixed(1))));
  const zoomOut = () => setZoom((z) => Math.max(1, parseFloat((z - 0.5).toFixed(1))));

  const headerLabel =
    mode === "single_image"
      ? "Scene Imagery"
      : mode === "bi_temporal"
      ? "Bi-Temporal Wipe Viewer"
      : "Optical + SAR Dual Sensor";

  const modeAccent =
    mode === "single_image"
      ? "text-cyan-400"
      : mode === "bi_temporal"
      ? "text-blue-400"
      : "text-purple-400";

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl flex flex-col shadow-xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1F2937] bg-[#0A0F1C]">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${modeAccent.replace("text", "bg")} animate-pulse`} />
          <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${modeAccent}`}>
            {headerLabel}
          </span>
        </div>
        {mode === "optical_sar" && (
          <button
            onClick={() => setShowFusion((f) => !f)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold border transition-all cursor-pointer ${
              showFusion
                ? "bg-purple-950 text-purple-300 border-purple-500/60"
                : "bg-[#111827] text-gray-400 border-[#1F2937] hover:border-gray-600"
            }`}
          >
            {showFusion ? "FUSION ON" : "FUSION OFF"}
          </button>
        )}
      </div>

      {/* Imagery area */}
      <div
        className="relative overflow-hidden"
        style={{ height: mode === "optical_sar" ? "420px" : "360px" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        >
          {isLoading ? (
            <ShimmerPanel />
          ) : mode === "single_image" ? (
            imageUrls && imageUrls.length > 0 && imageUrls[0] ? (
              <img
                src={imageUrls[0]}
                alt="Optical Scene"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlaceholder
                gradient="from-amber-900 via-orange-800 to-rose-900"
                label="OPTICAL SCENE – NADIR VIEW"
                microLabel="Cartosat-3 PAN · 0.28 m/px · EPSG:4326"
              />
            )
          ) : mode === "bi_temporal" ? (
            <BiTemporalWipe
              preGradient={PLACEHOLDER_COLORS.optical_pre}
              postGradient={PLACEHOLDER_COLORS.optical_post}
              preUrl={imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined}
              postUrl={imageUrls && imageUrls.length > 1 ? imageUrls[1] : undefined}
            />
          ) : (
            <OpticalSarPanels
              showFusion={showFusion}
              opticalUrl={imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined}
              sarUrl={imageUrls && imageUrls.length > 1 ? imageUrls[1] : undefined}
            />
          )}
        </div>

        {/* Zoom overlay — hidden when bi-temporal wipe is shown (it handles its own cursor) */}
        {mode !== "bi_temporal" && !isLoading && (
          <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} />
        )}

        {/* HUD coordinate label */}
        {!isLoading && (
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">
            <span className="px-2 py-0.5 rounded bg-black/60 text-[9px] font-mono text-gray-400 border border-gray-800">
              MGRS · 44RKQ 6139 7209
            </span>
          </div>
        )}
      </div>

      {/* Bottom metadata strip */}
      {!isLoading && (
        <div className="px-4 py-2 border-t border-[#1F2937] bg-[#0A0F1C] flex gap-4 flex-wrap text-[10px] font-mono text-gray-500">
          {mode === "single_image" && (
            <>
              <span className="text-gray-400">Sensor: <span className="text-cyan-400">CARTOSAT-3</span></span>
              <span>GSD: <span className="text-white">0.28 m/px</span></span>
              <span>Band: <span className="text-white">PAN+4xVNIR</span></span>
            </>
          )}
          {mode === "bi_temporal" && (
            <>
              <span className="text-gray-400">T1: <span className="text-white">2026-07-12</span></span>
              <span>T2: <span className="text-white">2026-07-19</span></span>
              <span>Sensor: <span className="text-blue-400">SENTINEL-2</span></span>
              <span>Interval: <span className="text-white">7 days</span></span>
            </>
          )}
          {mode === "optical_sar" && (
            <>
              <span className="text-gray-400">Optical: <span className="text-cyan-400">SENTINEL-2 MSI</span></span>
              <span>Radar: <span className="text-purple-400">SENTINEL-1 C-BAND</span></span>
              <span>Pol: <span className="text-white">VV+VH</span></span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
