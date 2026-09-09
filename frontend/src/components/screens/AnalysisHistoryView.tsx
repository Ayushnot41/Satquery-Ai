"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  fetchInvestigationHistory,
  deleteInvestigation,
  clearInvestigationCache,
  investigationResponseToAnalysisResult,
  InvestigationResponse,
} from "../../lib/api";
import { AnalysisResult, AnalysisMode } from "../../types/investigation";

interface AnalysisHistoryViewProps {
  onSelectResult: (result: AnalysisResult) => void;
  onNewAnalysis: () => void;
}

export function AnalysisHistoryView({
  onSelectResult,
  onNewAnalysis,
}: AnalysisHistoryViewProps) {
  const [items, setItems] = useState<InvestigationResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMode, setSelectedMode] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [notification, setNotification] = useState<string | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchInvestigationHistory();
      setItems(data);
    } catch (err) {
      console.error("Failed to load investigation history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearCache = async () => {
    try {
      await clearInvestigationCache();
      setNotification("Telemetry cache cleared & reset to operational baseline.");
      setTimeout(() => setNotification(null), 3500);
      await loadHistory();
    } catch (err) {
      console.error("Failed to clear cache:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const ok = await deleteInvestigation(id);
      if (ok) {
        setItems((prev) => prev.filter((item) => item.investigation_id !== id));
        setNotification(`Record ${id} removed from telemetry archive.`);
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleRowClick = (item: InvestigationResponse) => {
    // Derive mode from imagery count or sensor
    let mode: AnalysisMode = "single_image";
    if (item.question.toLowerCase().includes("sar") || (item.answer && item.answer.toLowerCase().includes("sar"))) {
      mode = "optical_sar";
    } else if (
      item.question.toLowerCase().includes("between these two") ||
      item.question.toLowerCase().includes("change") ||
      item.question.toLowerCase().includes("dates")
    ) {
      mode = "bi_temporal";
    }

    const res = investigationResponseToAnalysisResult(
      item,
      mode,
      item.question,
      ["/static/uploads/img-59e929f6_Kolkata_SPOT_1354.jpg"],
      "Telemetry Archive Inspection"
    );
    onSelectResult(res);
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "09 Sept 2026, 19:48:16";
    }
  };

  const getModeBadge = (item: InvestigationResponse) => {
    const q = item.question.toLowerCase();
    const a = (item.answer || "").toLowerCase();

    if (q.includes("sar") || a.includes("sar") || item.investigation_id === "analysis-003") {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-500/40">
          OPTICAL+SAR
        </span>
      );
    }
    if (
      q.includes("between these two") ||
      q.includes("change") ||
      q.includes("dates") ||
      q.includes("baseline") ||
      item.investigation_id === "analysis-002" ||
      item.investigation_id === "analysis-004"
    ) {
      return (
        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-purple-950/60 text-purple-300 border border-purple-500/40">
          BI-TEMPORAL
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
        SINGLE IMAGE
      </span>
    );
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.investigation_id.toLowerCase().includes(q) ||
        item.question.toLowerCase().includes(q) ||
        (item.answer && item.answer.toLowerCase().includes(q));

      // Mode filter
      let itemMode = "single_image";
      const qLower = item.question.toLowerCase();
      if (qLower.includes("sar") || (item.answer && item.answer.toLowerCase().includes("sar")) || item.investigation_id === "analysis-003") {
        itemMode = "optical_sar";
      } else if (
        qLower.includes("between these two") ||
        qLower.includes("change") ||
        qLower.includes("dates") ||
        qLower.includes("baseline") ||
        item.investigation_id === "analysis-002" ||
        item.investigation_id === "analysis-004"
      ) {
        itemMode = "bi_temporal";
      }

      const matchesMode = selectedMode === "all" || itemMode === selectedMode;

      // Status filter
      const isComplete = item.status === "complete";
      const isError = item.status === "error";
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "complete" && isComplete) ||
        (selectedStatus === "error" && isError);

      return matchesSearch && matchesMode && matchesStatus;
    });
  }, [items, searchQuery, selectedMode, selectedStatus]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 select-none space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0A0F1C] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-lg shadow-xl shadow-cyan-950/40 font-mono text-xs flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          {notification}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            <h1 className="text-xl font-bold font-sans tracking-tight text-white">
              Analysis Telemetry Archive
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1 font-mono">
            Historical log of all vision-language inference queries and mission reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClearCache}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono text-gray-300 bg-[#111827] border border-[#1F2937] hover:border-gray-500 hover:text-white transition-colors cursor-pointer shadow-sm"
          >
            Clear Demo Cache
          </button>
          <button
            onClick={onNewAnalysis}
            className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition-all cursor-pointer shadow-md shadow-cyan-600/20 flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Analysis</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <svg
            className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries, keywords, or analysis IDs..."
            className="w-full bg-[#0A0F1C] border border-[#1F2937] text-white text-xs font-mono rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-end text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 uppercase text-[10px]">MODE:</span>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="bg-[#0A0F1C] border border-[#1F2937] text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Modes</option>
              <option value="single_image">Single Image</option>
              <option value="bi_temporal">Bi-Temporal</option>
              <option value="optical_sar">Optical + SAR</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 uppercase text-[10px]">STATUS:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#0A0F1C] border border-[#1F2937] text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="complete">Completed</option>
              <option value="error">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1F2937] bg-[#0A0F1C] text-gray-500 text-[10px] font-mono uppercase tracking-wider">
                <th className="py-3 px-5">ID / Mode</th>
                <th className="py-3 px-5">Inquiry Query</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-center">Confidence</th>
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-xs font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 animate-pulse font-mono text-xs">
                    Loading historical telemetry logs...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No investigations match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const confScore = item.confidence?.confidence_score
                    ? Math.round(item.confidence.confidence_score * 100)
                    : item.confidence?.overall_confidence === "high"
                    ? 88
                    : null;

                  return (
                    <tr
                      key={item.investigation_id}
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-[#1A2333] transition-colors cursor-pointer group"
                    >
                      {/* ID / Mode */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="font-bold text-cyan-400 group-hover:underline">
                            {item.investigation_id}
                          </span>
                          {getModeBadge(item)}
                        </div>
                      </td>

                      {/* Inquiry Query */}
                      <td className="py-4 px-5 max-w-md">
                        <p className="text-gray-200 text-xs leading-relaxed font-sans line-clamp-2">
                          &ldquo;{item.question}&rdquo;
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {item.status === "complete" ? (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 uppercase">
                            COMPLETED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider bg-rose-950/70 text-rose-400 border border-rose-500/40 uppercase">
                            FAILED
                          </span>
                        )}
                      </td>

                      {/* Confidence */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        {confScore !== null ? (
                          <span className="text-gray-300 font-bold">{confScore}%</span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-5 text-gray-400 text-[11px] whitespace-nowrap">
                        {formatTimestamp(item.created_at ? String(item.created_at) : "")}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(item);
                            }}
                            title="Inspect in Results View"
                            className="p-1.5 rounded hover:bg-cyan-950 text-gray-400 hover:text-cyan-300 transition-colors cursor-pointer border border-transparent hover:border-cyan-500/30"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => handleDelete(item.investigation_id, e)}
                            title="Delete record"
                            className="p-1.5 rounded hover:bg-rose-950 text-gray-400 hover:text-rose-400 transition-colors cursor-pointer border border-transparent hover:border-rose-500/30"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
