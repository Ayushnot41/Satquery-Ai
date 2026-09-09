import type { AnalysisResult } from '../types/investigation';

export const USE_MOCK_RESULTS = true;

export const MOCK_SINGLE_IMAGE: AnalysisResult = {
  run_id: 'RUN-8f21a',
  created_at: '2026-09-09T12:10:22Z',
  mode: 'single_image',
  mission_context: 'General Change Analysis',
  question: 'Locate and count all buildings and built structures in this image',
  input_ids: ['scene-cartosat3-delhi-urban-01'],
  answer: '14 distinct buildings and built structures identified. Dominant morphology is medium-density residential blocks with two large commercial/industrial units in the south-eastern quadrant. Built-up density index (NDBI) reads +0.41, confirming active urbanisation. No structural damage detected.',
  status: 'complete',
  confidence: 87,
  metrics: {
    'Objects Detected': 14,
    'Built-up NDBI': '+0.41',
    'Avg Confidence per Box': '0.89',
    'GSD': '0.28 m/px',
    'Model Certainty Score': '0.91',
  },
  evidence: {
    type: 'bounding_box',
    regions: [
      { id: 'reg-01', label: 'Residential Block A', score: 0.96, type: 'bounding_box', bbox: { x: 0.08, y: 0.12, width: 0.18, height: 0.14 } },
      { id: 'reg-02', label: 'Residential Block B', score: 0.94, type: 'bounding_box', bbox: { x: 0.31, y: 0.09, width: 0.16, height: 0.13 } },
      { id: 'reg-03', label: 'Industrial Unit', score: 0.91, type: 'bounding_box', bbox: { x: 0.62, y: 0.55, width: 0.26, height: 0.21 } },
      { id: 'reg-04', label: 'Commercial Complex', score: 0.88, type: 'bounding_box', bbox: { x: 0.14, y: 0.62, width: 0.22, height: 0.18 } },
      { id: 'reg-05', label: 'Road Infrastructure', score: 0.83, type: 'bounding_box', bbox: { x: 0.0, y: 0.44, width: 0.95, height: 0.06 } },
    ],
  },
  limitations: [
    'Shadow occlusion in NW quadrant may conceal 1-2 low-rise structures.',
    'GSD of 0.28 m/px cannot resolve structures narrower than ~0.84 m.',
  ],
  trace: [
    { step: 'Input Inspection', tool: 'File Validator + EXIF Parser', duration_ms: 28, status: 'success', detail: '1 optical scene validated. CRS: EPSG:4326.', timestamp_offset_ms: 0 },
    { step: 'Compatibility Gate', tool: 'Agent 2 - Geo Validator', duration_ms: 41, status: 'success', detail: 'Coverage: 28.61N 77.21E.', timestamp_offset_ms: 30 },
    { step: 'Task Classification', tool: 'Agent 1 - Query Planner (Llama-3.3-70B)', duration_ms: 312, status: 'success', detail: 'Task type: visual_grounding.', timestamp_offset_ms: 72 },
    { step: 'Sensor Routing', tool: 'Agent 3 - Sensor Router (Mistral-Small-24B)', duration_ms: 198, status: 'success', detail: 'Cloud cover: 3%. Optical path selected.', timestamp_offset_ms: 385 },
    { step: 'Specialist Dispatch VQA', tool: 'Agent 4 - RS-VQA Engine (Gemini 2.5 Flash)', duration_ms: 874, status: 'success', detail: '14 bounding regions extracted.', timestamp_offset_ms: 583 },
    { step: 'Evidence Assembly', tool: 'Agent 6 - Visual Grounding (Llama-3.3-70B)', duration_ms: 143, status: 'success', detail: '5 high-confidence regions retained.', timestamp_offset_ms: 1457 },
    { step: 'Confidence Assessment', tool: 'Agent 8 - Confidence Engine (Gemini 2.5 Flash)', duration_ms: 211, status: 'success', detail: 'Overall confidence: HIGH (87%).', timestamp_offset_ms: 1600 },
    { step: 'Audit and Trace', tool: 'Agent 9 - Flight Recorder (Gemini 2.5 Flash-Lite)', duration_ms: 44, status: 'success', detail: '7 events logged.', timestamp_offset_ms: 1811 },
  ],
};

