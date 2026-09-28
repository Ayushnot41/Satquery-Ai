"""Investigation request/response schemas — the main API contract."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field

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
    question: str = Field(..., min_length=3, max_length=2000)
    imagery_ids: list[str] = Field(..., min_length=1, max_length=10)
    mode: InvestigationMode = InvestigationMode.AUTO
    demo_scenario: str | None = Field(
        None, description="If set, use deterministic demo data for this scenario"
    )


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
