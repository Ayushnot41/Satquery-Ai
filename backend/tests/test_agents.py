"""Unit tests for the 9 BHUVISION agents and SAR processing."""

from pathlib import Path
import numpy as np
import pytest

from app.agents.audit_trace import AuditTraceAgent
from app.agents.change_detection import ChangeDetectionAgent
from app.agents.confidence_agent import ConfidenceAgent
from app.agents.evidence_fusion import EvidenceFusionAgent
from app.agents.input_validation import InputValidationAgent
from app.agents.query_planner import QueryPlannerAgent
from app.agents.sensor_router import SensorRouterAgent
from app.agents.visual_grounding import VisualGroundingAgent
from app.agents.vqa_agent import VQAAgent
from app.geospatial.sar import SARProcessor, calibrate_to_db
from app.models.demo_backend import DemoBackend
from app.schemas.agents import ConfidenceLevel, TaskType
from app.schemas.imagery import GeoMetadata, ImageryInput, ImageryMetadata, SensorType
from app.schemas.trace import ExecutionTrace


@pytest.mark.asyncio
async def test_query_planner_change_detection():
    planner = QueryPlannerAgent()
    trace = ExecutionTrace(investigation_id="test-1")
    plan = await planner.plan("Where has construction increased between these two dates?", trace)
    
    assert plan.task_type == TaskType.CHANGE_DETECTION
    assert plan.requires_temporal is True
    assert plan.requires_grounding is True
    assert len(plan.suggested_tools) > 0


@pytest.mark.asyncio
async def test_query_planner_flood_sar():
    planner = QueryPlannerAgent()
    trace = ExecutionTrace(investigation_id="test-2")
    plan = await planner.plan("Where did flooding expand and can SAR detect it?", trace)
    
    assert plan.requires_sar is True


@pytest.mark.asyncio
async def test_input_validation():
    validator = InputValidationAgent()
    trace = ExecutionTrace(investigation_id="test-3")
    
    # Valid mock imagery input
    geo = GeoMetadata(width=256, height=256, band_count=3, crs="EPSG:4326")
    meta = ImageryMetadata(id="img-1", filename="test.png", sensor_type=SensorType.OPTICAL, geo=geo)
    # Using existing test file
    gitignore_path = str(Path(__file__).resolve().parents[2] / ".gitignore")
    inp = ImageryInput(id="img-1", path=gitignore_path, metadata=meta, role="primary")
    
    res = await validator.validate([inp], trace)
    assert res.file_valid is True
    assert res.dimensions_valid is True


@pytest.mark.asyncio
async def test_sensor_router():
    router = SensorRouterAgent()
    trace = ExecutionTrace(investigation_id="test-4")
    
    planner = QueryPlannerAgent()
    plan = await planner.plan("Where did flooding expand?", trace)
    
    meta_opt = ImageryMetadata(id="opt", filename="opt.png", sensor_type=SensorType.OPTICAL)
    meta_sar = ImageryMetadata(id="sar", filename="sar.png", sensor_type=SensorType.SAR)
    
    img_opt = ImageryInput(id="opt", path="dummy", metadata=meta_opt)
    img_sar = ImageryInput(id="sar", path="dummy", metadata=meta_sar)
    
    decision = await router.route(plan, [img_opt, img_sar], trace)
    assert decision.optical_available is True
    assert decision.sar_available is True


@pytest.mark.asyncio
async def test_change_detection():
    detector = ChangeDetectionAgent()
    trace = ExecutionTrace(investigation_id="test-5")
    
    img_before = np.zeros((100, 100, 3), dtype=np.uint8)
    img_after = np.zeros((100, 100, 3), dtype=np.uint8)
    # Add a large changed region in the center
    img_after[30:70, 30:70, :] = 255
    
    result = await detector.detect_changes(img_before, img_after, trace, threshold=30)
    assert result.has_change is True
    assert len(result.change_regions) > 0
    assert result.change_percentage > 10.0


def test_sar_processor():
    sar = SARProcessor()
    # Create synthetic SAR backscatter with a dark water patch
    data = np.ones((100, 100), dtype=np.float32) * 50.0  # Land returns
    data[20:50, 20:50] = 0.01  # Very low backscatter = specular water
    
    evidence = sar.process(data, filter_speckle=False)
    assert evidence.has_water is True
    assert evidence.water_area_percentage > 5.0
    assert "SAR backscatter" in evidence.summary


@pytest.mark.asyncio
async def test_confidence_and_trace():
    trace = ExecutionTrace(investigation_id="test-6")
    vqa_agent = VQAAgent(DemoBackend())
    
    dummy_img = np.zeros((100, 100, 3), dtype=np.uint8)
    vqa_res = await vqa_agent.answer(dummy_img, "Where has construction increased?", trace)
    
    fusion = EvidenceFusionAgent()
    fused = await fusion.fuse(vqa_result=vqa_res, change_result=None, grounding=None, sensor_decision=None, trace=trace)
    
    conf_agent = ConfidenceAgent()
    conf = await conf_agent.assess(fused, trace=trace)
    
    assert conf.is_fabricated is False
    assert conf.overall_confidence in [ConfidenceLevel.HIGH, ConfidenceLevel.MODERATE, ConfidenceLevel.LOW, ConfidenceLevel.UNKNOWN]
    
    audit = AuditTraceAgent()
    final_trace = await audit.finalize_trace(trace)
    assert len(final_trace.events) > 0
    assert final_trace.total_duration_ms is not None
