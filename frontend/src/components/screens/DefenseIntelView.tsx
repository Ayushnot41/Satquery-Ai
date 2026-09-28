import React, { useState, useEffect } from "react";
import { fetchDefenseHotspots, analyzeDefenseTarget, fetchTacticalLayers } from "../../lib/api";
import { DefensePdfReportTemplate } from "../workspace/DefensePdfReportTemplate";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export function DefenseIntelView() {
  const [activeBranch, setActiveBranch] = useState<"NAVY" | "AIR_FORCE" | "ARMY_BSF">("NAVY");
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>("NAVY-01");
  const [tacticalQuery, setTacticalQuery] = useState<string>("Assess vessel movement and berth occupancy in Western Fleet basin");
  const [activeSensor, setActiveSensor] = useState<string>("Sentinel-1 SAR C-Band");
  const [clearanceLevel, setClearanceLevel] = useState<string>("TOP SECRET // NOFORN");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [defenseReport, setDefenseReport] = useState<any | null>(null);
  const [tacticalLayers, setTacticalLayers] = useState<any[]>([]);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isExportingData, setIsExportingData] = useState<boolean>(false);
  const defensePdfRef = React.useRef<HTMLDivElement>(null);

  const exportDefensePDF = async () => {
    if (!defensePdfRef.current) return;
    setIsExportingPdf(true);
    try {
      const canvas = await html2canvas(defensePdfRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const safeBranch = activeBranch;
      const safeLoc = (activeHotspot?.name || "Installation").replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`MoD_Strategic_Defense_Dossier_${safeBranch}_${safeLoc}_${Date.now()}.pdf`);
    } catch (err) {
      console.error("Defense PDF export error:", err);
      alert("Failed to render Defense Dossier PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const exportDefenseData = () => {
    setIsExportingData(true);
    try {
      const dataPayload = {
        agency: "Headquarters Integrated Defence Staff (HQ IDS) // MoD",
        classification: clearanceLevel,
        service_branch: activeBranch,
        target_installation: {
          id: activeHotspot?.id,
          name: activeHotspot?.name,
          command: activeHotspot?.command,
          location: activeHotspot?.location,
          latitude: activeHotspot?.lat,
          longitude: activeHotspot?.lon,
          mgrs: activeHotspot?.mgrs,
          threat_level: activeHotspot?.threat_level,
        },
        surveillance_telemetry: {
          sensor: activeSensor,
          query: tacticalQuery,
          threat_score_pct: defenseReport?.threat_score_pct ?? 74,
          readiness_status: defenseReport?.readiness_status ?? "DEFCON 2 // ELEVATED MONITORING",
          doctrine_justification: defenseReport?.doctrine_justification,
          recommended_command_action: defenseReport?.recommended_tactical_action,
          detected_combatant_entities: defenseReport?.detected_entities || [],
        },
        tactical_overlays_active: tacticalLayers.map((l: any) => l.name),
        exported_at: new Date().toISOString(),
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      const safeBranch = activeBranch;
      const safeLoc = (activeHotspot?.name || "Installation").replace(/[^a-zA-Z0-9_-]/g, "_");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `MoD_Strategic_Defense_Data_${safeBranch}_${safeLoc}_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error("Defense data export failed:", err);
    } finally {
      setTimeout(() => setIsExportingData(false), 600);
    }
  };

  useEffect(() => {
    fetchDefenseHotspots(activeBranch).then((data) => {
      setHotspots(data);
      if (data.length > 0) {
        setSelectedHotspotId(data[0].id);
        updateDefaultQuery(activeBranch, data[0].name);
      }
    });
    fetchTacticalLayers().then((data) => setTacticalLayers(data.layers || []));
  }, [activeBranch]);

  const updateDefaultQuery = (branch: string, name: string) => {
    if (branch === "NAVY") {
      setTacticalQuery(`Detect surface combatants and uncoordinated dark vessels navigating within ${name}`);
      setActiveSensor("Sentinel-1 SAR (Specular Water)");
    } else if (branch === "AIR_FORCE") {
      setTacticalQuery(`Perform Bomb Damage Assessment (BDA) on runway and monitor fighter dispersal at ${name}`);
      setActiveSensor("Cartosat-3 High-Res Optical");
    } else {
      setTacticalQuery(`Demarcate forward defensive bunkers, vehicle tracks, and terrain trafficability at ${name}`);
      setActiveSensor("Sentinel-1 C-Band InSAR");
    }
  };

  const handleBranchChange = (branch: "NAVY" | "AIR_FORCE" | "ARMY_BSF") => {
    setActiveBranch(branch);
    setDefenseReport(null);
  };

  const handleHotspotChange = (id: string) => {
    setSelectedHotspotId(id);
    const found = hotspots.find((h) => h.id === id);
    if (found) {
      updateDefaultQuery(activeBranch, found.name);
    }
  };

  const handleRunDefenseAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const selected = hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];
      const payload = {
        branch: activeBranch,
        hotspot_id: selectedHotspotId,
        lat: selected?.lat || 14.7736,
        lon: selected?.lon || 74.1567,
        tactical_query: tacticalQuery,
        sensor: activeSensor,
        clearance_level: clearanceLevel,
      };
      const report = await analyzeDefenseTarget(payload);
      setDefenseReport(report);
    } catch (err) {
      console.error("Defense analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeHotspot = hotspots.find((h) => h.id === selectedHotspotId) || hotspots[0];

  return (
    <>
      {/* Off-screen high-res vector PDF print template */}
      <DefensePdfReportTemplate
        ref={defensePdfRef}
        branch={activeBranch}
        hotspot={activeHotspot}
        tacticalQuery={tacticalQuery}
        activeSensor={activeSensor}
        clearanceLevel={clearanceLevel}
        report={defenseReport}
      />

      <div className="w-full max-w-7xl mx-auto p-6 space-y-6 text-white select-none">
        {/* Header Strip */}
        <div className="bg-[#090E1A] border border-cyan-500/30 p-6 rounded-2xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                Strategic Defense Protocol
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                {clearanceLevel}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight">
              Indian Armed Forces Remote Sensing Defense Suite
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 font-mono">
              Autonomous tactical intelligence for Indian Navy, Air Force, and Army / Border Security Force (BSF).
            </p>
          </div>

          {/* Defense Readiness Indicator & Quick Export Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-[#050811] border border-cyan-500/40 px-3.5 py-2.5 rounded-xl font-mono text-xs flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-[9px] text-gray-400 uppercase">Strategic Grid Link</div>
                <div className="font-bold text-cyan-300 text-[11px]">HQ IDS // CONNECTED</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportDefensePDF}
                disabled={isExportingPdf}
                title="Download classified defense intelligence dossier PDF"
                className="px-3.5 py-2.5 bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/60 border border-rose-400/40 transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer"
              >
                {isExportingPdf ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dossier PDF...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                    </svg>
                    <span>Export PDF Dossier</span>
                  </>
                )}
              </button>

              <button
                onClick={exportDefenseData}
                disabled={isExportingData}
                title="Download defense telemetry in structured JSON"
                className="px-3.5 py-2.5 bg-[#0e1726] hover:bg-[#15233a] text-cyan-300 hover:text-white font-bold text-xs rounded-xl border border-cyan-500/40 shadow-sm transition-all flex items-center justify-center gap-2 font-mono uppercase tracking-wider cursor-pointer"
              >
                {isExportingData ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Data...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      {/* Military Branch Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <button
          onClick={() => handleBranchChange("NAVY")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
            activeBranch === "NAVY"
              ? "bg-[#0C1B33] border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-950/60 font-bold"
              : "bg-[#090E1A] border-[#1F2937] text-gray-400 hover:text-white"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center text-cyan-400 font-bold">
            ⚓
          </div>
          <div className="text-left">
            <div className="text-white text-sm font-bold">Indian Navy</div>
            <div className="text-[10px] text-gray-400">Maritime Domain Awareness &amp; Dark Vessels</div>
          </div>
        </button>

        <button
          onClick={() => handleBranchChange("AIR_FORCE")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
            activeBranch === "AIR_FORCE"
              ? "bg-[#0C1B33] border-blue-400 text-blue-300 shadow-lg shadow-blue-950/60 font-bold"
              : "bg-[#090E1A] border-[#1F2937] text-gray-400 hover:text-white"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 font-bold">
            ✈
          </div>
          <div className="text-left">
            <div className="text-white text-sm font-bold">Indian Air Force</div>
            <div className="text-[10px] text-gray-400">Airbase Readiness &amp; Runway BDA</div>
          </div>
        </button>

        <button
          onClick={() => handleBranchChange("ARMY_BSF")}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
            activeBranch === "ARMY_BSF"
              ? "bg-[#0C1B33] border-emerald-400 text-emerald-300 shadow-lg shadow-emerald-950/60 font-bold"
              : "bg-[#090E1A] border-[#1F2937] text-gray-400 hover:text-white"
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold">
            🛡
          </div>
          <div className="text-left">
            <div className="text-white text-sm font-bold">Indian Army &amp; BSF</div>
            <div className="text-[10px] text-gray-400">LoC/LAC Fortifications &amp; Trafficability</div>
          </div>
        </button>
      </div>

      {/* Target Installation & Tactical Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sector Details & Tactical Form */}
        <div className="lg:col-span-2 bg-[#090E1A] border border-[#1F2937] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F2937] pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Operational Sector Configuration
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              {hotspots.length} Strategic Bases Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Target Military Installation</label>
              <select
                value={selectedHotspotId}
                onChange={(e) => handleHotspotChange(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F2937] text-white px-3 py-2 rounded-lg outline-none"
              >
                {hotspots.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.command})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Primary Defense Sensor Modality</label>
              <select
                value={activeSensor}
                onChange={(e) => setActiveSensor(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F2937] text-white px-3 py-2 rounded-lg outline-none"
              >
                {activeHotspot?.primary_sensors?.map((s: string, idx: number) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                )) || <option value="Sentinel-1 SAR C-Band">Sentinel-1 SAR C-Band</option>}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Tactical Intelligence Query</label>
            <input
              type="text"
              value={tacticalQuery}
              onChange={(e) => setTacticalQuery(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F2937] focus:border-cyan-500 text-white px-3 py-2.5 rounded-lg text-xs font-mono outline-none"
            />
          </div>

          {activeHotspot && (
            <div className="bg-[#070B14] border border-[#1F2937] rounded-lg p-3 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <span>{activeHotspot.location}</span>
                <span className="text-amber-400 font-bold">THREAT LEVEL: {activeHotspot.threat_level}</span>
              </div>
              <div className="text-[11px] text-gray-400">{activeHotspot.description}</div>
              <div className="text-[10px] text-gray-500 pt-1 flex items-center gap-4">
                <span>MGRS: {activeHotspot.mgrs}</span>
                <span>Lat/Lon: [{activeHotspot.lat.toFixed(4)}, {activeHotspot.lon.toFixed(4)}]</span>
              </div>
            </div>
          )}

          <button
            onClick={handleRunDefenseAnalysis}
            disabled={isAnalyzing}
            className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
              isAnalyzing
                ? "bg-cyan-950 text-cyan-400 border border-cyan-500/50 animate-pulse cursor-wait"
                : "bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-cyan-600/30"
            }`}
          >
            {isAnalyzing ? (
              <>
                <svg className="w-4 h-4 animate-spin text-cyan-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Synthesizing Multi-Sensor Threat Assessment...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Execute Strategic Defense Assessment</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Tactical Overlays & Grid Monitor */}
        <div className="bg-[#090E1A] border border-[#1F2937] rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 mb-3">
              Operational Defense Overlays
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {tacticalLayers.map((l: any) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between p-2.5 bg-[#070B14] border border-[#1F2937] rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-gray-200 text-[11px]">{l.name}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#070B14] border border-[#1F2937] p-3 rounded-lg font-mono text-[10px] text-gray-400 space-y-1">
            <div className="text-gray-200 font-bold">MILITARY GRID REFERENCE PROTOCOL</div>
            <div>WGS84 Ellipsoid &bull; UTM Projection &bull; 100km Square Identifiers</div>
            <div className="text-cyan-400">ISRO Geo-Intelligence Compliant</div>
          </div>
        </div>
      </div>

      {/* Tactical Report Output */}
      {defenseReport && (
        <div className="bg-[#091122] border border-cyan-500/40 rounded-2xl p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1F2937] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h2 className="font-mono font-bold text-base text-white">
                  DEFENSE INTELLIGENCE REPORT: {defenseReport.report_id}
                </h2>
              </div>
              <p className="text-xs text-cyan-300 font-mono mt-0.5">
                Target: {defenseReport.target_sector} | MGRS: {defenseReport.mgrs_coordinates}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded bg-rose-950 text-rose-300 border border-rose-500/50 font-bold">
                {defenseReport.readiness_status}
              </span>
              <span className="px-3 py-1 rounded bg-amber-950 text-amber-300 border border-amber-500/50 font-bold">
                THREAT SCORE: {defenseReport.threat_score_pct}%
              </span>

              <button
                onClick={exportDefensePDF}
                disabled={isExportingPdf}
                title="Download classified defense dossier PDF"
                className="px-3 py-1 rounded bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs border border-rose-400/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer uppercase"
              >
                {isExportingPdf ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Dossier PDF...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                    </svg>
                    <span>PDF Dossier</span>
                  </>
                )}
              </button>

              <button
                onClick={exportDefenseData}
                disabled={isExportingData}
                title="Download defense data in JSON format"
                className="px-3 py-1 rounded bg-[#070B14] hover:bg-[#111827] text-cyan-300 hover:text-white font-bold text-xs border border-cyan-500/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer uppercase"
              >
                {isExportingData ? (
                  <>
                    <span className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Data...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>JSON Data</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Doctrine & Recommendation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-[#070B14] border border-[#1F2937] p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Scientific Doctrine Justification
              </span>
              <p className="text-gray-200 leading-relaxed text-[11px]">{defenseReport.doctrine_justification}</p>
            </div>

            <div className="bg-[#070B14] border border-amber-500/30 p-4 rounded-xl space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Recommended Tactical Command Action
              </span>
              <p className="text-gray-200 leading-relaxed text-[11px]">{defenseReport.recommended_tactical_action}</p>
            </div>
          </div>

          {/* Detected Tactical Entities Table */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 mb-3">
              Identified Tactical Entities ({defenseReport.detected_entities?.length || 0})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border border-[#1F2937] rounded-lg overflow-hidden">
                <thead className="bg-[#070B14] text-gray-400 text-[10px] uppercase border-b border-[#1F2937]">
                  <tr>
                    <th className="p-3">Target ID</th>
                    <th className="p-3">Entity Type</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3">Sensor Radar Metric</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F2937] bg-[#0A0F1C]">
                  {defenseReport.detected_entities?.map((e: any) => (
                    <tr key={e.id} className="hover:bg-[#111827]">
                      <td className="p-3 font-bold text-cyan-400">{e.id}</td>
                      <td className="p-3 text-gray-300">{e.entity_type}</td>
                      <td className="p-3 text-white font-bold">{e.classification}</td>
                      <td className="p-3 text-emerald-400 font-bold">{Math.round(e.confidence * 100)}%</td>
                      <td className="p-3 text-gray-400 text-[11px]">{e.metric_detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trace */}
          <div className="border-t border-[#1F2937] pt-3 flex flex-wrap gap-3 font-mono text-[10px] text-gray-400">
            {defenseReport.audit_trace?.map((t: any, idx: number) => (
              <span key={idx} className="bg-[#070B14] px-3 py-1 rounded border border-[#1F2937] text-gray-300">
                ✓ {t.step} &bull; {t.sensor || t.mgrs || t.model || t.engine} ({t.duration_ms}ms)
              </span>
            ))}
          </div>
        </div>
      )}
      </div>
    </>
  );
}
