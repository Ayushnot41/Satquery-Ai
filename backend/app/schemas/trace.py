"""Execution trace and audit schemas for the BHUVISION agent system."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class TraceEventType(str, Enum):
    """Types of events in the execution trace."""
    AGENT_START = "agent_start"
    AGENT_COMPLETE = "agent_complete"
    AGENT_ERROR = "agent_error"
    TOOL_CALL = "tool_call"
    TOOL_RESULT = "tool_result"
    MODEL_INFERENCE = "model_inference"
    VALIDATION = "validation"
    ROUTING_DECISION = "routing_decision"
    EVIDENCE_PRODUCED = "evidence_produced"
    FALLBACK_USED = "fallback_used"
    WARNING = "warning"


class TraceEvent(BaseModel):
    """A single event in the investigation execution trace."""
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    event_type: TraceEventType
    agent_name: str
    agent_id: int = Field(..., ge=1, le=9, description="Agent number 1-9")
    message: str
    details: dict[str, Any] = Field(default_factory=dict)
    duration_ms: float | None = None
    model_used: str | None = None
    model_version: str | None = None


class ExecutionTrace(BaseModel):
    """Complete execution trace for an investigation."""
    investigation_id: str
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: datetime | None = None
    events: list[TraceEvent] = Field(default_factory=list)
    total_duration_ms: float | None = None
    agents_invoked: list[str] = Field(default_factory=list)
    models_used: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    errors: list[str] = Field(default_factory=list)
    fallbacks_used: list[str] = Field(default_factory=list)

    def add_event(self, event: TraceEvent) -> None:
        """Add an event to the trace."""
        self.events.append(event)
        if event.agent_name not in self.agents_invoked:
            self.agents_invoked.append(event.agent_name)
        if event.model_used and event.model_used not in self.models_used:
            self.models_used.append(event.model_used)
        if event.event_type == TraceEventType.WARNING:
            self.warnings.append(event.message)
        if event.event_type == TraceEventType.AGENT_ERROR:
            self.errors.append(event.message)
        if event.event_type == TraceEventType.FALLBACK_USED:
            self.fallbacks_used.append(event.message)

    def complete(self) -> None:
        """Mark the trace as complete."""
        self.completed_at = datetime.now(timezone.utc)
        if self.started_at and self.completed_at:
            delta = self.completed_at - self.started_at
            self.total_duration_ms = delta.total_seconds() * 1000
