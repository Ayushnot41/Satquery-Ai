"""Tests for SAR Reader and Radar Physics API."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_sar_presets():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/sar-reader/presets")
        assert res.status_code == 200
        presets = res.json()
        assert len(presets) >= 4
        preset_ids = {p["id"] for p in presets}
        assert "brahmaputra_flood" in preset_ids
        assert "joshimath_subsidence" in preset_ids


@pytest.mark.asyncio
async def test_sar_processing_vv():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "preset_id": "brahmaputra_flood",
            "polarization": "VV",
            "apply_lee_filter": True,
            "filter_window_size": 5,
            "water_threshold_db": -15.0,
            "urban_threshold_db": -6.0,
        }
        res = await client.post("/api/sar-reader/process", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["polarization"] == "VV"
        assert len(data["histogram"]) > 0
        assert data["water_coverage_pct"] > 0
        assert "insar_subsidence_profile" in data
        assert "Enhanced Lee Filter" in data["filter_applied"]


@pytest.mark.asyncio
async def test_sar_processing_cross_pol_ratio():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "preset_id": "karwar_naval_dock",
            "polarization": "VV_VH_RATIO",
            "apply_lee_filter": False,
        }
        res = await client.post("/api/sar-reader/process", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["polarization"] == "VV_VH_RATIO"
        assert "Raw Unfiltered" in data["filter_applied"]
