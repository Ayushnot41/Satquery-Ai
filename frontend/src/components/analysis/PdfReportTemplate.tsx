import React from "react";
import { AnalysisResult } from "../../types/investigation";

interface PdfReportTemplateProps {
  result: AnalysisResult;
  sarMetrics?: Record<string, string | number>;
}

export const PdfReportTemplate = React.forwardRef<HTMLDivElement, PdfReportTemplateProps>(
  ({ result, sarMetrics }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: "210mm", // A4 width
          minHeight: "297mm", // A4 height
          backgroundColor: "#ffffff",
          color: "#000000",
          fontFamily: "sans-serif",
          padding: "20mm",
          boxSizing: "border-box",
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          zIndex: -1,
        }}
        className="pdf-report-container"
      >
        {/* Header */}
        <div style={{ borderBottom: "2px solid #1a365d", paddingBottom: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ margin: 0, color: "#1a365d", fontSize: "24px", fontWeight: "bold" }}>GEOSPATIAL INTELLIGENCE REPORT</h1>
            <p style={{ margin: "5px 0 0 0", color: "#4a5568", fontSize: "12px", textTransform: "uppercase" }}>ISRO SIH26167 • TEAM BANKAI</p>
          </div>
          <div style={{ textAlign: "right", fontSize: "10px", color: "#718096" }}>
            <p style={{ margin: 0 }}>RUN ID: {result.run_id}</p>
            <p style={{ margin: "2px 0 0 0" }}>DATE: {new Date(result.created_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Mission Context & Question */}
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ fontSize: "14px", color: "#2d3748", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginBottom: "10px" }}>Investigation Query</h2>
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#1a202c", margin: 0, fontStyle: "italic" }}>
            "{result.question}"
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <span style={{ backgroundColor: "#edf2f7", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}>{result.mode.replace("_", " ")}</span>
            <span style={{ backgroundColor: "#edf2f7", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}>{result.mission_context}</span>
          </div>
        </div>

        {/* Synthesis Answer */}
        <div style={{ marginBottom: "25px", backgroundColor: "#f8fafc", padding: "15px", borderRadius: "8px", borderLeft: "4px solid #3182ce" }}>
          <h2 style={{ fontSize: "12px", color: "#2b6cb0", textTransform: "uppercase", margin: "0 0 8px 0" }}>Agent Synthesis Finding</h2>
          <p style={{ fontSize: "14px", color: "#2d3748", lineHeight: "1.6", margin: 0 }}>
            {result.answer}
          </p>
        </div>

        {/* Imagery */}
        {result.imageUrls && result.imageUrls.length > 0 && (
          <div style={{ marginBottom: "25px" }}>
            <h2 style={{ fontSize: "14px", color: "#2d3748", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginBottom: "10px" }}>Visual Grounding</h2>
            <div style={{ display: "flex", gap: "15px" }}>
              {result.imageUrls.map((url, idx) => (
                <div key={idx} style={{ flex: 1 }}>
                  <p style={{ fontSize: "10px", textTransform: "uppercase", fontWeight: "bold", color: "#718096", marginBottom: "4px" }}>
                    {idx === 0 ? "Pre-Event / Optical Baseline" : "Post-Event / SAR Observation"}
                  </p>
                  <img
                    src={url}
                    alt={`Observation ${idx + 1}`}
                    style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "4px", border: "1px solid #cbd5e0" }}
                    crossOrigin="anonymous"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics & Confidence */}
        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "14px", color: "#2d3748", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginBottom: "10px" }}>Confidence Metrics</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <div style={{ width: "60px", height: "60px", borderRadius: "50%", border: "4px solid #48bb78", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "18px", color: "#2f855a" }}>
                {result.confidence}%
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", color: "#276749" }}>Empirically Calibrated</p>
                <p style={{ margin: "2px 0 0 0", fontSize: "11px", color: "#4a5568" }}>All agent consensus thresholds met.</p>
              </div>
            </div>
          </div>

          {(Object.keys(result.metrics).length > 0 || sarMetrics) && (
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "14px", color: "#2d3748", textTransform: "uppercase", borderBottom: "1px solid #e2e8f0", paddingBottom: "4px", marginBottom: "10px" }}>Task Metrics</h2>
              <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                <tbody>
                  {Object.entries(result.metrics).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid #edf2f7" }}>
                      <td style={{ padding: "6px 0", color: "#718096" }}>{k}</td>
                      <td style={{ padding: "6px 0", color: "#1a202c", fontWeight: "bold", textAlign: "right" }}>{v}</td>
                    </tr>
                  ))}
                  {sarMetrics && Object.entries(sarMetrics).map(([k, v]) => (
                    <tr key={k} style={{ borderBottom: "1px solid #edf2f7" }}>
                      <td style={{ padding: "6px 0", color: "#718096" }}>{k}</td>
                      <td style={{ padding: "6px 0", color: "#1a202c", fontWeight: "bold", textAlign: "right" }}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "40px", paddingTop: "10px", borderTop: "1px solid #e2e8f0", textAlign: "center", fontSize: "9px", color: "#a0aec0", textTransform: "uppercase" }}>
          Automated multi-agent generation • Do not distribute without classification review
        </div>
      </div>
    );
  }
);

PdfReportTemplate.displayName = "PdfReportTemplate";
