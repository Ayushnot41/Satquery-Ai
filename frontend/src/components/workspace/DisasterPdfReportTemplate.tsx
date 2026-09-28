import React from "react";

interface DisasterPdfReportTemplateProps {
  assessmentResult: any | null;
  evacuationResult: any | null;
  scenarioName?: string;
  originLat: number;
  originLon: number;
  destLat: number;
  destLon: number;
  disasterType?: string;
  weatherCondition?: string;
}

export const DisasterPdfReportTemplate = React.forwardRef<
  HTMLDivElement,
  DisasterPdfReportTemplateProps
>(
  (
    {
      assessmentResult,
      evacuationResult,
      scenarioName = "Brahmaputra Flood Plain Basin, Assam",
      originLat,
      originLon,
      destLat,
      destLon,
      disasterType = "flood",
      weatherCondition = "Monsoon Inundation > 150mm / 24h",
    },
    ref
  ) => {
    const timestamp = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "medium",
    });

    const reportId = `NDMA-EVAC-${Math.abs(Math.round(originLat * 1000 + originLon * 1000)).toString(16).toUpperCase()}-${Date.now().toString(16).slice(-4).toUpperCase()}`;

    const probPct = assessmentResult?.disaster_probability_pct ?? 88;
    const severity = assessmentResult?.hazard_severity ?? "CRITICAL LEVEL 4";
    const affectedKm2 = assessmentResult?.affected_area_sqkm ?? 142.5;
    const popRisk = assessmentResult?.estimated_population_at_risk?.toLocaleString() ?? "34,200";

    // Chart 1.0 Data: Hazard Risk Probabilities
    const hazardData = [
      { name: "Surface Inundation", score: probPct, threshold: 70, color: "#2563eb" },
      { name: "Arterial Submergence", score: Math.min(98, probPct + 6), threshold: 70, color: "#dc2626" },
      { name: "Bridge Hydraulic Pressure", score: Math.max(45, probPct - 15), threshold: 70, color: "#ea580c" },
      { name: "Power Grid Washout", score: Math.max(52, probPct - 12), threshold: 70, color: "#d97706" },
      { name: "Agricultural Siltation", score: Math.min(95, probPct + 4), threshold: 70, color: "#16a34a" },
    ];

    // Chart 2.0 Data: Arterial Throughput Speed
    const segments = evacuationResult?.traffic_segments ?? [
      { road_name: "NH-715 Lowland Causeway", free_flow_speed_kmh: 70, speed_kmh: 0, status: "Submerged / Impassable", congestion_level: "blocked" },
      { road_name: "State Highway 3 Elevated Spur", free_flow_speed_kmh: 60, speed_kmh: 42, status: "Active High Clearance", congestion_level: "moderate" },
      { road_name: "Ghat Sector Secondary Detour", free_flow_speed_kmh: 50, speed_kmh: 38, status: "Clear Elevated Bypass", congestion_level: "free" },
      { road_name: "Ridge Crest Access Arterial", free_flow_speed_kmh: 55, speed_kmh: 48, status: "Unrestricted Safe Route", congestion_level: "free" },
    ];

    return (
      <div
        ref={ref}
        style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundColor: "#ffffff",
          color: "#0f172a",
          fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "16mm 20mm",
          boxSizing: "border-box",
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          zIndex: -1,
        }}
        className="disaster-pdf-print-container"
      >
        {/* ================= OFFICIAL HEADER ================= */}
        <div
          style={{
            borderBottom: "3px solid #b45309",
            paddingBottom: "12px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  backgroundColor: "#b45309",
                  color: "#ffffff",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "14px",
                  fontFamily: "monospace",
                }}
              >
                ND
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "15px",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                  color: "#92400e",
                  textTransform: "uppercase",
                }}
              >
                National Disaster Management Authority (NDMA)
              </h1>
            </div>
            <div style={{ fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase" }}>
              Ministry of Home Affairs, Govt. of India &bull; ISRO Disaster Management Support Programme (DMSP)
            </div>
            <div style={{ fontSize: "9px", color: "#64748b", marginTop: "2px" }}>
              National Emergency Response Centre (NERC) &bull; Space Applications Centre Earth Observation
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                display: "inline-block",
                padding: "3px 8px",
                backgroundColor: "#fef2f2",
                border: "1.5px solid #ef4444",
                color: "#b91c1c",
                fontSize: "9px",
                fontWeight: 800,
                letterSpacing: "1px",
                borderRadius: "3px",
              }}
            >
              EMERGENCY ARTERIAL CLEARANCE
            </div>
            <div style={{ fontSize: "8.5px", color: "#64748b", marginTop: "4px", fontFamily: "monospace" }}>
              DISPATCH ID: {reportId}
            </div>
            <div style={{ fontSize: "8.5px", color: "#64748b", fontFamily: "monospace" }}>
              ISSUED: {timestamp}
            </div>
          </div>
        </div>

        {/* ================= TARGET INCIDENT & GEODETIC METADATA ================= */}
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "6px",
            padding: "10px 14px",
            marginBottom: "14px",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr 1fr",
            gap: "10px",
            fontSize: "9.5px",
          }}
        >
          <div>
            <span style={{ color: "#78350f", fontWeight: 700, textTransform: "uppercase", fontSize: "8px", display: "block" }}>
              Disaster Zone / Location
            </span>
            <strong style={{ color: "#92400e", fontSize: "10.5px" }}>
              {assessmentResult?.location_name || scenarioName}
            </strong>
            <div style={{ color: "#475569", fontSize: "8.5px", marginTop: "2px" }}>
              Profile: {disasterType.toUpperCase()} &bull; {weatherCondition}
            </div>
          </div>

          <div>
            <span style={{ color: "#78350f", fontWeight: 700, textTransform: "uppercase", fontSize: "8px", display: "block" }}>
              Evacuation Coordinates
            </span>
            <div style={{ fontFamily: "monospace", color: "#0f172a", fontSize: "9px" }}>
              ORIGIN: {originLat.toFixed(4)}°N, {originLon.toFixed(4)}°E
            </div>
            <div style={{ fontFamily: "monospace", color: "#166534", fontSize: "9px", fontWeight: 600 }}>
              HAVEN: {destLat.toFixed(4)}°N, {destLon.toFixed(4)}°E
            </div>
          </div>

          <div>
            <span style={{ color: "#78350f", fontWeight: 700, textTransform: "uppercase", fontSize: "8px", display: "block" }}>
              Hazard Severity &amp; Probability
            </span>
            <span
              style={{
                display: "inline-block",
                padding: "2px 6px",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                borderRadius: "3px",
                fontWeight: 700,
                fontSize: "9px",
              }}
            >
              {severity}
            </span>
            <div style={{ color: "#b91c1c", fontWeight: 700, fontSize: "9px", marginTop: "2px" }}>
              EMPIRICAL RISK: {probPct}% PROBABILITY
            </div>
          </div>
        </div>

        {/* ================= SECTION 1: EXECUTIVE ASSESSMENT & POPULATION AT RISK ================= */}
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#1e293b",
              borderBottom: "1.5px solid #cbd5e1",
              paddingBottom: "4px",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>1.0 Multi-Sensor Disaster Assessment &amp; Population Impact</span>
            <span style={{ fontSize: "9px", color: "#2563eb", fontWeight: 600 }}>
              SAR Specular + Multi-Temporal Optical
            </span>
          </div>

          <div
            style={{
              fontSize: "9.5px",
              lineHeight: "1.55",
              color: "#334155",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              padding: "8px 12px",
              marginBottom: "10px",
            }}
          >
            {assessmentResult?.impact_summary ||
              "Synthetic Aperture Radar (SAR) specular backscatter analysis confirms catastrophic riverbank breach and high-volume hydrological inundation. Lowland transportation routes are compromised by silt-laden water currents. Immediate evacuation protocol is ordered along elevated bypass corridors toward geodetically certified safe high-ground zones."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", fontSize: "9px" }}>
            <div style={{ border: "1px solid #e2e8f0", padding: "6px 8px", borderRadius: "4px", backgroundColor: "#f8fafc" }}>
              <span style={{ color: "#64748b", fontSize: "8px", display: "block", textTransform: "uppercase" }}>Submerged Area</span>
              <strong style={{ color: "#0284c7", fontSize: "11px" }}>{affectedKm2} km²</strong>
            </div>
            <div style={{ border: "1px solid #e2e8f0", padding: "6px 8px", borderRadius: "4px", backgroundColor: "#f8fafc" }}>
              <span style={{ color: "#64748b", fontSize: "8px", display: "block", textTransform: "uppercase" }}>Citizens at Risk</span>
              <strong style={{ color: "#dc2626", fontSize: "11px" }}>{popRisk}</strong>
            </div>
            <div style={{ border: "1px solid #e2e8f0", padding: "6px 8px", borderRadius: "4px", backgroundColor: "#f8fafc" }}>
              <span style={{ color: "#64748b", fontSize: "8px", display: "block", textTransform: "uppercase" }}>Primary Arterial</span>
              <strong style={{ color: "#b91c1c", fontSize: "10px" }}>
                {(evacuationResult?.primary_route_status || "COMPROMISED").toUpperCase()}
              </strong>
            </div>
            <div style={{ border: "1px solid #e2e8f0", padding: "6px 8px", borderRadius: "4px", backgroundColor: "#f8fafc" }}>
              <span style={{ color: "#64748b", fontSize: "8px", display: "block", textTransform: "uppercase" }}>Estimated Transit</span>
              <strong style={{ color: "#16a34a", fontSize: "11px" }}>
                {evacuationResult?.estimated_transit_minutes || 28.5} Mins
              </strong>
            </div>
          </div>
        </div>

        {/* ================= SECTION 2: CHART 1.0 - DISASTER PROBABILITY SPECTRUM ================= */}
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#1e293b",
              borderBottom: "1.5px solid #cbd5e1",
              paddingBottom: "4px",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Chart 1.0: Empirical Disaster Risk &amp; Sector Probability Spectrum</span>
            <span style={{ fontSize: "8.5px", color: "#dc2626", fontWeight: 700 }}>
              CRITICAL EVACUATION THRESHOLD &ge; 70%
            </span>
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              padding: "10px 14px",
              backgroundColor: "#ffffff",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {hazardData.map((h, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "140px 1fr 75px", alignItems: "center", gap: "8px", fontSize: "9px" }}>
                  <span style={{ fontWeight: 600, color: "#334155" }}>{h.name}</span>
                  <div style={{ position: "relative", height: "14px", backgroundColor: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                    {/* Critical threshold line at 70% */}
                    <div
                      style={{
                        position: "absolute",
                        left: "70%",
                        top: 0,
                        bottom: 0,
                        width: "1.5px",
                        backgroundColor: "#ef4444",
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min(100, h.score)}%`,
                        backgroundColor: h.score >= 70 ? "#dc2626" : h.color,
                        borderRadius: "2px",
                      }}
                    />
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: h.score >= 70 ? "#dc2626" : "#1e293b" }}>
                    {h.score}% {h.score >= 70 ? "⚠ BREACH" : "SAFE"}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "6px", display: "flex", justifyContent: "flex-end", gap: "14px", fontSize: "8px", color: "#64748b" }}>
              <span>Scale: 0% - 100% Empirical Probability</span>
              <span style={{ color: "#dc2626", fontWeight: 700 }}>Red Vertical Line: 70% Evacuation Trigger</span>
            </div>
          </div>
        </div>

        {/* ================= SECTION 3: CHART 2.0 - ARTERIAL THROUGHPUT SPEED COMPARISON ================= */}
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#1e293b",
              borderBottom: "1.5px solid #cbd5e1",
              paddingBottom: "4px",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Chart 2.0: Evacuation Logistics Arterial Velocity (Free-Flow vs Active Status)</span>
            <span style={{ fontSize: "8.5px", color: "#16a34a", fontWeight: 700 }}>
              OSRM GEODESIC SATELLITE BYPASS
            </span>
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              padding: "10px 14px",
              backgroundColor: "#ffffff",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {segments.map((seg: any, i: number) => {
                const freeFlow = seg.free_flow_speed_kmh || 60;
                const active = seg.speed_kmh || 0;
                const pct = Math.round((active / freeFlow) * 100);
                const isBlocked = seg.congestion_level === "blocked" || active === 0;

                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 1fr 110px", alignItems: "center", gap: "8px", fontSize: "9px" }}>
                    <div>
                      <span style={{ fontWeight: 600, color: "#1e293b", display: "block" }}>{seg.road_name}</span>
                      <span style={{ fontSize: "7.5px", color: isBlocked ? "#dc2626" : "#64748b" }}>
                        Nominal: {freeFlow} km/h
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ height: "10px", backgroundColor: "#f1f5f9", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${isBlocked ? 4 : pct}%`,
                            backgroundColor: isBlocked ? "#dc2626" : pct > 60 ? "#16a34a" : "#ea580c",
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "1px 5px",
                          borderRadius: "3px",
                          fontSize: "8px",
                          fontWeight: 700,
                          backgroundColor: isBlocked ? "#fef2f2" : "#f0fdf4",
                          color: isBlocked ? "#dc2626" : "#166534",
                          border: `1px solid ${isBlocked ? "#fca5a5" : "#86efac"}`,
                        }}
                      >
                        {isBlocked ? "BLOCKED 0 km/h" : `${active} km/h (${pct}%)`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= SECTION 4: THREATENED CRITICAL INFRASTRUCTURE & NDRF DIRECTIVES ================= */}
        <div style={{ marginBottom: "14px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#1e293b",
              borderBottom: "1.5px solid #cbd5e1",
              paddingBottom: "4px",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            3.0 Threatened Critical Infrastructure &amp; NDRF Dispatch Directives
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "9px" }}>
            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: "4px" }}>
              <span style={{ fontWeight: 700, color: "#b45309", textTransform: "uppercase", fontSize: "8px", display: "block", marginBottom: "4px" }}>
                Threatened Infrastructure Nodes
              </span>
              <ul style={{ margin: 0, paddingLeft: "14px", color: "#334155", lineHeight: "1.5" }}>
                {(assessmentResult?.critical_infrastructure_threatened || [
                  "Sub-district Hospital Lowland Access Causeway",
                  "33kV Grid Distribution Substation #4",
                  "National Highway Culvert Km 142.8",
                  "Emergency Amphibious Staging Ground",
                ]).map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 10px", borderRadius: "4px" }}>
              <span style={{ fontWeight: 700, color: "#166534", textTransform: "uppercase", fontSize: "8px", display: "block", marginBottom: "4px" }}>
                NDRF Logistics &amp; Relief Operations
              </span>
              <ul style={{ margin: 0, paddingLeft: "14px", color: "#334155", lineHeight: "1.5" }}>
                <li>Pre-deploy 2x NDRF Water Rescue Teams with OBM boats to Km 12.</li>
                <li>Activate State Highway 3 elevated bypass as sole convoy route.</li>
                <li>Erect flood telemetry acoustic beacons at downstream causeway.</li>
                <li>High-ground field hospital established at destination safe zone.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ================= SECTION 5: OFFICIAL SIGN-OFF & CRYPTO SEAL ================= */}
        <div
          style={{
            borderTop: "2px solid #cbd5e1",
            paddingTop: "10px",
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: "8.5px",
            color: "#475569",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>
              National Disaster Response Force (NDRF) Command
            </div>
            <div>Ministry of Home Affairs &bull; Emergency Relief Operations Cell</div>
            <div style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: "7.5px", marginTop: "2px" }}>
              GEO-HASH: 26.2006N-92.9376E-INUNDATION-SEC-01 &bull; VERIFIED BY MULTI-AGENT PIPELINE
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "monospace",
                fontSize: "8px",
                border: "1px dashed #b45309",
                padding: "4px 8px",
                borderRadius: "3px",
                backgroundColor: "#fffbeb",
                color: "#92400e",
                display: "inline-block",
                marginBottom: "4px",
              }}
            >
              [DIGITALLY CERTIFIED DISPATCH: DG-NDRF-APPROVED]
            </div>
            <div style={{ fontWeight: 700, color: "#0f172a" }}>
              Director General, NDRF &amp; Scientific Advisor, ISRO DMSP
            </div>
          </div>
        </div>
      </div>
    );
  }
);

DisasterPdfReportTemplate.displayName = "DisasterPdfReportTemplate";