export const MOCK_BI_TEMPORAL: AnalysisResult = {
  run_id: 'RUN-3c09d',
  created_at: '2026-09-09T11:44:07Z',
  mode: 'bi_temporal',
  mission_context: 'Disaster Assessment - Flood',
  question: 'Where did flooding expand between the two dates?',
  input_ids: ['sentinel2-brahmaputra-pre-2026-07-12', 'sentinel2-brahmaputra-post-2026-07-19'],
  answer: 'Significant flood expansion confirmed. 1,847 ha of previously-dry agricultural land is now inundated as of T2 (July 19). The flood front advanced 4.3 km north-east along the Brahmaputra alluvial plain. Critical infrastructure at 26.18N 91.77E (NH-27 bridge abutment) is within 120 m of the active flood edge. Confidence is MODERATE due to partial cloud cover in the north-western quadrant.',
  status: 'complete',
  confidence: 64,
  metrics: {
    'Flooded Area T2': '1,847 ha',
    'Change vs T1': '+1,203 ha',
    'Flood Front Advance': '4.3 km NE',
    'Change Percentage': '22.4%',
    'Cloud Cover T2 NW': '38%',
  },
  evidence: {
    type: 'mask',
    regions: [
      { id: 'flood-zone-primary', label: 'Primary Inundation Zone', score: 0.91, type: 'mask', bbox: { x: 0.05, y: 0.3, width: 0.55, height: 0.45 } },
      { id: 'flood-zone-secondary', label: 'Secondary Overflow Channel', score: 0.77, type: 'mask', bbox: { x: 0.6, y: 0.55, width: 0.3, height: 0.25 } },
      { id: 'flood-risk-bridge', label: 'NH-27 Bridge Abutment', score: 0.88, type: 'bounding_box', bbox: { x: 0.44, y: 0.52, width: 0.08, height: 0.06 } },
    ],
  },
  limitations: [
    '38% cloud cover in NW quadrant of T2 scene reduces optical detection accuracy.',
    'Bi-temporal interval of 7 days may miss intermediate flood peaks or recession events.',
  ],
  trace: [
    { step: 'Input Inspection', tool: 'File Validator + GeoTIFF Parser', duration_ms: 52, status: 'success', detail: '2 Sentinel-2 scenes. T1: 2026-07-12, T2: 2026-07-19.', timestamp_offset_ms: 0 },
    { step: 'Compatibility Gate', tool: 'Agent 2 - Geo Validator', duration_ms: 87, status: 'warning', detail: 'Warning: partial cloud cover detected in T2 NW quadrant (38%).', timestamp_offset_ms: 54 },
    { step: 'Task Classification', tool: 'Agent 1 - Query Planner (Llama-3.3-70B)', duration_ms: 289, status: 'success', detail: 'Task type: change_detection.', timestamp_offset_ms: 141 },
    { step: 'Sensor Routing', tool: 'Agent 3 - Sensor Router (Mistral-Small-24B)', duration_ms: 166, status: 'success', detail: 'Cloud cover T2 > 30%. Optical path retained.', timestamp_offset_ms: 430 },
    { step: 'Change Detection Engine', tool: 'Agent 5 - Bi-Temporal Change (DeepSeek-R1)', duration_ms: 1241, status: 'success', detail: '1,847 ha flooded pixels confirmed.', timestamp_offset_ms: 596 },
    { step: 'Evidence Assembly', tool: 'Agent 6 - Visual Grounding (Llama-3.3-70B)', duration_ms: 198, status: 'success', detail: '3 change regions assembled.', timestamp_offset_ms: 1837 },
    { step: 'Result Validation', tool: 'Agent 7 - Evidence Fusion (DeepSeek-R1-Free)', duration_ms: 432, status: 'success', detail: 'Confidence downgraded: HIGH to MODERATE.', timestamp_offset_ms: 2035 },
    { step: 'Confidence Assessment', tool: 'Agent 8 - Confidence Engine (Gemini 2.5 Flash)', duration_ms: 267, status: 'warning', detail: 'Confidence: MODERATE (64%). Reason: cloud cover.', timestamp_offset_ms: 2467 },
    { step: 'Audit and Trace', tool: 'Agent 9 - Flight Recorder (Gemini 2.5 Flash-Lite)', duration_ms: 38, status: 'success', detail: '9 events recorded. 2 warnings committed.', timestamp_offset_ms: 2734 },
  ],
};

