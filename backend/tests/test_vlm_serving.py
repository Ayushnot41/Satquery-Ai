"""Tests for LocalLoRABackend and VLLMBackend serving integration."""

import numpy as np
import pytest

from app.models.local_lora_backend import LocalLoRABackend
from app.models.vllm_backend import VLLMBackend


@pytest.mark.asyncio
async def test_local_lora_backend_answers():
    """Verify that LocalLoRABackend loads adapter and produces grounded RS-VQA answers."""
    backend = LocalLoRABackend()
    assert backend.is_available() is True

    # Test flood inquiry
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    res = await backend.answer_question(img, "Where did flooding expand?")
    assert "flood" in res.answer.lower() or "hydrological" in res.answer.lower()
    assert res.model_name == "SmolVLM-500M-Instruct-LoRA"
    assert res.confidence > 0.8
    assert res.latency_ms > 0

    # Test urban construction inquiry
    res2 = await backend.answer_question(img, "Where has construction increased?")
    assert "built-up" in res2.answer.lower() or "construction" in res2.answer.lower()


@pytest.mark.asyncio
async def test_local_lora_caption_and_change():
    """Verify captioning and bi-temporal change analysis."""
    backend = LocalLoRABackend()
    img1 = np.zeros((64, 64, 3), dtype=np.uint8)
    img2 = np.ones((64, 64, 3), dtype=np.uint8) * 150

    cap = await backend.generate_caption(img1)
    assert len(cap.answer) > 20

    chg = await backend.analyze_change(img1, img2)
    assert "temporal" in chg.answer.lower() or "radiance" in chg.answer.lower()


@pytest.mark.asyncio
async def test_vllm_backend_fallback_resilience():
    """Verify that VLLMBackend safely falls back when local server is offline."""
    vllm = VLLMBackend(base_url="http://127.0.0.1:9999/v1")  # Unreachable port
    img = np.zeros((64, 64, 3), dtype=np.uint8)

    # Should not crash, should gracefully return grounded answer via fallback
    res = await vllm.answer_question(img, "Where has vegetation changed?")
    assert len(res.answer) > 10
    assert res.metadata.get("vllm_fallback") is True
