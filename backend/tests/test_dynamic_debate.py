"""Tests for Dynamic Agent Debate over Arbitrary Locations."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_dynamic_debate_maritime_karwar():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/debate?target_location=Karwar Naval Base Coast&scenario=vessel_patrol")
        assert res.status_code == 200
        data = res.json()
        assert data["consensus_reached"] is True
        assert "Maritime" in data["dispute_topic"] or "Dark Vessel" in data["dispute_topic"]
        assert len(data["turns"]) == 4


@pytest.mark.asyncio
async def test_dynamic_debate_siachen_glacier():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/debate?target_location=Siachen Glacier Sector&scenario=snow_avalanche")
        assert res.status_code == 200
        data = res.json()
        assert data["consensus_reached"] is True
        assert "Glacial" in data["dispute_topic"] or "Slope" in data["dispute_topic"]
        assert any("InSAR" in t["argument"] for t in data["turns"])


@pytest.mark.asyncio
async def test_dynamic_debate_ambala_airbase():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/debate?target_location=Ambala Air Force Station&scenario=runway_inspection")
        assert res.status_code == 200
        data = res.json()
        assert data["consensus_reached"] is True
        assert "Runway" in data["dispute_topic"]
