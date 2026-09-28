"""Tests for Interactive Benchmark Metrics and Test Sample Execution."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_metric_detail_vqa():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/benchmark/metric/vqa_acc")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        m = data["metric"]
        assert m["id"] == "vqa_acc"
        assert "Accuracy =" in m["formula"]
        assert "confusion_matrix" in m
        assert m["confusion_matrix"]["true_positive"] > 0


@pytest.mark.asyncio
async def test_metric_detail_change_detection():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/benchmark/metric/cd_f1")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        m = data["metric"]
        assert m["dataset"] == "LEVIR-CD (Urban Construction Change)"
        assert "Siamese U-Net" in m["gain"]


@pytest.mark.asyncio
async def test_benchmark_test_sample():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/benchmark/test-sample?metric_id=vqa_acc")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "success"
        assert data["validation_verdict"] == "CERTIFIED_ISRO_COMPLIANT"
        assert "sample" in data
