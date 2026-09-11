"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  GitCompare,
  Radar,
  UploadCloud,
  FileImage,
  X,
  Sparkles,
  ShieldAlert,
  Play,
  AlertTriangle,
  Mic,
  ArrowUp,
  Globe,
  CheckCircle2,
  Droplets,
  Activity,
  Flame,
  Wind,
  Mountain,
  LayoutDashboard,
  PlusCircle,
  History,
  User,
  BarChart3,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Radio,
  ExternalLink,
} from "lucide-react";

export type AnalysisMode = "single_image" | "bi_temporal" | "optical_sar";
export type MissionContext = "general_change" | "disaster_assessment";
export type DisasterType = "flood" | "earthquake" | "wildfire" | "cyclone" | "landslide";

export interface UploadSlotState {
  file?: File;
  name: string;
  size: string;
  previewUrl: string;
  isDemo?: boolean;
}

export interface NewAnalysisState {
  mode: AnalysisMode;
  missionContext: MissionContext;
  disasterType?: DisasterType;
  slot1?: UploadSlotState;
  slot2?: UploadSlotState;
  question: string;
}

interface ModeConfig {
  id: AnalysisMode;
  title: string;
  badge: string;
  tag: string;
  description: string;
  accent: "cyan" | "purple" | "amber";
  accentHex: string;
  borderActive: string;
  bgActive: string;
  glowClass: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  tileCountLabel: string;
  requiredSlots: 1 | 2;
  slot1: {
    label: string;
    tag: string;
    helper: string;
  };
  slot2?: {
    label: string;
    tag: string;
    helper: string;
  };
  questionTitle: string;
  questionInstruction: string;
  questionPlaceholder: string;
  suggestedQuestions: string[];
  demoPreset: {
    question: string;
    slot1: { name: string; size: string; previewUrl: string };
    slot2?: { name: string; size: string; previewUrl: string };
    missionContext?: MissionContext;
    disasterType?: DisasterType;
  };
}

