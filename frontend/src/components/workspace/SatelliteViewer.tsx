"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { VisualOverlay } from "../../types/investigation";
import { analyzeSpectral, measureGeodesicArea, fetchTrafficFlow, exportInvestigationGeoJSON } from "../../lib/api";

interface SatelliteViewerProps {
  lat?: number;
  lon?: number;
  zoom?: number;
  locationName?: string;
  overlays?: VisualOverlay[];
  isTemporal?: boolean;
  investigationId?: string;
  onCoordinatesChange?: (lat: number, lon: number, zoom: number) => void;
}

export function SatelliteViewer({
  lat = 28.6139,
  lon = 77.209,
  zoom = 13,
  locationName = "NCR Delhi Urban Fringe",
  overlays = [],
  isTemporal = true,
  investigationId = "inv-live-01",
  onCoordinatesChange,
}: SatelliteViewerProps) {
  const [currentLat, setCurrentLat] = useState(lat);
  const [currentLon, setCurrentLon] = useState(lon);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [sliderPos, setSliderPos] = useState(50);
  const [showOverlays, setShowOverlays] = useState(true);
  const [activeProvider, setActiveProvider] = useState<"esri" | "nasa_gibs" | "sar" | "flir" | "nvg" | "ndvi" | "ndwi">("esri");

  // 3D Oblique Perspective States
  const [dimensionMode, setDimensionMode] = useState<"2d" | "3d">("2d");
  const [pitch, setPitch] = useState<number>(45);
  const [yaw, setYaw] = useState<number>(15);
  const [extrudeAltitude, setExtrudeAltitude] = useState<number>(50);

  // Geodesic Polygon Measurement States
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [measurePoints, setMeasurePoints] = useState<[number, number][]>([]);
  const [measurePixelPoints, setMeasurePixelPoints] = useState<{ x: number; y: number }[]>([]);
  const [measureResult, setMeasureResult] = useState<any | null>(null);

  // Spectral Index Telemetry
  const [spectralData, setSpectralData] = useState<any | null>(null);

  // Traffic Overlay States
  const [trafficEnabled, setTrafficEnabled] = useState<boolean>(false);
  const [trafficSegments, setTrafficSegments] = useState<any[]>([]);

  // Drag-to-pan states
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Slider Dragging State
  const isSliderDraggingRef = useRef(false);

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isSliderDraggingRef.current = true;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isSliderDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      let newX = e.clientX - rect.left;
      newX = Math.max(0, Math.min(rect.width, newX));
      setSliderPos((newX / rect.width) * 100);
    };

    const handleGlobalMouseUp = () => {
      isSliderDraggingRef.current = false;
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  const getOverlayPixelOffset = (targetLat: number, targetLon: number) => {
    const degreesPerPixelLon = 360 / (256 * Math.pow(2, currentZoom));
    const degreesPerPixelLat = (180 * Math.cos((currentLat * Math.PI) / 180)) / (256 * Math.pow(2, currentZoom));

    const dx = (targetLon - currentLon) / degreesPerPixelLon;
    const dy = (currentLat - targetLat) / degreesPerPixelLat;
    return { dx, dy };
  };

  // Sync external props
  useEffect(() => {
    setCurrentLat(lat);
    setCurrentLon(lon);
    if (zoom) setCurrentZoom(zoom);
  }, [lat, lon, zoom]);

  // Web Mercator tile calculation
  const getTileCoords = useCallback((latitude: number, longitude: number, z: number) => {
    const latRad = (latitude * Math.PI) / 180;
    const n = Math.pow(2, z);
    const x = ((longitude + 180) / 360) * n;
    const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
    return {
      tileX: Math.floor(x),
      tileY: Math.floor(y),
      pixelOffsetX: (x - Math.floor(x)) * 256,
      pixelOffsetY: (y - Math.floor(y)) * 256,
    };
  }, []);

  // MGRS coordinate string calculator
  const getMGRS = (latitude: number, longitude: number) => {
    const zoneNumber = Math.floor((longitude + 180) / 6) + 1;
    const letters = "CDEFGHJKLMNPQRSTUVWX";
    const bandIdx = Math.max(0, Math.min(letters.length - 1, Math.floor((latitude + 80) / 8)));
    const zoneLetter = letters[bandIdx];
    const e = Math.floor(((longitude % 6) / 6.0) * 10000);
    const n = Math.floor(((latitude % 8) / 8.0) * 10000);
    return `${zoneNumber}${zoneLetter} FK ${Math.abs(e).toString().padStart(4, "0")} ${Math.abs(n).toString().padStart(4, "0")}`;
  };

  // Ground Sampling Distance (GSD) at current zoom
  const getGSD = (z: number) => {
    const metersPerPixel = (156543.03392 * Math.cos((currentLat * Math.PI) / 180)) / Math.pow(2, z);
    return metersPerPixel < 1 ? `${(metersPerPixel * 100).toFixed(1)} cm/px` : `${metersPerPixel.toFixed(1)} m/px`;
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setCurrentZoom((z) => {
      const next = Math.min(18, z + 1);
      onCoordinatesChange?.(currentLat, currentLon, next);
      return next;
    });
  };

  const handleZoomOut = () => {
    setCurrentZoom((z) => {
      const next = Math.max(3, z - 1);
      onCoordinatesChange?.(currentLat, currentLon, next);
      return next;
    });
  };

  // Mouse pan drag & measurement handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    if (isMeasuring && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Convert pixel relative to container center to lat/lon
      const centerDx = px - rect.width / 2;
      const centerDy = py - rect.height / 2;
      const degPerPxLon = 360 / (256 * Math.pow(2, currentZoom));
      const degPerPxLat = (180 * Math.cos((currentLat * Math.PI) / 180)) / (256 * Math.pow(2, currentZoom));

      const ptLon = currentLon + centerDx * degPerPxLon;
      const ptLat = currentLat - centerDy * degPerPxLat;

      const newPts: [number, number][] = [...measurePoints, [ptLat, ptLon]];
      setMeasurePoints(newPts);
      setMeasurePixelPoints((prev) => [...prev, { x: px, y: py }]);

      if (newPts.length >= 3) {
        measureGeodesicArea(newPts).then((res) => setMeasureResult(res));
      }
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || isMeasuring) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    // Convert pixel delta to lat/lon degrees based on zoom level
    const degreesPerPixelLon = 360 / (256 * Math.pow(2, currentZoom));
    const degreesPerPixelLat = (180 * Math.cos((currentLat * Math.PI) / 180)) / (256 * Math.pow(2, currentZoom));

    const newLon = currentLon - dx * degreesPerPixelLon;
    const newLat = Math.max(-85, Math.min(85, currentLat + dy * degreesPerPixelLat));

    setCurrentLon(newLon);
    setCurrentLat(newLat);
    onCoordinatesChange?.(newLat, newLon, currentZoom);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Spectral Mode Trigger
  const handleSpectralToggle = async (type: "ndvi" | "ndwi") => {
    if (activeProvider === type) {
      setActiveProvider("esri");
      setSpectralData(null);
    } else {
      setActiveProvider(type);
      const data = await analyzeSpectral(currentLat, currentLon, type);
      setSpectralData(data);
    }
  };

  // Traffic Overlay Trigger
  const handleTrafficToggle = async () => {
    const next = !trafficEnabled;
    setTrafficEnabled(next);
    if (next) {
      const data = await fetchTrafficFlow(currentLat, currentLon);
      setTrafficSegments(data.segments || []);
    } else {
      setTrafficSegments([]);
    }
  };

  // GeoJSON Export Handler
  const handleExportGeoJSON = async () => {
    const geojson = await exportInvestigationGeoJSON(investigationId);
    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bhuvision-${investigationId}.geojson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate 3x3 or 4x3 satellite tile grid centered on target
  const tileInfo = getTileCoords(currentLat, currentLon, currentZoom);
  const gridOffsets = [-1, 0, 1];

  const getTileUrl = (z: number, x: number, y: number, provider: string) => {
    const maxTile = Math.pow(2, z);
    const safeX = ((x % maxTile) + maxTile) % maxTile;
    const safeY = Math.max(0, Math.min(maxTile - 1, y));

    if (provider === "nasa_gibs") {
      // NASA GIBS MODIS Terra NRT
      return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/default/GoogleMapsCompatible_Level9/${Math.min(9, z)}/${safeY}/${safeX}.jpg`;
    }
    // Default ESRI World Imagery (High-Res Global Optical)
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${safeY}/${safeX}`;
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ================= 3D PERSPECTIVE CONTROLS BAR (Active in 3D Oblique Mode) ================= */}
      {dimensionMode === "3d" && (
        <div className="bg-[#070B14] border border-cyan-500/30 p-3 rounded-xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs shadow-xl">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-[10px] text-cyan-400 uppercase font-bold shrink-0">Pitch ({pitch}°):</span>
            <input
              type="range"
              min="0"
              max="75"
              value={pitch}
              onChange={(e) => setPitch(Number(e.target.value))}
              className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-[10px] text-cyan-400 uppercase font-bold shrink-0">Yaw ({yaw}°):</span>
            <input
              type="range"
              min="-180"
              max="180"
              value={yaw}
              onChange={(e) => setYaw(Number(e.target.value))}
              className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <span className="text-[10px] text-cyan-400 uppercase font-bold shrink-0">3D Altitude ({extrudeAltitude}m):</span>
            <input
              type="range"
              min="0"
              max="100"
              value={extrudeAltitude}
              onChange={(e) => setExtrudeAltitude(Number(e.target.value))}
              className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-gray-800 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* ================= MAIN SATELLITE STAGE CONTAINER ================= */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          perspective: dimensionMode === "3d" ? "1200px" : "none",
          transformStyle: "preserve-3d",
        }}
        className={`relative w-full h-[550px] bg-[#050813] rounded-xl overflow-hidden border border-[#1F2937] select-none flex flex-col shadow-2xl ${
          isMeasuring ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        {/* ================= TOP TACTICAL TELEMETRY HUD ================= */}
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-gray-300 shadow-xl pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider">{locationName}</span>
          <span className="text-gray-500">|</span>
          <span className="text-cyan-300">GSD: {getGSD(currentZoom)}</span>
          <span className="text-gray-500">|</span>
          <span className="text-emerald-300 font-bold">ZOOM: {currentZoom}X</span>
        </div>

        {/* ================= TOP RIGHT ACTION CONTROLS ================= */}
        <div className="absolute top-3 right-3 z-30 flex flex-wrap items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 text-xs font-mono shadow-xl pointer-events-auto max-w-[90%] justify-end">
          {/* 2D / 3D Dimension Switcher */}
          <div className="flex items-center bg-[#0C1527] rounded-lg p-0.5 border border-white/10 mr-1">
            <button
              onClick={() => setDimensionMode("2d")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                dimensionMode === "2d" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              2D Nadir
            </button>
            <button
              onClick={() => setDimensionMode("3d")}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                dimensionMode === "3d" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"
              }`}
            >
              3D Oblique
            </button>
          </div>

          {/* Raster Modes */}
          <button
            onClick={() => { setActiveProvider("esri"); setSpectralData(null); }}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              activeProvider === "esri" ? "bg-blue-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            Optical
          </button>

          <button
            onClick={() => { setActiveProvider("nasa_gibs"); setSpectralData(null); }}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              activeProvider === "nasa_gibs" ? "bg-cyan-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            NASA Live
          </button>

          <button
            onClick={() => { setActiveProvider("sar"); setSpectralData(null); }}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
              activeProvider === "sar" ? "bg-purple-600 text-white shadow" : "text-gray-400 hover:text-white"
            }`}
          >
            SAR Radar
          </button>

          {/* Spectral NDVI Toggle */}
          <button
            onClick={() => handleSpectralToggle("ndvi")}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
              activeProvider === "ndvi"
                ? "bg-emerald-900/80 text-emerald-200 border-emerald-400"
                : "text-gray-400 hover:text-white border-transparent"
            }`}
          >
            NDVI
          </button>

          {/* Traffic Toggle */}
          <button
            onClick={handleTrafficToggle}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
              trafficEnabled
                ? "bg-amber-950/80 text-amber-300 border-amber-500/60"
                : "text-gray-400 hover:text-white border-transparent"
            }`}
          >
            Traffic: {trafficEnabled ? "ON" : "OFF"}
          </button>

          {/* Geodesic Measurement Tool Toggle */}
          <button
            onClick={() => {
              setIsMeasuring(!isMeasuring);
              if (!isMeasuring) {
                setMeasurePoints([]);
                setMeasurePixelPoints([]);
                setMeasureResult(null);
              }
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
              isMeasuring
                ? "bg-cyan-950 text-cyan-300 border-cyan-400 animate-pulse"
                : "text-gray-400 hover:text-white border-transparent"
            }`}
          >
            {isMeasuring ? "Measuring..." : "Measure"}
          </button>

          {/* GeoJSON Export Button */}
          <button
            onClick={handleExportGeoJSON}
            title="Export RFC 7946 GeoJSON for QGIS / Bhuvan"
            className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-gray-800 hover:bg-gray-700 text-cyan-300 border border-cyan-500/30 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <svg className="w-3 h-3 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>GeoJSON</span>
          </button>

          {/* Grounding Overlay Toggle */}
          <button
            onClick={() => setShowOverlays(!showOverlays)}
            className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors border cursor-pointer ${
              showOverlays
                ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                : "bg-gray-800 text-gray-400 border-transparent"
            }`}
          >
            AI Boxes: {showOverlays ? "ON" : "OFF"}
          </button>
        </div>

        {/* Floating Zoom & Compass Controls */}
        <div className="absolute right-4 top-20 z-30 flex flex-col gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-xl pointer-events-auto">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-8 h-8 rounded-lg bg-gray-900/80 hover:bg-cyan-900/60 text-white flex items-center justify-center text-sm font-bold border border-white/10 cursor-pointer transition-colors"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-8 h-8 rounded-lg bg-gray-900/80 hover:bg-cyan-900/60 text-white flex items-center justify-center text-sm font-bold border border-white/10 cursor-pointer transition-colors"
          >
            &minus;
          </button>
          <div className="w-8 h-8 rounded-lg bg-[#0C1527] border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-[10px] font-mono font-bold">
            N
          </div>
        </div>

        {/* ================= 3D PERSPECTIVE CANOPY SURFACE ================= */}
        <div
          className="relative flex-1 w-full h-full overflow-hidden bg-[#030611] transition-transform duration-300 ease-out"
          style={{
            transform:
              dimensionMode === "3d"
                ? `rotateX(${pitch}deg) rotateZ(${yaw}deg) scale(0.92)`
                : "none",
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* Pre-Event Baseline Tile Container */}
          <div
            className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-300 ${
              activeProvider === "sar"
                ? "grayscale contrast-200 brightness-90 bg-violet-950/20"
                : activeProvider === "ndvi"
                ? "hue-rotate-[85deg] saturate-[2.5] contrast-[1.3]"
                : activeProvider === "flir"
                ? "hue-rotate-180 saturate-200 contrast-150"
                : ""
            }`}
          >
            <div
              className="relative"
              style={{
                width: `${3 * 256}px`,
                height: `${3 * 256}px`,
                transform: `translate(${-tileInfo.pixelOffsetX + 128}px, ${-tileInfo.pixelOffsetY + 128}px)`,
              }}
            >
              {gridOffsets.map((dy) =>
                gridOffsets.map((dx) => {
                  const tx = tileInfo.tileX + dx;
                  const ty = tileInfo.tileY + dy;
                  return (
                    <img
                      key={`${currentZoom}-${tx}-${ty}`}
                      src={getTileUrl(currentZoom, tx, ty, activeProvider)}
                      alt="Satellite Tile"
                      loading="eager"
                      crossOrigin="anonymous"
                      className="absolute w-[256px] h-[256px] object-cover pointer-events-none"
                      style={{
                        left: `${(dx + 1) * 256}px`,
                        top: `${(dy + 1) * 256}px`,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' fill='%23081120'><rect width='256' height='256'/><text x='20' y='128' fill='%2338bdf8' font-family='monospace' font-size='12'>SATELLITE LEO FEED</text></svg>";
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Post-Event Bi-Temporal Comparison Split */}
          {isTemporal && (
            <div
              className="absolute inset-y-0 right-0 border-l-2 border-cyan-400 bg-[#040817]/90 shadow-2xl overflow-hidden pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div
                className="absolute inset-y-0 left-0 w-[1400px] -ml-[700px] flex items-center justify-center"
                style={{
                  transform: `translate(${-tileInfo.pixelOffsetX + 128}px, ${-tileInfo.pixelOffsetY + 128}px)`,
                }}
              >
                {gridOffsets.map((dy) =>
                  gridOffsets.map((dx) => {
                    const tx = tileInfo.tileX + dx;
                    const ty = tileInfo.tileY + dy;
                    return (
                      <img
                        key={`post-${currentZoom}-${tx}-${ty}`}
                        src={getTileUrl(currentZoom, tx, ty, activeProvider)}
                        alt="Post Event Satellite Tile"
                        loading="eager"
                        crossOrigin="anonymous"
                        className="absolute w-[256px] h-[256px] object-cover pointer-events-none brightness-110 saturate-125"
                        style={{
                          left: `${(dx + 1) * 256}px`,
                          top: `${(dy + 1) * 256}px`,
                        }}
                      />
                    );
                  })
                )}
              </div>
              <div className="absolute top-12 left-3 bg-black/85 px-2.5 py-0.5 rounded border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider shadow">
                Post-Event (T2 - Live Observation)
              </div>
            </div>
          )}

          {/* Pre-Event Label */}
          {isTemporal && (
            <div className="absolute top-12 left-3 bg-black/85 px-2.5 py-0.5 rounded border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider shadow pointer-events-none">
              Pre-Event (T1 - Historical Baseline)
            </div>
          )}

          {/* 3D Extrusion Building Prisms */}
          {dimensionMode === "3d" && (
            <div
              className="absolute left-[40%] top-[36%] w-24 h-24 pointer-events-none"
              style={{
                transform: `translateZ(${extrudeAltitude * 1.2}px)`,
                boxShadow: `0 0 30px rgba(6, 182, 212, 0.4), inset 0 0 15px rgba(6, 182, 212, 0.6)`,
                border: "2px solid #06B6D4",
                background: "rgba(6, 182, 212, 0.15)",
              }}
            >
              <div className="absolute -top-5 left-0 bg-cyan-500 text-black text-[9px] font-mono font-bold px-1 rounded">
                Prism: {extrudeAltitude}m
              </div>
            </div>
          )}

          {/* Center Target Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20">
            <div className="w-12 h-12 relative flex items-center justify-center">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-cyan-400/80 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              <div className="w-6 h-6 rounded-full border border-cyan-300/60 animate-ping opacity-50" />
              <div className="w-4 h-4 rounded-full border border-cyan-400" />
            </div>
          </div>

          {/* AI Verified Change Overlays */}
          {showOverlays && (() => {
            const aiBoxTargetLat = 28.614;
            const aiBoxTargetLon = 77.209;
            const { dx, dy } = getOverlayPixelOffset(aiBoxTargetLat, aiBoxTargetLon);
            return (
              <div
                className="absolute w-[26%] h-[24%] border-2 border-dashed border-[#EF4444] bg-red-500/20 rounded pointer-events-none transition-transform duration-100 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse z-20"
                style={{
                  left: "38%",
                  top: "34%",
                  transform: `translate(${dx}px, ${dy}px)`
                }}
              >
                <div className="absolute -top-6 left-0 bg-[#EF4444] text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>AI Verified Change AOI (14.2%)</span>
                </div>
              </div>
            );
          })()}

          {/* Additional Custom Overlays */}
          {showOverlays &&
            overlays.map((ov, idx) => {
              const [xmin, ymin, xmax, ymax] = ov.coordinates[0] || [100, 100, 300, 300];
              const { dx, dy } = getOverlayPixelOffset(28.614, 77.209);
              return (
                <div
                  key={idx}
                  className="absolute border-2 border-dashed border-[#EF4444] bg-red-500/20 rounded pointer-events-none transition-transform duration-100 z-20"
                  style={{
                    left: `${(xmin / 512) * 100}%`,
                    top: `${(ymin / 512) * 100}%`,
                    width: `${((xmax - xmin) / 512) * 100}%`,
                    height: `${((ymax - ymin) / 512) * 100}%`,
                    transform: `translate(${dx}px, ${dy}px)`
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-[#EF4444] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                    {ov.label} ({Math.round((ov.confidence || 0.85) * 100)}%)
                  </div>
                </div>
              );
            })}

          {/* Live Traffic Vector Heatmap Layer */}
          {trafficEnabled && trafficSegments.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
              {trafficSegments.map((seg, sIdx) => {
                const isHeavy = seg.congestion_level === "heavy" || seg.congestion_level === "severe";
                const strokeCol = isHeavy ? "#EF4444" : seg.congestion_level === "moderate" ? "#F59E0B" : "#10B981";
                const y1 = 150 + sIdx * 90;
                const y2 = 210 + sIdx * 80;
                return (
                  <g key={seg.segment_id}>
                    <line
                      x1={100}
                      y1={y1}
                      x2={500}
                      y2={y2}
                      stroke={strokeCol}
                      strokeWidth={4}
                      strokeDasharray={isHeavy ? "6,6" : "none"}
                      className="animate-pulse opacity-90"
                    />
                    <text x={260} y={y1 - 6} fill={strokeCol} fontSize={10} fontFamily="monospace" fontWeight="bold">
                      {seg.road_name} ({seg.speed_kmh} km/h)
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Geodesic Measurement Polygon Drawing Canvas */}
          {measurePixelPoints.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-25">
              {measurePixelPoints.length > 1 && (
                <polygon
                  points={measurePixelPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                  fill="rgba(6, 182, 212, 0.25)"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  strokeDasharray="4,4"
                />
              )}
              {measurePixelPoints.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r={4} fill="#22D3EE" stroke="#FFFFFF" strokeWidth={1.5} />
              ))}
            </svg>
          )}

          {/* Temporal Swipe Slider Handle */}
          {isTemporal && (
            <div
              className="absolute inset-y-0 z-30 flex items-center justify-center -ml-3 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div 
                className="w-7 h-11 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.8)] flex items-center justify-center pointer-events-auto cursor-ew-resize border-2 border-white"
                onMouseDown={handleSliderMouseDown}
              >
                <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m9 18-6-6 6-6" />
                  <path d="m15 6 6 6-6 6" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* ================= FLOATING SPECTRAL / MEASURE CARDS ================= */}
        {spectralData && (
          <div className="absolute bottom-12 left-4 z-30 bg-black/90 backdrop-blur-md border border-emerald-500/40 p-3 rounded-xl font-mono text-xs text-white max-w-sm shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
              <span className="text-emerald-400 font-bold uppercase">{spectralData.index_type} SPECTRAL RATIO</span>
              <span className="text-white font-bold">{spectralData.mean_value}</span>
            </div>
            <p className="text-[11px] text-gray-300">{spectralData.interpretation}</p>
            <p className="text-[10px] text-gray-500 mt-1">{spectralData.band_combination}</p>
          </div>
        )}

        {isMeasuring && (
          <div className="absolute bottom-12 right-4 z-30 bg-black/90 backdrop-blur-md border border-cyan-500/40 p-3 rounded-xl font-mono text-xs text-white max-w-xs shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5 mb-1.5">
              <span className="text-cyan-400 font-bold uppercase">GEODESIC MEASURE</span>
              <button
                onClick={() => {
                  setMeasurePoints([]);
                  setMeasurePixelPoints([]);
                  setMeasureResult(null);
                }}
                className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <p className="text-[11px] text-gray-300">
              Vertices: {measurePoints.length} (Click on map to drop corners)
            </p>
            {measureResult && (
              <div className="mt-2 space-y-1 text-[11px] bg-cyan-950/40 p-2 rounded border border-cyan-500/30">
                <div className="flex justify-between">
                  <span className="text-gray-400">Area:</span>
                  <span className="text-cyan-300 font-bold">{measureResult.area_hectares} Ha ({measureResult.area_acres} Acres)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Square KM:</span>
                  <span className="text-white font-bold">{measureResult.area_sq_km} km²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Perimeter:</span>
                  <span className="text-white font-bold">{measureResult.perimeter_km} km</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= BOTTOM STATUS BAR ================= */}
        <div className="bg-[#070B16] border-t border-[#1F2937] px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-gray-300 font-mono z-30">
          <div className="flex items-center gap-4">
            <span className="text-cyan-300 font-bold">
              LAT: {currentLat.toFixed(5)}° N &bull; LON: {currentLon.toFixed(5)}° E
            </span>
            <span className="text-gray-500 hidden md:inline">|</span>
            <span className="text-gray-300 hidden md:inline">MGRS: {getMGRS(currentLat, currentLon)}</span>
            <span className="text-gray-500 hidden md:inline">|</span>
            <span className="text-gray-400 hidden lg:inline">
              TILE: z={currentZoom} x={tileInfo.tileX} y={tileInfo.tileY}
            </span>
          </div>

          <div className="flex items-center gap-3 text-cyan-400 mt-1 sm:mt-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {dimensionMode === "3d" ? "3D Oblique Active" : "Click & drag map to pan • Drag slider to compare"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
