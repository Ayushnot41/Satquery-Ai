"use client";

import React, { useState } from "react";

interface SensorItem {
  id: string;
  name: string;
  agency: string;
  category: "optical" | "sar";
  badge: string;
  badgeColor: string;
  resolution: string;
  orbit: string;
  swath: string;
  revisit: string;
  bandsOrPol: string;
  description: string;
}

const SENSORS: SensorItem[] = [
  {
    id: "cartosat3",
    name: "Cartosat-3",
    agency: "isro",
    category: "optical",
    badge: "ISRO STRATEGIC",
    badgeColor: "bg-amber-950 text-amber-300 border-amber-500/40",
    resolution: "0.28m PAN / 1.12m VNIR",
    orbit: "505 km SSO",
    swath: "17 km",
    revisit: "4-5 Days",
    bandsOrPol: "PAN + 4 VNIR Bands",
    description: "Very High Resolution Optical imaging satellite. Delivers sub-meter panchromatic and multispectral reconnaissance for defense and urban cadastral footprinting."
  },
  {
    id: "sentinel1",
    name: "Sentinel-1 (C-SAR)",
    agency: "esa",
    category: "sar",
    badge: "ESA COPERNICUS",
    badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-500/40",
    resolution: "5m x 20m (IW)",
    orbit: "693 km SSO",
    swath: "250 km (IW)",
    revisit: "6 Days (1A/1C)",
    bandsOrPol: "Dual VV + VH Polarizations",
    description: "Synthetic Aperture Radar satellite providing all-weather, day-and-night radar backscatter. Penetrates cloud decks, monsoon showers, and detects standing flood water."
  },
  {
    id: "risat1b",
    name: "RISAT-1B / EOS-04",
    agency: "isro",
    category: "sar",
    badge: "ISRO TACTICAL RADAR",
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-500/40",
    resolution: "1m to 50m (Spotlight / ScanSAR)",
    orbit: "529 km Polar",
    swath: "10 km to 223 km",
    revisit: "Agile Phased Array",
    bandsOrPol: "Hybrid Circular Polarimetry",
    description: "Active Radar Imaging Satellite featuring C-band hybrid polarimetry. Excels in penetrating dense tropical foliage and identifying surface deformation."
  },
  {
    id: "sentinel2",
    name: "Sentinel-2 (MSI)",
    agency: "esa",
    category: "optical",
    badge: "ESA COPERNICUS",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-500/40",
    resolution: "10m / 20m / 60m",
    orbit: "786 km SSO",
    swath: "290 km",
    revisit: "5 Days",
    bandsOrPol: "13 Spectral Bands (VNIR to SWIR)",
    description: "Multispectral optical sensor covering 13 spectral bands. High radiometric accuracy for vegetative NDVI, water NDWI, and impervious built-up NDBI indices."
  },
  {
    id: "landsat8",
    name: "Landsat-8 & Landsat-9",
    agency: "nasa",
    category: "optical",
    badge: "NASA / USGS",
    badgeColor: "bg-purple-950 text-purple-300 border-purple-500/40",
    resolution: "15m PAN / 30m MS / 100m Thermal",
    orbit: "705 km SSO",
    swath: "185 km",
    revisit: "8 Days (Constellation)",
    bandsOrPol: "OLI-2 (9 Bands) + TIRS-2 (2 Bands)",
    description: "Standard Earth observation satellite providing 30m multispectral and 100m thermal infrared imagery. Crucial for long-term climate and historical change baselines."
  },
  {
    id: "resourcesat",
    name: "Resourcesat-2A",
    agency: "isro",
    category: "optical",
    badge: "ISRO AGRICULTURE",
    badgeColor: "bg-amber-950 text-amber-300 border-amber-500/40",
    resolution: "5.8m (LISS-4) / 56m (AWiFS)",
    orbit: "817 km SSO",
    swath: "70 km / 740 km",
    revisit: "5 Days (AWiFS) / 24 Days (LISS-4)",
    bandsOrPol: "Green, Red, NIR, SWIR",
    description: "Multi-resolution remote sensing platform supporting integrated water, crop yield, and forest canopy monitoring across the Indian subcontinent."
  }
];

interface SatelliteRegistryViewProps {
  onSelectSensor?: (sensorId: string) => void;
}

