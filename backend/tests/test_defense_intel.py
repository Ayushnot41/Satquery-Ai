"""Tests for Indian Armed Forces Defense Intelligence API."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_defense_hotspots_list():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/defense/hotspots")
        assert res.status_code == 200
        hotspots = res.json()
        assert len(hotspots) >= 8
        branches = {h["branch"] for h in hotspots}
        assert "NAVY" in branches
        assert "AIR_FORCE" in branches
        assert "ARMY_BSF" in branches


@pytest.mark.asyncio
async def test_defense_navy_analysis():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "branch": "NAVY",
            "hotspot_id": "NAVY-01",
            "lat": 14.7736,
            "lon": 74.1567,
            "tactical_query": "Detect surface combatants and dark vessels",
            "sensor": "Sentinel-1 SAR C-Band",
            "clearance_level": "SECRET",
        }
        res = await client.post("/api/defense/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["branch"] == "NAVY"
        assert len(data["detected_entities"]) > 0
        assert "Maritime Domain" in data["doctrine_justification"]
        assert data["threat_score_pct"] > 0


@pytest.mark.asyncio
async def test_defense_air_force_analysis():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "branch": "AIR_FORCE",
            "hotspot_id": "IAF-01",
            "lat": 30.3683,
            "lon": 76.8172,
            "tactical_query": "Bomb Damage Assessment on runway 09/27",
            "sensor": "Cartosat-3 Optical",
            "clearance_level": "TOP SECRET",
        }
        res = await client.post("/api/defense/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["branch"] == "AIR_FORCE"
        assert any(e["entity_type"] == "PRIMARY_RUNWAY" for e in data["detected_entities"])


@pytest.mark.asyncio
async def test_defense_army_bsf_analysis():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "branch": "ARMY_BSF",
            "hotspot_id": "ARMY-01",
            "lat": 35.4212,
            "lon": 77.1095,
            "tactical_query": "Track vehicle tracks and forward bunker positions",
            "sensor": "Sentinel-1 SAR",
            "clearance_level": "SECRET",
        }
        res = await client.post("/api/defense/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["branch"] == "ARMY_BSF"
        assert any("BUNKER" in e["classification"].upper() or "FORTIFICATION" in e["entity_type"] for e in data["detected_entities"])


@pytest.mark.asyncio
async def test_defense_tactical_layers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/defense/tactical-layers")
        assert res.status_code == 200
        layers = res.json()["layers"]
        assert any(l["id"] == "mgrs_grid" for l in layers)
        assert any(l["id"] == "eez_boundary" for l in layers)
