/**
 * BHUVISION TypeScript Types — Matches backend Pydantic contracts.
 */

export type TaskType =
  | "vqa"
  | "captioning"
  | "change_detection"
  | "visual_grounding"
  | "sar_analysis"
  | "multi_sensor"
  | "unknown";

export type SensorDecisionType =
  | "optical_only"
  | "sar_only"
  | "optical_and_sar"
  | "not_applicable";

export type ConfidenceLevel =
  | "high"
  | "moderate"
  | "low"
  | "very_low"
  | "unknown";

export type InvestigationStatus =
  | "pending"
  | "planning"
  | "validating"
  | "routing"
  | "analyzing"
  | "grounding"
  | "fusing"
  | "assessing"
  | "complete"
  | "error";

export interface QueryPlan {
  task_type: TaskType;
  requires_temporal: boolean;
  requires_sar: boolean;
  requires_grounding: boolean;
  suggested_tools: string[];
  investigation_summary: string;
  original_question: string;
}

export interface ValidationResult {
  is_valid: boolean;
  file_valid: boolean;
  dimensions_valid: boolean;
  crs_valid: boolean;
  metadata_valid: boolean;
  sensor_compatible: boolean;
  temporal_compatible: boolean;
  coverage_valid: boolean;
  alignment_valid: boolean;
  issues: string[];
  warnings: string[];
}

export interface SensorDecision {
  decision: SensorDecisionType;
  reason: string;
  optical_available: boolean;
  sar_available: boolean;
  recommendation_confidence: ConfidenceLevel;
}

export interface VQAResult {
  answer: string;
  raw_model_output: string;
  model_name: string;
  model_version: string;
  logits_confidence?: number | null;
}

export interface ChangeRegion {
  bbox: [number, number, number, number]; // [xmin, ymin, xmax, ymax]
  geo_bbox?: [number, number, number, number] | null;
  change_type: string;
  change_magnitude: number;
  area_pixels: number;
}

export interface ChangeResult {
  has_change: boolean;
  change_summary: string;
  change_regions: ChangeRegion[];
  method_used: string;
  total_changed_pixels: number;
  total_pixels: number;
  change_percentage: number;
}

export interface GroundingResult {
  regions: ChangeRegion[];
  description: string;
}

export interface EvidenceItem {
  source_agent: string;
  agent_id: number;
  evidence_type: string;
  content: string;
  confidence?: number | null;
  visual_reference?: string | null;
  metadata: Record<string, unknown>;
}

export interface FusedEvidence {
  primary_answer: string;
  evidence_items: EvidenceItem[];
  supporting_summary: string;
  contradictions: string[];
  evidence_strength: ConfidenceLevel;
}

export interface ConfidenceReport {
  overall_confidence: ConfidenceLevel;
  confidence_score?: number | null;
  explanation: string;
  factors: string[];
  uncertainties: string[];
  is_fabricated: boolean;
}

export interface VisualOverlay {
  overlay_type: string;
  coordinates: number[][];
  color: string;
  opacity: number;
  label: string;
  confidence?: number | null;
}

export interface TraceEvent {
  timestamp: string;
  event_type: string;
  agent_name: string;
  agent_id: number;
  message: string;
  details: Record<string, unknown>;
  duration_ms?: number | null;
  model_used?: string | null;
  model_version?: string | null;
}

export interface ExecutionTrace {
  investigation_id: string;
  started_at: string;
  completed_at?: string | null;
  events: TraceEvent[];
  total_duration_ms?: number | null;
  agents_invoked: string[];
  models_used: string[];
  warnings: string[];
  errors: string[];
  fallbacks_used: string[];
}

export interface InvestigationResponse {
  investigation_id: string;
  status: InvestigationStatus;
  question: string;
  answer: string;
  plan?: QueryPlan | null;
  validation?: ValidationResult | null;
  sensor_decision?: SensorDecision | null;
  vqa_result?: VQAResult | null;
  change_result?: ChangeResult | null;
  grounding?: GroundingResult | null;
  fused_evidence?: FusedEvidence | null;
  confidence?: ConfidenceReport | null;
  visual_overlays: VisualOverlay[];
  trace?: ExecutionTrace | null;
  total_duration_ms?: number | null;
  created_at: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  question: string;
  imagery_ids: string[];
  expected_task_type: string;
  category: "construction" | "flood" | "vegetation";
}

// ============================================================
// ANALYSIS RESULTS PAGE — New types for the Results screen
// ============================================================

export type AnalysisMode = "single_image" | "bi_temporal" | "optical_sar";

export type AnalysisStatus = "processing" | "complete" | "inconclusive" | "error";

export interface EvidenceRegion {
  id: string;
  label: string;
  score?: number | null;
  /** Normalized 0-1 bounding box */
  bbox?: { x: number; y: number; width: number; height: number } | null;
  /** URL for a mask image overlay */
  mask_url?: string | null;
  type: "bounding_box" | "mask" | "region";
}

export interface EvidencePayload {
  type: "bounding_box" | "mask" | "region";
  regions: EvidenceRegion[];
}

export interface TraceStep {
  step: string;
  tool: string;
  duration_ms: number;
  status: "success" | "warning" | "failed";
  detail?: string | null;
  timestamp_offset_ms?: number | null;
}

export interface AnalysisResult {
  run_id: string;
  created_at: string;
  mode: AnalysisMode;
  mission_context: string;
  question: string;
  input_ids: string[];
  /** Human-readable answer synthesized by the 9-agent council */
  answer: string;
  status: AnalysisStatus;
  /** 0-100, empirically calibrated — null if not yet computed */
  confidence: number | null;
  /** Task-specific numeric or string metrics */
  metrics: Record<string, number | string>;
  evidence: EvidencePayload;
  limitations: string[];
  trace: TraceStep[];
  imageUrls?: string[];
  previewUrl?: string;
}