export function SatelliteRegistryView({ onSelectSensor }: SatelliteRegistryViewProps) {
  const [filter, setFilter] = useState<string>("all");
  const [selectedSensorNotice, setSelectedSensorNotice] = useState<string | null>(null);

  const filteredSensors = SENSORS.filter((s) => {
    if (filter === "all") return true;
    if (filter === "isro") return s.agency === "isro";
    if (filter === "esa") return s.agency === "esa";
    if (filter === "nasa") return s.agency === "nasa";
    if (filter === "sar") return s.category === "sar";
    if (filter === "optical") return s.category === "optical";
    return true;
  });

  const handleMount = (sensor: SensorItem) => {
    setSelectedSensorNotice(`Sensor profile for ${sensor.name} mounted into operational workspace.`);
    setTimeout(() => setSelectedSensorNotice(null), 3500);
    if (onSelectSensor) onSelectSensor(sensor.id);
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-indigo-950/80 border border-sky-500/40 p-5 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-sky-600/20 border border-sky-400/50 flex items-center justify-center text-sky-300 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wider uppercase">
                  Spaceborne Constellation & Sensor Registry
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/40">
                  ISRO &bull; ESA &bull; NASA SENSOR CATALOG
                </span>
              </div>
              <p className="text-xs text-gray-300 font-mono mt-1">
                Explore operational orbital specifications, ground sampling distances (GSD), spectral band passes, and radiometric calibrations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">{SENSORS.length} Sensors Verified Operational</span>
          </div>
        </div>
      </div>

      {selectedSensorNotice && (
        <div className="p-3 bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 rounded-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>{selectedSensorNotice}</span>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            filter === "all" ? "bg-blue-600 text-white" : "bg-[#0B1120] border border-gray-800 text-gray-300 hover:text-white"
          }`}
        >
          All Constellations ({SENSORS.length})
        </button>
        <button
          onClick={() => setFilter("isro")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            filter === "isro" ? "bg-blue-600 text-white" : "bg-[#0B1120] border border-gray-800 text-amber-300 hover:text-white"
          }`}
        >
          ISRO Satellites (3)
        </button>
        <button
          onClick={() => setFilter("esa")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            filter === "esa" ? "bg-blue-600 text-white" : "bg-[#0B1120] border border-gray-800 text-cyan-300 hover:text-white"
          }`}
        >
          ESA Copernicus (2)
        </button>
        <button
          onClick={() => setFilter("nasa")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            filter === "nasa" ? "bg-blue-600 text-white" : "bg-[#0B1120] border border-gray-800 text-purple-300 hover:text-white"
          }`}
        >
          NASA / USGS (1)
        </button>
        <button
          onClick={() => setFilter("sar")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            filter === "sar" ? "bg-blue-600 text-white" : "bg-[#0B1120] border border-gray-800 text-emerald-300 hover:text-white"
          }`}
        >
          SAR Radar (2)
        </button>
        <button
          onClick={() => setFilter("optical")}
          className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
            filter === "optical" ? "bg-blue-600 text-white" : "bg-[#0B1120] border border-gray-800 text-sky-300 hover:text-white"
          }`}
        >
          Multispectral Optical (4)
        </button>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSensors.map((sensor) => (
          <div
            key={sensor.id}
            className="bg-[#0B1120] border border-[#1F2937] hover:border-cyan-500/50 p-4 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sensor.badgeColor}`}>
                  {sensor.badge}
                </span>
                <span className="text-xs text-gray-400">{sensor.resolution}</span>
              </div>
              <h3 className="text-base font-bold text-white">{sensor.name}</h3>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">{sensor.description}</p>
              <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] bg-[#070B16] p-2.5 rounded-xl border border-gray-800 text-gray-300">
                <div>
                  <span className="text-gray-500">Orbit:</span> {sensor.orbit}
                </div>
                <div>
                  <span className="text-gray-500">Swath:</span> {sensor.swath}
                </div>
                <div>
                  <span className="text-gray-500">Revisit:</span> {sensor.revisit}
                </div>
                <div>
                  <span className="text-gray-500">Channels:</span> {sensor.bandsOrPol}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleMount(sensor)}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="m10 15 5-3-5-3v6z" />
              </svg>
              <span>Mount in Workspace</span>
            </button>
          </div>
        ))}
      </div>

      {/* Multispectral Band Combination Matrix */}
      <div className="bg-[#0B1120] border border-[#1F2937] p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-gray-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span className="text-white font-bold uppercase">Multispectral Band Combination Matrix (Sentinel-2 / Landsat)</span>
          </div>
          <span className="text-gray-400 text-[10px]">Standard ISRO &bull; USGS Formats</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#070B16] border-b border-[#1F2937] text-gray-400 text-[11px] uppercase">
                <th className="py-2.5 px-3">Application</th>
                <th className="py-2.5 px-3">RGB Channels</th>
                <th className="py-2.5 px-3">Spectral Rationale</th>
                <th className="py-2.5 px-3">Visual Output Characteristics</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937]/50 text-gray-200">
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-300">Natural Color</td>
                <td className="py-2.5 px-3 font-mono text-white">Red, Green, Blue (B4, B3, B2)</td>
                <td className="py-2.5 px-3 text-gray-400">Human eye optical simulation</td>
                <td className="py-2.5 px-3 text-emerald-400">Natural green vegetation, brown soils, blue water</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-300">Color Infrared (CIR)</td>
                <td className="py-2.5 px-3 font-mono text-white">NIR, Red, Green (B8, B4, B3)</td>
                <td className="py-2.5 px-3 text-gray-400">High NIR chlorophyll cellular reflectance</td>
                <td className="py-2.5 px-3 text-red-400">Vigorous vegetation appears bright red; urban is cyan-grey</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-300">Agriculture & Moisture</td>
                <td className="py-2.5 px-3 font-mono text-white">SWIR-1, NIR, Blue (B11, B8, B2)</td>
                <td className="py-2.5 px-3 text-gray-400">SWIR absorption highlights moisture differences</td>
                <td className="py-2.5 px-3 text-yellow-300">Healthy crops appear vivid green; bare dry soil is magenta</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-bold text-cyan-300">Urban Impervious Footprint</td>
                <td className="py-2.5 px-3 font-mono text-white">SWIR-2, SWIR-1, Red (B12, B11, B4)</td>
                <td className="py-2.5 px-3 text-gray-400">Distinguishes asphalt, concrete, and rock minerals</td>
                <td className="py-2.5 px-3 text-purple-400">Built-up surfaces appear bright cyan/purple; soil is orange</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