export const MODE_CONFIG: Record<AnalysisMode, ModeConfig> = {
  single_image: {
    id: "single_image",
    title: "Single Image Analysis",
    badge: "VQA & SPATIAL GROUNDING",
    tag: "SINGLE SCENE INSPECTION",
    description:
      "Query an individual optical, multispectral, or SAR satellite scene with natural language. Perform visual Q&A, scene captioning, and bounding-box spatial target grounding.",
    accent: "cyan",
    accentHex: "#06b6d4",
    borderActive: "border-cyan-500",
    bgActive: "bg-cyan-950/20",
    glowClass: "shadow-[0_0_20px_rgba(6,182,212,0.25)]",
    icon: Layers,
    tags: ["VISUAL Q&A", "IMAGE CAPTIONING", "OBJECT GROUNDING"],
    tileCountLabel: "UPLOAD IMAGERY (1 TILE)",
    requiredSlots: 1,
    slot1: {
      label: "Single Satellite Scene",
      tag: "OPTICAL / SAR PAYLOAD",
      helper: "High-resolution optical scene or single SAR amplitude slice (EPSG geospatial or PNG/JPG)",
    },
    questionTitle: "Single Image Natural-Language Inquiry",
    questionInstruction:
      "Specify your target features, object grounding queries, or spatial taxonomy inquiries for the AI council.",
    questionPlaceholder:
      "Describe what you want to analyze... (e.g., 'Locate all naval vessels docked in the harbor and determine water turbidity', 'Count industrial storage tanks in zone B')",
    suggestedQuestions: [
      "What land cover types are visible in this image?",
      "Locate and count all buildings and built structures.",
      "Identify any water bodies or reservoirs in the scene.",
      "Provide a comprehensive scene caption and description.",
      "Detect agricultural parcel boundaries and crop health indicators.",
    ],
    demoPreset: {
      question: "Locate and highlight all industrial storage reservoirs and estimate dock surface activity.",
      slot1: {
        name: "CARTOSAT-3_PAN_BAND1_VIZAG.tif",
        size: "48.2 MB",
        previewUrl:
          "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=800&q=80",
      },
    },
  },
  bi_temporal: {
    id: "bi_temporal",
    title: "Bi-Temporal Pair Analysis",
    badge: "CHANGE DETECTION PIPELINE",
    tag: "T1/T2 COMPARATIVE SURVEILLANCE",
    description:
      "Compare multi-temporal baseline image pairs (T1 and T2) with trained Siamese U-Net models to detect building construction, urban sprawl, flood inundation, and environmental shifts.",
    accent: "purple",
    accentHex: "#a855f7",
    borderActive: "border-purple-500",
    bgActive: "bg-purple-950/20",
    glowClass: "shadow-[0_0_20px_rgba(168,85,247,0.25)]",
    icon: GitCompare,
    tags: ["CHANGE DETECTION", "CHANGE VQA", "CHANGE DESCRIPTION"],
    tileCountLabel: "UPLOAD IMAGERY (2 TILES REQUIRED)",
    requiredSlots: 2,
    slot1: {
      label: "Image 1 · Earlier Acquisition (T1)",
      tag: "PRE-CHANGE BASELINE",
      helper: "Historical reference baseline capture (pre-event or baseline year)",
    },
    slot2: {
      label: "Image 2 · Later Acquisition (T2)",
      tag: "POST-CHANGE TARGET",
      helper: "Recent target capture over identical georeferenced footprint",
    },
    questionTitle: "Bi-Temporal Change Inquiry",
    questionInstruction:
      "Ask specific questions regarding modifications, new structures, displaced earth, or environmental expansion between acquisitions.",
    questionPlaceholder:
      "Describe what changes to detect... (e.g., 'Where has construction increased between these two dates?', 'Quantify flooded agricultural area between T1 and T2')",
    suggestedQuestions: [
      "Where has construction increased between these two dates?",
      "Quantify floodwater inundation extent across residential sectors.",
      "Detect deforestation and canopy loss along the northern perimeter.",
      "Identify newly paved arterial roads and infrastructure corridors.",
      "Highlight damaged structures following the cyclone landfall.",
    ],
    demoPreset: {
      question: "Where has new residential construction and earthworks expanded between T1 and T2?",
      slot1: {
        name: "RISAT-1A_2024-03-12_T1_BASELINE.tif",
        size: "62.4 MB",
        previewUrl:
          "https://images.unsplash.com/photo-1524813686514-a57563d77d66?auto=format&fit=crop&w=800&q=80",
      },
      slot2: {
        name: "RISAT-1A_2024-09-01_T2_TARGET.tif",
        size: "64.1 MB",
        previewUrl:
          "https://images.unsplash.com/photo-1508873696983-2df5703bc2e1?auto=format&fit=crop&w=800&q=80",
      },
      missionContext: "general_change",
    },
  },
  optical_sar: {
    id: "optical_sar",
    title: "Optical + SAR Analysis",
    badge: "CROSS-MODAL SENSOR FUSION",
    tag: "DIELECTRIC MICROWAVE CORRELATION",
    description:
      "Fuse co-registered optical reflectance with Synthetic Aperture Radar (SAR) microwave dielectric backscatter for all-weather feature discovery, cloud penetration, and flood mapping.",
    accent: "amber",
    accentHex: "#f59e0b",
    borderActive: "border-amber-500",
    bgActive: "bg-amber-950/20",
    glowClass: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    icon: Radar,
    tags: ["CROSS-MODAL FUSION", "SAR FEATURE ANALYSIS", "MULTI-MODAL VQA"],
    tileCountLabel: "UPLOAD IMAGERY (2 TILES REQUIRED)",
    requiredSlots: 2,
    slot1: {
      label: "Sensor 1 · Optical / Multispectral",
      tag: "REFLECTANCE SPECTRUM",
      helper: "Visible & near-infrared bands (VNIR) or true-color RGB composite",
    },
    slot2: {
      label: "Sensor 2 · Synthetic Aperture Radar",
      tag: "MICROWAVE BACKSCATTER",
      helper: "C-Band or L-Band SAR backscatter (VV/VH polarization amplitude)",
    },
    questionTitle: "Optical + SAR Fusion Inquiry",
    questionInstruction:
      "Inquire about sub-canopy structures, specular water boundaries, dielectric moisture shifts, or obscured ground assets.",
    questionPlaceholder:
      "Describe cross-modal fusion question... (e.g., 'Confirm water presence beneath cloud deck using microwave backscatter', 'Identify metallic metallic vs vegetation response')",
    suggestedQuestions: [
      "Confirm water bodies beneath cloud cover using SAR specular reflection.",
      "Identify high-dielectric metallic structures vs vegetative scattering.",
      "Estimate soil moisture index correlation across flood plains.",
      "Detect double-bounce urban scatterers obscured in optical shadows.",
      "Validate runway integrity through heavy cloud and haze layers.",
    ],
    demoPreset: {
      question: "Delineate standing water boundaries beneath cloud cover using SAR backscatter dip.",
      slot1: {
        name: "SENTINEL2_OPTICAL_RGB_BANDS432.tif",
        size: "54.8 MB",
        previewUrl:
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      },
      slot2: {
        name: "SENTINEL1_SAR_C-BAND_VV_VH.tif",
        size: "51.3 MB",
        previewUrl:
          "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      },
      missionContext: "disaster_assessment",
      disasterType: "flood",
    },
  },
};

const DISASTER_TYPES: {
  id: DisasterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  activeBorder: string;
  activeBg: string;
}[] = [
  {
    id: "flood",
    label: "Flood",
    icon: Droplets,
    color: "text-blue-400",
    activeBorder: "border-blue-500",
    activeBg: "bg-blue-950/40 text-blue-300",
  },
  {
    id: "earthquake",
    label: "Earthquake",
    icon: Activity,
    color: "text-amber-500",
    activeBorder: "border-amber-600",
    activeBg: "bg-amber-950/40 text-amber-300",
  },
  {
    id: "wildfire",
    label: "Wildfire",
    icon: Flame,
    color: "text-red-400",
    activeBorder: "border-red-500",
    activeBg: "bg-red-950/40 text-red-300",
  },
  {
    id: "cyclone",
    label: "Cyclone",
    icon: Wind,
    color: "text-purple-400",
    activeBorder: "border-purple-500",
    activeBg: "bg-purple-950/40 text-purple-300",
  },
  {
    id: "landslide",
    label: "Landslide",
    icon: Mountain,
    color: "text-emerald-400",
    activeBorder: "border-emerald-500",
    activeBg: "bg-emerald-950/40 text-emerald-300",
  },
];

interface NewAnalysisViewProps {
  onRunPipeline?: (state: NewAnalysisState) => void;
  onNavigateHome?: () => void;
}

export function NewAnalysisView({ onRunPipeline, onNavigateHome }: NewAnalysisViewProps) {
  // Page state
  const [mode, setMode] = useState<AnalysisMode>("single_image");
  const [missionContext, setMissionContext] = useState<MissionContext>("general_change");
  const [disasterType, setDisasterType] = useState<DisasterType | undefined>(undefined);
  const [slot1, setSlot1] = useState<UploadSlotState | undefined>(undefined);
  const [slot2, setSlot2] = useState<UploadSlotState | undefined>(undefined);
  const [question, setQuestion] = useState<string>("");

  // UI / Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("GB EN");
  const [dragActive1, setDragActive1] = useState(false);
  const [dragActive2, setDragActive2] = useState(false);

  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const config = MODE_CONFIG[mode];

  // Validation logic
  const requiredSlots = config.requiredSlots;
  const hasSlot1 = Boolean(slot1);
  const hasSlot2 = requiredSlots === 1 || Boolean(slot2);
  const hasQuestion = question.trim().length > 3;

  const isFormValid = hasSlot1 && hasSlot2 && hasQuestion;

  const missingPrerequisites: string[] = [];
  if (!hasSlot1) missingPrerequisites.push(config.slot1.label);
  if (requiredSlots === 2 && !slot2) missingPrerequisites.push(config.slot2?.label || "Image 2");
  if (!hasQuestion) missingPrerequisites.push("Analysis Question (min 4 characters)");

  // Handle Mode Change
  const handleModeChange = (newMode: AnalysisMode) => {
    setMode(newMode);
    // If transitioning from 2-slot mode to 1-slot mode or vice versa, keep slot1 if present
    if (newMode === "single_image") {
      setSlot2(undefined);
    }
  };

  // Handle Demo Preset
  const handleLoadDemoPreset = () => {
    const preset = config.demoPreset;
    setQuestion(preset.question);
    setSlot1({
      name: preset.slot1.name,
      size: preset.slot1.size,
      previewUrl: preset.slot1.previewUrl,
      isDemo: true,
    });
    if (config.requiredSlots === 2 && preset.slot2) {
      setSlot2({
        name: preset.slot2.name,
        size: preset.slot2.size,
        previewUrl: preset.slot2.previewUrl,
        isDemo: true,
      });
    } else {
      setSlot2(undefined);
    }
    if (preset.missionContext) {
      setMissionContext(preset.missionContext);
      setDisasterType(preset.disasterType);
    }
  };

  // File Upload Handlers
  const handleFileDrop = (e: React.DragEvent, slotIndex: 1 | 2) => {
    e.preventDefault();
    if (slotIndex === 1) setDragActive1(false);
    else setDragActive2(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], slotIndex);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, slotIndex: 1 | 2) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0], slotIndex);
    }
  };

  const processFile = (file: File, slotIndex: 1 | 2) => {
    const url = URL.createObjectURL(file);
    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    const slotState: UploadSlotState = {
      file,
      name: file.name,
      size: sizeStr,
      previewUrl: url,
    };

    if (slotIndex === 1) setSlot1(slotState);
    else setSlot2(slotState);
  };

  const handleRemoveSlot = (slotIndex: 1 | 2) => {
    if (slotIndex === 1) setSlot1(undefined);
    else setSlot2(undefined);
  };

  // Global Paste Handler for Imagery
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            if (!slot1) {
              processFile(file, 1);
            } else if (config.requiredSlots === 2 && !slot2) {
              processFile(file, 2);
            } else {
              processFile(file, 1);
            }
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, [slot1, slot2, config.requiredSlots]);


  // Question Keyboard Submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isFormValid && onRunPipeline) {
        onRunPipeline({
          mode,
          missionContext,
          disasterType,
          slot1,
          slot2,
          question,
        });
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0A0E14] text-gray-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Ambient background glow dots (ISRO Mission Control aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute top-1/3 right-10 w-[420px] h-[420px] rounded-full bg-purple-600/10 blur-[140px]" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-amber-600/8 blur-[110px]" />
        {/* Faint coordinate / ground station grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #94a3b8 1px, transparent 0)`,
            backgroundSize: "36px 36px",
          }}
        />
      </div>

            {/* MAIN INTAKE WORKSPACE */}
      <div className="relative z-10 flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8 overflow-y-auto">

          {/* 3. PAGE HEADER */}
          <div className="space-y-3 pb-6 border-b border-[#1F2937]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 font-mono text-xs">
                <span
                  className={`px-2.5 py-0.5 rounded-full border text-[11px] font-semibold uppercase tracking-wider ${
                    mode === "single_image"
                      ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                      : mode === "bi_temporal"
                      ? "bg-purple-950/60 text-purple-300 border-purple-500/40"
                      : "bg-amber-950/60 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {config.badge}
                </span>
                <span className="text-gray-500">·</span>
                <span className="text-gray-400 font-mono tracking-wider uppercase text-[11px]">
                  Ground Ingest Console
                </span>
              </div>

              {/* Load Demo Preset Button */}
              <button
                onClick={handleLoadDemoPreset}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#111827] hover:bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:text-cyan-200 text-xs font-mono tracking-wide transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>LOAD DEMO PRESET</span>
              </button>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                {config.title}
              </h1>
              <p className="text-sm text-gray-400 max-w-3xl leading-relaxed">
                {config.description}
              </p>
            </div>
          </div>

          {/* 4. STEP 01 — SELECT ANALYSIS WORKFLOW */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 font-mono">
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                STEP 01
              </span>
              <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono">
                SELECT ANALYSIS WORKFLOW
              </h2>
            </div>
            <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">
              ANALYSIS MODE
            </p>

            {/* Three Selectable Mode Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(MODE_CONFIG) as AnalysisMode[]).map((modeKey) => {
                const item = MODE_CONFIG[modeKey];
                const IconComponent = item.icon;
                const isSelected = mode === modeKey;

                return (
                  <div
                    key={modeKey}
                    onClick={() => handleModeChange(modeKey)}
                    className={`relative p-5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${item.borderActive} ${item.bgActive} ${item.glowClass}`
                        : "border-[#1F2937] bg-[#0E1522]/70 hover:border-gray-600 hover:bg-[#111827]"
                    }`}
                  >
                    <div>
                      {/* Icon + Title */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                            isSelected
                              ? `bg-${item.accent}-950/80 ${item.borderActive} text-${item.accent}-300`
                              : "bg-gray-800/80 border-gray-700 text-gray-400"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3
                            className={`font-semibold text-sm ${
                              isSelected ? "text-white" : "text-gray-300"
                            }`}
                          >
                            {item.title}
                          </h3>
                          <span className="text-[10px] font-mono text-gray-500 block">
                            {item.tag}
                          </span>
                        </div>
                      </div>

                      {/* 2-line description */}
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Capability Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#1F2937]/60 font-mono text-[9px]">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-2 py-0.5 rounded border ${
                            isSelected
                              ? `bg-${item.accent}-950/50 text-${item.accent}-300 border-${item.accent}-600/30`
                              : "bg-gray-900/60 text-gray-500 border-gray-800"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Active Selected Indicator Checkmark */}
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            item.accent === "cyan"
                              ? "text-cyan-400"
                              : item.accent === "purple"
                              ? "text-purple-400"
                              : "text-amber-400"
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <hr className="border-[#1F2937]" />

          {/* 5. MISSION — SELECT MISSION CONTEXT */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 font-mono">
              <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs font-bold">
                MISSION
              </span>
              <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono">
                SELECT MISSION CONTEXT
              </h2>
            </div>

            {/* Context Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* General Change Analysis */}
              <div
                onClick={() => setMissionContext("general_change")}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  missionContext === "general_change"
                    ? "border-cyan-500 bg-cyan-950/20 shadow-[0_0_16px_rgba(6,182,212,0.15)]"
                    : "border-[#1F2937] bg-[#0E1522]/70 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <h3
                    className={`font-semibold text-sm ${
                      missionContext === "general_change" ? "text-white" : "text-gray-300"
                    }`}
                  >
                    General Change Analysis
                  </h3>
                  {missionContext === "general_change" && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Standard bi-temporal change detection for general land-use, construction, or environmental monitoring.
                </p>
              </div>

              {/* Disaster Assessment */}
              <div
                onClick={() => {
                  setMissionContext("disaster_assessment");
                  if (!disasterType) setDisasterType("flood");
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  missionContext === "disaster_assessment"
                    ? "border-amber-500 bg-amber-950/25 shadow-[0_0_16px_rgba(245,158,11,0.2)]"
                    : "border-[#1F2937] bg-[#0E1522]/70 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <h3
                      className={`font-semibold text-sm ${
                        missionContext === "disaster_assessment" ? "text-amber-200" : "text-gray-300"
                      }`}
                    >
                      Disaster Assessment
                    </h3>
                  </div>
                  {missionContext === "disaster_assessment" && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Analyze before/after imagery under a disaster context. Change regions highlighted for operator investigation.
                </p>
              </div>
            </div>

            {/* Disaster Type Selector (Revealed conditionally) */}
            {missionContext === "disaster_assessment" && (
              <div className="p-4 rounded-xl bg-[#0E1522]/90 border border-amber-500/30 space-y-3 animate-in fade-in-50 duration-300">
                <p className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                  SELECT DISASTER TYPE
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {DISASTER_TYPES.map((dt) => {
                    const Icon = dt.icon;
                    const isSelected = disasterType === dt.id;
                    return (
                      <button
                        key={dt.id}
                        type="button"
                        onClick={() => setDisasterType(dt.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                          isSelected
                            ? `${dt.activeBorder} ${dt.activeBg} font-semibold shadow-sm`
                            : "border-[#1F2937] bg-[#111827] text-gray-400 hover:text-gray-200 hover:border-gray-600"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${dt.color}`} />
                        <span>{dt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          <hr className="border-[#1F2937]" />

          {/* 6. STEP 02 — UPLOAD IMAGERY */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 font-mono">
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/40 text-xs font-bold">
                  STEP 02
                </span>
                <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono">
                  {config.tileCountLabel}
                </h2>
              </div>
            </div>

            {/* Dynamic Dropzones based on mode */}
            <div
              className={`grid gap-5 ${
                config.requiredSlots === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {/* Slot 1 Dropzone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-300 font-semibold">{config.slot1.label}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                    {config.slot1.tag}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef1}
                  className="hidden"
                  accept=".tif,.tiff,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileSelect(e, 1)}
                />

                {slot1 ? (
                  /* Filled State */
                  <div className="p-4 rounded-xl border border-cyan-500/40 bg-cyan-950/15 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-cyan-500/30 shrink-0 bg-black flex items-center justify-center">
                        <img
                          src={slot1.previewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-semibold text-white truncate">
                          {slot1.name}
                        </p>
                        <p className="text-[10px] font-mono text-gray-400">{slot1.size}</p>
                        <span className="text-[9px] font-mono text-emerald-400">
                          ✓ GEOSPATIAL PAYLOAD VERIFIED
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSlot(1)}
                      className="p-1.5 rounded-md bg-gray-800 hover:bg-red-950/60 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Empty Dropzone State */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive1(true);
                    }}
                    onDragLeave={() => setDragActive1(false)}
                    onDrop={(e) => handleFileDrop(e, 1)}
                    onClick={() => fileInputRef1.current?.click()}
                    className={`p-6 md:p-8 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                      dragActive1
                        ? "border-cyan-400 bg-cyan-950/30"
                        : "border-[#1F2937] bg-[#0E1522]/50 hover:border-gray-600 hover:bg-[#111827]/80"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#1F2937] flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6 text-cyan-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-200">
                      Drag & drop satellite image here
                    </p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm">{config.slot1.helper}</p>
                    <button
                      type="button"
                      className="mt-3.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/80 text-xs text-gray-300 hover:text-white hover:border-gray-500 font-mono transition-colors"
                    >
                      Choose Image File
                    </button>
                    <span className="text-[10px] text-gray-500 font-mono mt-2">
                      GeoTIFF · PNG · JPG (Up to 500MB)
                    </span>
                  </div>
                )}
              </div>

              {/* Slot 2 Dropzone (If 2 required) */}
              {config.requiredSlots === 2 && config.slot2 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-300 font-semibold">{config.slot2.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                      {config.slot2.tag}
                    </span>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef2}
                    className="hidden"
                    accept=".tif,.tiff,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileSelect(e, 2)}
                  />

                  {slot2 ? (
                    /* Filled State */
                    <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-950/15 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden border border-purple-500/30 shrink-0 bg-black flex items-center justify-center">
                          <img
                            src={slot2.previewUrl}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-mono font-semibold text-white truncate">
                            {slot2.name}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400">{slot2.size}</p>
                          <span className="text-[9px] font-mono text-emerald-400">
                            ✓ GEOSPATIAL PAYLOAD VERIFIED
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveSlot(2)}
                        className="p-1.5 rounded-md bg-gray-800 hover:bg-red-950/60 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* Empty Dropzone State */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive2(true);
                      }}
                      onDragLeave={() => setDragActive2(false)}
                      onDrop={(e) => handleFileDrop(e, 2)}
                      onClick={() => fileInputRef2.current?.click()}
                      className={`p-6 md:p-8 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                        dragActive2
                          ? "border-purple-400 bg-purple-950/30"
                          : "border-[#1F2937] bg-[#0E1522]/50 hover:border-gray-600 hover:bg-[#111827]/80"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#1F2937] flex items-center justify-center mb-3">
                        <UploadCloud className="w-6 h-6 text-purple-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-200">
                        Drag & drop satellite image here
                      </p>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm">
                        {config.slot2.helper}
                      </p>
                      <button
                        type="button"
                        className="mt-3.5 px-3 py-1.5 rounded-lg border border-gray-700 bg-gray-800/80 text-xs text-gray-300 hover:text-white hover:border-gray-500 font-mono transition-colors"
                      >
                        Choose Image File
                      </button>
                      <span className="text-[10px] text-gray-500 font-mono mt-2">
                        GeoTIFF · PNG · JPG (Up to 500MB)
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <hr className="border-[#1F2937]" />

          {/* 7. STEP 04 — ASK YOUR ANALYSIS QUESTION (skip to 04 intentionally) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                STEP 04
              </span>
              <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider font-mono">
                ASK YOUR ANALYSIS QUESTION
              </h2>
            </div>

            <div className="p-5 rounded-xl bg-[#0E1522]/80 border border-[#1F2937] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {config.questionTitle}
                  </h3>
                  <p className="text-xs text-gray-400">{config.questionInstruction}</p>
                </div>
                <span className="text-xs font-mono text-gray-500">
                  {question.length} / 1000
                </span>
              </div>

              {/* Textarea Container */}
              <div className="relative rounded-lg border border-[#1F2937] bg-[#070A0F] focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={config.questionPlaceholder}
                  className="w-full bg-transparent p-3.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none resize-none leading-relaxed"
                />

                {/* Bottom Bar inside Textarea */}
                <div className="flex items-center justify-between px-3 py-2 border-t border-[#1F2937]/50 bg-[#0A0F1A]/70 text-[11px] font-mono text-gray-400">
                  <span>↵ Press Enter to submit · Shift+Enter for new line</span>

                  <div className="flex items-center gap-2">
                    {/* Voice input stub */}
                    <button
                      type="button"
                      onClick={() => setIsRecordingVoice(!isRecordingVoice)}
                      title="Voice query input"
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isRecordingVoice
                          ? "bg-red-950 text-red-400 border border-red-500/50 animate-pulse"
                          : "hover:text-gray-200 hover:bg-gray-800"
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </button>

                    {/* Language selector chip */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedLanguage(
                          selectedLanguage === "GB EN"
                            ? "IN HI"
                            : selectedLanguage === "IN HI"
                            ? "FR FR"
                            : "GB EN"
                        )
                      }
                      className="flex items-center gap-1 px-2 py-0.5 rounded border border-gray-700 bg-gray-800/60 hover:border-gray-600 text-[10px] cursor-pointer"
                    >
                      <Globe className="w-3 h-3 text-cyan-400" />
                      <span>{selectedLanguage}</span>
                    </button>

                    {/* Submit Icon Button */}
                    <button
                      type="button"
                      disabled={!isFormValid}
                      onClick={() => {
                        if (isFormValid && onRunPipeline) {
                          onRunPipeline({
                            mode,
                            missionContext,
                            disasterType,
                            slot1,
                            slot2,
                            question,
                          });
                        }
                      }}
                      className={`p-1.5 rounded transition-all cursor-pointer ${
                        isFormValid
                          ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-sm"
                          : "bg-gray-800 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Suggested Questions */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SUGGESTED ANALYSIS INQUIRIES</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.suggestedQuestions.map((sq, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestion(sq)}
                      className="px-3 py-1.5 rounded-full border border-[#1F2937] bg-[#111827]/70 hover:border-cyan-500/40 hover:bg-cyan-950/20 text-xs text-gray-300 hover:text-cyan-200 transition-all text-left cursor-pointer"
                    >
                      &ldquo;{sq}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 8. PREREQUISITES / VALIDATION BANNER */}
          {!isFormValid && (
            <div className="p-4 rounded-xl border-l-4 border-l-amber-500 border border-[#1F2937] bg-amber-950/20 flex items-start gap-3 animate-in fade-in-50">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold font-mono text-amber-300 uppercase tracking-wider">
                  Prerequisites for Analysis
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Please provide all required inputs for{" "}
                  <span className="font-semibold text-white">{config.title}</span>:{" "}
                  <span className="text-amber-300 font-mono font-medium">
                    {missingPrerequisites.join(" · ")}
                  </span>
                  .
                </p>
              </div>
            </div>
          )}

          {/* 9. RUN BUTTON (STICKY FOOTER / BOTTOM OF FORM) */}
          <div className="pt-4 pb-12 flex justify-end">
            <button
              type="button"
              disabled={!isFormValid}
              onClick={() => {
                if (isFormValid && onRunPipeline) {
                  onRunPipeline({
                    mode,
                    missionContext,
                    disasterType,
                    slot1,
                    slot2,
                    question,
                  });
                }
              }}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-mono text-sm uppercase tracking-wider font-bold transition-all shadow-lg ${
                isFormValid
                  ? mode === "single_image"
                    ? "bg-cyan-500 text-black hover:bg-cyan-400 shadow-cyan-500/25 cursor-pointer hover:scale-[1.01]"
                    : mode === "bi_temporal"
                    ? "bg-purple-600 text-white hover:bg-purple-500 shadow-purple-600/25 cursor-pointer hover:scale-[1.01]"
                    : "bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/25 cursor-pointer hover:scale-[1.01]"
                  : "bg-gray-900 border border-gray-800 text-gray-600 opacity-50 cursor-not-allowed"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RUN SATQUERY PIPELINE</span>
            </button>
          </div>
      </div>
    </div>
  );
}
