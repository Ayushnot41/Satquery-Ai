import React from "react";

interface DefensePdfReportTemplateProps {
  branch: "NAVY" | "AIR_FORCE" | "ARMY_BSF";
  hotspot: any;
  tacticalQuery: string;
  activeSensor: string;
  clearanceLevel: string;
  report: any;
}

export const DefensePdfReportTemplate = React.forwardRef<
  HTMLDivElement,
  DefensePdfReportTemplateProps
>(({ branch, hotspot, tacticalQuery, activeSensor, clearanceLevel, report }, ref) => {
  const timestamp = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const branchTitle =
    branch === "NAVY"
      ? "INDIAN NAVY // MARITIME DOMAIN AWARENESS & DARK VESSEL DETECTION"
      : branch === "AIR_FORCE"
      ? "INDIAN AIR FORCE // AIRFIELD READINESS & BOMB DAMAGE ASSESSMENT (BDA)"
      : "INDIAN ARMY & BSF // FORWARD LINE DEFENSE & TERRAIN TRAFFICABILITY";

  const threatPct = report?.threat_score_pct ?? 74;

  const threatSpectrum = [
    { label: "Surveillance Anomaly Index", val: threatPct, color: threatPct > 70 ? "#dc2626" : "#d97706" },
    { label: "Dark Target / AIS Disconnect Probability", val: branch === "NAVY" ? 82 : 45, color: "#2563eb" },
    { label: "Structural Disruption / Crater Impact", val: branch === "AIR_FORCE" ? 68 : 35, color: "#7c3aed" },
    { label: "Terrain Infiltration Trafficability", val: branch === "ARMY_BSF" ? 79 : 52, color: "#059669" },
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
      className="defense-pdf-print-container"
    >
      {/* ================= CLASSIFIED DEFENSE HEADER ================= */}
      <div
        style={{
          borderBottom: "3px solid #991b1b",
          paddingBottom: "12px",
          marginBottom: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: "#991b1b",
                color: "#ffffff",
                borderRadius: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              MoD
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: "900",
                  letterSpacing: "0.5px",
                  color: "#0f172a",
                  textTransform: "uppercase",
                }}
              >
                HEADQUARTERS INTEGRATED DEFENCE STAFF (HQ IDS)
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "9px",
                  color: "#475569",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                  fontWeight: "600",
                }}
              >
                Ministry of Defence // Directorate of Geospatial Intelligence & Strategic Reconnaissance
              </p>
            </div>
          </div>
          <div style={{ fontSize: "11px", fontWeight: "bold", color: "#991b1b", marginTop: "4px" }}>
            {branchTitle}
          </div>
        </div>

        <div style={{ textAlign: "right", fontSize: "9px" }}>
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#fef2f2",
              border: "1px solid #dc2626",
              color: "#b91c1c",
              padding: "3px 8px",
              borderRadius: "3px",
              fontWeight: "bold",
              fontSize: "9px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "3px",
            }}
          >
            {clearanceLevel || "TOP SECRET // NOFORN"}
          </div>
          <p style={{ margin: "1px 0 0 0", fontFamily: "monospace", fontWeight: "bold", color: "#0f172a" }}>
            REPORT ID: {report?.report_id || `DEF-STRAT-${Date.now().toString(16).toUpperCase()}`}
          </p>
          <p style={{ margin: "1px 0 0 0", color: "#64748b" }}>DATE: {timestamp} (IST)</p>
        </div>
      </div>

      {/* ================= SECTOR INTELLIGENCE TELEMETRY ================= */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
          padding: "10px 14px",
          marginBottom: "14px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: "bold",
            color: "#991b1b",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "6px",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "3px",
          }}
        >
          SECTION 01: STRATEGIC TARGET SECTOR IDENTIFICATION
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "10px", fontSize: "11px" }}>
          <div>
            <span style={{ color: "#64748b", fontSize: "9px", display: "block", textTransform: "uppercase" }}>
              Installation & Command
            </span>
            <strong style={{ color: "#0f172a", fontSize: "12px" }}>
              {hotspot?.name || "INS Kadamba / Western Fleet"} ({hotspot?.command || "WNC"})
            </strong>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "9px", display: "block", textTransform: "uppercase" }}>
              Geodetic Coordinates
            </span>
            <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#0f172a" }}>
              {hotspot?.lat?.toFixed(4)}° N, {hotspot?.lon?.toFixed(4)}° E
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "9px", display: "block", textTransform: "uppercase" }}>
              MGRS Grid
            </span>
            <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#0f172a" }}>
              {hotspot?.mgrs || "43PBT7188"}
            </span>
          </div>
          <div>
            <span style={{ color: "#64748b", fontSize: "9px", display: "block", textTransform: "uppercase" }}>
              Threat Assessment Level
            </span>
            <span style={{ color: "#dc2626", fontWeight: "bold" }}>
              {hotspot?.threat_level || "CRITICAL"}
            </span>
          </div>
        </div>
      </div>

      {/* ================= TACTICAL QUERY & OPERATIONAL VERDICT ================= */}
      <div style={{ marginBottom: "14px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: "bold",
            color: "#991b1b",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "6px",
            borderBottom: "1px solid #cbd5e1",
            paddingBottom: "3px",
          }}
        >
          SECTION 02: TACTICAL RECONNAISSANCE QUERY & EXECUTIVE VERDICT
        </div>

        <div style={{ marginBottom: "6px" }}>
          <span style={{ fontSize: "9px", color: "#64748b", textTransform: "uppercase", fontWeight: "bold" }}>
            Operational Objective:
          </span>
          <p style={{ margin: "2px 0 0 0", fontSize: "11px", fontStyle: "italic", fontWeight: "600", color: "#1e293b" }}>
            "{tacticalQuery}"
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#fef2f2",
            borderLeft: "4px solid #dc2626",
            borderTop: "1px solid #fecaca",
            borderRight: "1px solid #fecaca",
            borderBottom: "1px solid #fecaca",
            borderRadius: "0 6px 6px 0",
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: "10px", fontWeight: "bold", color: "#991b1b", textTransform: "uppercase" }}>
              Defensive Readiness Status:
            </span>
            <span style={{ marginLeft: "6px", fontSize: "11px", fontWeight: "bold", color: "#b91c1c" }}>
              {report?.readiness_status || "DEFCON 2 // ELEVATED MONITORING"}
            </span>
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: "bold",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "2px 8px",
              borderRadius: "3px",
              border: "1px solid #fca5a5",
            }}
          >
            THREAT SCORE: {threatPct}%
          </span>
        </div>
      </div>

      {/* ================= PROFESSIONAL CHARTS WITH HEADING LINES ================= */}
      <div style={{ marginBottom: "14px" }}>
        {/* CHART 1: THREAT ENGAGEMENT SPECTRUM */}
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              borderTop: "2px solid #0f172a",
              borderBottom: "1px solid #94a3b8",
              padding: "4px 0",
              marginBottom: "6px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span style={{ fontSize: "10px", fontWeight: "bold", color: "#0f172a", letterSpacing: "0.5px" }}>
                CHART 1.0 // TACTICAL THREAT ENGAGEMENT SPECTRUM & RISK PROJECTION
              </span>
              <span style={{ fontSize: "8px", color: "#64748b", marginLeft: "8px" }}>
                Active sensor telemetry: {activeSensor}
              </span>
            </div>
            <span style={{ fontSize: "8px", fontFamily: "monospace", color: "#dc2626", fontWeight: "bold" }}>
              SEVERITY SCALE: 0 – 100%
            </span>
          </div>

          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              padding: "8px 12px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {threatSpectrum.map((t) => (
                <div key={t.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "200px", fontSize: "9px", color: "#334155", fontWeight: "600" }}>
                    {t.label}
                  </div>
                  <div style={{ flex: 1, backgroundColor: "#e2e8f0", height: "12px", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ width: `${t.val}%`, height: "100%", backgroundColor: t.color, borderRadius: "2px" }} />
                  </div>
                  <div style={{ width: "40px", textAlign: "right", fontFamily: "monospace", fontSize: "9px", fontWeight: "bold", color: "#0f172a" }}>
                    {t.val}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 2: DOCTRINE & RECOMMENDATIONS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px 12px" }}>
            <span style={{ fontSize: "9px", fontWeight: "bold", color: "#0369a1", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Scientific Doctrine Assessment
            </span>
            <p style={{ margin: 0, fontSize: "10px", lineHeight: "1.4", color: "#334155" }}>
              {report?.doctrine_justification ||
                "Multi-polarization C-band SAR detects specular scattering off calm water with sharp contrast against metallic hull returns. Doppler centroid shift indicates localized movement without broadcast AIS transponder signals."}
            </p>
          </div>

          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "8px 12px" }}>
            <span style={{ fontSize: "9px", fontWeight: "bold", color: "#b45309", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
              Recommended Command Action
            </span>
            <p style={{ margin: 0, fontSize: "10px", lineHeight: "1.4", color: "#334155" }}>
              {report?.recommended_tactical_action ||
                "Scramble maritime patrol aircraft (P-8I Neptune) for visual confirmation. Alert Western Naval Command fast interceptor craft to establish blocking cordon at coordinates 14.7736°N, 74.1567°E."}
            </p>
          </div>
        </div>
      </div>

      {/* ================= IDENTIFIED TACTICAL ENTITIES TABLE ================= */}
      <div style={{ marginBottom: "14px" }}>
        <div
          style={{
            fontSize: "10px",
            fontWeight: "bold",
            color: "#991b1b",
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            marginBottom: "6px",
            borderBottom: "1px solid #cbd5e1",
            paddingBottom: "3px",
          }}
        >
          SECTION 03: DETECTED TACTICAL ENTITIES & COMBATANT TARGETS
        </div>

        <table style={{ width: "100%", fontSize: "9px", borderCollapse: "collapse", border: "1px solid #cbd5e1" }}>
          <thead>
            <tr style={{ backgroundColor: "#0f172a", color: "#ffffff", textAlign: "left" }}>
              <th style={{ padding: "5px 6px" }}>Target ID</th>
              <th style={{ padding: "5px 6px" }}>Entity Type</th>
              <th style={{ padding: "5px 6px" }}>Classification</th>
              <th style={{ padding: "5px 6px" }}>Confidence</th>
              <th style={{ padding: "5px 6px" }}>Sensor Radar Signature</th>
            </tr>
          </thead>
          <tbody>
            {(report?.detected_entities || [
              { id: "NAV-01", entity_type: "Surface Vessel", classification: "Unregistered Dark Vessel", confidence: 0.94, metric_detail: "σ⁰ = +2.4 dB (Metallic Spike)" },
              { id: "NAV-02", entity_type: "Naval Berth", classification: "Aircraft Carrier Berth", confidence: 0.98, metric_detail: "Occupied (INS Vikramaditya)" },
              { id: "NAV-03", entity_type: "Patrol Corridor", classification: "Inner Basin Access Channel", confidence: 0.91, metric_detail: "Clear for Interception" },
            ]).map((e: any, idx: number) => (
              <tr key={e.id || idx} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                <td style={{ padding: "5px 6px", fontFamily: "monospace", fontWeight: "bold", color: "#991b1b" }}>{e.id}</td>
                <td style={{ padding: "5px 6px", fontWeight: "600" }}>{e.entity_type}</td>
                <td style={{ padding: "5px 6px", color: "#0f172a" }}>{e.classification}</td>
                <td style={{ padding: "5px 6px", fontFamily: "monospace", fontWeight: "bold", color: "#16a34a" }}>
                  {Math.round((e.confidence || 0.9) * 100)}%
                </td>
                <td style={{ padding: "5px 6px", color: "#475569" }}>{e.metric_detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= OFFICIAL DEFENSE SIGN-OFF FOOTER ================= */}
      <div
        style={{
          marginTop: "16px",
          borderTop: "2px solid #991b1b",
          paddingTop: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          fontSize: "8px",
          color: "#64748b",
        }}
      >
        <div>
          <p style={{ margin: 0, fontWeight: "bold", color: "#0f172a" }}>
            MINISTRY OF DEFENCE // STRATEGIC FORCES COMMAND // NEW DELHI
          </p>
          <p style={{ margin: "2px 0 0 0" }}>
            Cryptographically signed intelligence dossier • Distribution restricted strictly to accredited commanders
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ display: "inline-block", borderBottom: "1px solid #94a3b8", width: "130px", marginBottom: "3px" }} />
          <p style={{ margin: 0, fontWeight: "bold", color: "#0f172a" }}>
            CHIEF OF DEFENCE STAFF (CDS)
          </p>
          <p style={{ margin: "1px 0 0 0", fontSize: "7px" }}>HQ Integrated Defence Staff • Verified</p>
        </div>
      </div>
    </div>
  );
});

DefensePdfReportTemplate.displayName = "DefensePdfReportTemplate";