export const MOCK_OPTICAL_SAR: AnalysisResult = {
  run_id: 'RUN-7b44e',
  created_at: '2026-09-09T10:22:51Z',
  mode: 'optical_sar',
  mission_context: 'Disaster Assessment - Flood',
  question: 'Use SAR radar to identify flood water despite 100% cloud cover, and measure the inundated extent',
  input_ids: ['sentinel2-optical-pre-2026-07-01', 'sentinel1-sar-post-2026-07-18-iw-grd'],
  answer: 'SAR microwave radar successfully pierced the 100% cloud deck. Sentinel-1 C-Band backscatter confirms 3,210 ha of active flood inundation. Water pixels exhibit specular returns at sigma0 = -22.4 dB (VV polarisation). Urban double-bounce signatures at sigma0 = +2.1 dB confirm structures remain above waterline. Optical imagery was cloud-blinded and overruled by SAR evidence per Agent 7 arbitration protocol.',
  status: 'complete',
  confidence: 91,
  metrics: {
    'Flooded Area SAR': '3,210 ha',
    'Water Backscatter VV': '-22.4 dB',
    'Urban Double-Bounce': '+2.1 dB',
    'VH/VV Ratio': '0.31',
    'Optical Cloud Cover': '100%',
    'SAR Confidence Score': '0.94',
    'Lee Filter Window': '7x7 px',
  },
  evidence: {
    type: 'mask',
    regions: [
      { id: 'sar-flood-primary', label: 'SAR Confirmed Inundation', score: 0.94, type: 'mask', bbox: { x: 0.04, y: 0.15, width: 0.72, height: 0.62 } },
      { id: 'sar-urban-safe', label: 'Urban Structures Above Waterline', score: 0.89, type: 'bounding_box', bbox: { x: 0.55, y: 0.22, width: 0.3, height: 0.2 } },
      { id: 'sar-edge-uncertainty', label: 'Flood Edge Mixed Returns', score: 0.61, type: 'region', bbox: { x: 0.71, y: 0.38, width: 0.18, height: 0.28 } },
    ],
  },
  limitations: [
    'SAR specular return assumes calm water - turbulent currents may cause underestimation.',
    'Mixed-return zone at flood edge (confidence 0.61) needs physical verification.',
  ],
  trace: [
    { step: 'Input Inspection', tool: 'Multi-Sensor File Validator', duration_ms: 61, status: 'success', detail: '2 scenes: Sentinel-2 MSI + Sentinel-1 IW-GRD.', timestamp_offset_ms: 0 },
    { step: 'Compatibility Gate', tool: 'Agent 2 - Geo Validator', duration_ms: 94, status: 'success', detail: 'Spatial overlap: 98.4%. Temporal gap: 17 days.', timestamp_offset_ms: 63 },
    { step: 'Task Classification', tool: 'Agent 1 - Query Planner (Llama-3.3-70B)', duration_ms: 341, status: 'success', detail: 'Task type: sar_analysis + change_detection. SAR mandatory.', timestamp_offset_ms: 158 },
    { step: 'Sensor Routing', tool: 'Agent 3 - Sensor Router (Mistral-Small-24B)', duration_ms: 187, status: 'success', detail: 'Optical: CLOUD_BLIND (100%). SAR path activated.', timestamp_offset_ms: 499 },
    { step: 'SAR Radiometric Calibration', tool: 'Agent 5 - SAR Change Engine (DeepSeek-R1)', duration_ms: 1628, status: 'success', detail: 'DN to sigma0 complete. Lee filter 7x7 applied.', timestamp_offset_ms: 686 },
    { step: 'Cross-Sensor Arbitration', tool: 'Agent 7 - Evidence Fusion (DeepSeek-R1-Free)', duration_ms: 514, status: 'success', detail: 'Optical REJECTED. SAR ACCEPTED. SAR overrules optical.', timestamp_offset_ms: 2314 },
    { step: 'Confidence Assessment', tool: 'Agent 8 - Confidence Engine (Gemini 2.5 Flash)', duration_ms: 288, status: 'success', detail: 'Confidence: HIGH (91%). Physics-based result.', timestamp_offset_ms: 2828 },
    { step: 'Audit and Trace', tool: 'Agent 9 - Flight Recorder (Gemini 2.5 Flash-Lite)', duration_ms: 41, status: 'success', detail: '8 events logged. Optical overrule recorded.', timestamp_offset_ms: 3116 },
  ],
};

export const MOCK_RESULTS: Record<string, AnalysisResult> = {
  [MOCK_SINGLE_IMAGE.run_id]: MOCK_SINGLE_IMAGE,
  [MOCK_BI_TEMPORAL.run_id]: MOCK_BI_TEMPORAL,
  [MOCK_OPTICAL_SAR.run_id]: MOCK_OPTICAL_SAR,
};

export const ALL_MOCK_RESULTS = [MOCK_SINGLE_IMAGE, MOCK_BI_TEMPORAL, MOCK_OPTICAL_SAR];

export function getMockResult(runId?: string): AnalysisResult {
  if (runId && MOCK_RESULTS[runId]) return MOCK_RESULTS[runId];
  return MOCK_SINGLE_IMAGE;
}
