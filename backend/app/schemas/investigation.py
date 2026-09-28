"""Investigation request/response schemas — the main API contract."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field, model_validator

from .agents import (
    ChangeResult,
    ConfidenceReport,
    EvidenceItem,
    FusedEvidence,
    GroundingResult,
    QueryPlan,
    SensorDecision,
    ValidationResult,
    VisualOverlay,
    VQAResult,
)
from .trace import ExecutionTrace


class InvestigationMode(str, Enum):
    """How the investigation should be routed."""
    AUTO = "auto"
    OPTICAL = "optical"
    SAR = "sar"
    TEMPORAL = "temporal"
    BI_TEMPORAL = "bi_temporal"
    SINGLE_IMAGE = "single_image"
    OPTICAL_SAR = "optical_sar"
    SINGLE = "single"
    FUSION = "fusion"


class InvestigationStatus(str, Enum):
    """Current status of an investigation."""
    PENDING = "pending"
    PLANNING = "planning"
    VALIDATING = "validating"
    ROUTING = "routing"
    ANALYZING = "analyzing"
    GROUNDING = "grounding"
    FUSING = "fusing"
    ASSESSING = "assessing"
    COMPLETE = "complete"
    ERROR = "error"


class InvestigationRequest(BaseModel):
    """Request to start an investigation."""
    question: str = Field(default="Analyze satellite imagery features", max_length=2000)
    query: str | None = Field(default=None, description="Optional alias for question")
    imagery_ids: list[str] = Field(
        default_factory=lambda: ["demo-construction-before", "demo-construction-after"],
        max_length=10,
    )
    mode: InvestigationMode = InvestigationMode.AUTO
    demo_scenario: str | None = Field(
        None, description="If set, use deterministic demo data for this scenario"
    )

    @model_validator(mode="before")
    @classmethod
    def normalize_request(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Resolve question from query or prompt if needed
            q = data.get("question") or data.get("query") or data.get("prompt")
            if q and str(q).strip():
                data["question"] = str(q).strip()
            elif not data.get("question"):
                data["question"] = "Analyze satellite imagery features"

            # Resolve imagery_ids from input_ids, images, or default
            raw_ids = data.get("imagery_ids") or data.get("input_ids") or data.get("images") or data.get("imageryIds")
            if isinstance(raw_ids, str):
                data["imagery_ids"] = [raw_ids]
            elif isinstance(raw_ids, list) and raw_ids:
                data["imagery_ids"] = [str(x) for x in raw_ids if x]
            else:
                data["imagery_ids"] = ["demo-construction-before", "demo-construction-after"]

            # Normalize mode string to lowercase
            m = data.get("mode")
            if isinstance(m, str):
                norm_m = m.lower().strip()
                if norm_m in ("temporal", "bi_temporal", "change_detection"):
                    data["mode"] = InvestigationMode.BI_TEMPORAL
                elif norm_m in ("optical", "single_image", "single"):
                    data["mode"] = InvestigationMode.OPTICAL
                elif norm_m in ("sar", "optical_sar", "fusion"):
                    data["mode"] = InvestigationMode.SAR
                else:
                    data["mode"] = InvestigationMode.AUTO

        return data


class AgentStatusUpdate(BaseModel):
    """Real-time status update from an agent (sent via WebSocket)."""
    investigation_id: str
    agent_name: str
    agent_id: int
    status: str  # "started", "processing", "complete", "error"
    message: str = ""
    progress: float | None = Field(None, ge=0.0, le=1.0)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class InvestigationResponse(BaseModel):
    """Complete response from an investigation."""
    investigation_id: str
    status: InvestigationStatus
    question: str
    answer: str = ""

    # Agent outputs
    plan: QueryPlan | None = None
    validation: ValidationResult | None = None
    sensor_decision: SensorDecision | None = None
    vqa_result: VQAResult | None = None
    change_result: ChangeResult | None = None
    grounding: GroundingResult | None = None
    fused_evidence: FusedEvidence | None = None
    confidence: ConfidenceReport | None = None

    # Visual outputs
    visual_overlays: list[VisualOverlay] = Field(default_factory=list)

    # Trace
    trace: ExecutionTrace | None = None

    # Timing
    total_duration_ms: float | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DemoScenario(BaseModel):
    """A pre-configured demo scenario with known outputs."""
    id: str
    name: str
    description: str
    question: str
    imagery_ids: list[str]
    expected_task_type: str
    category: str  # "construction", "flood", "vegetation"


class HealthResponse(BaseModel):
    """Health check response."""
    status: Literal["healthy", "degraded", "unhealthy"]
    version: str = "0.1.0"
    model_serving: str = "unknown"
    demo_mode: bool = False
    agents_available: int = 9
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
