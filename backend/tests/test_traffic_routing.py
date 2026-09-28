"""Tests for Traffic Flow, Navigation Directions, and Evacuation Routing."""
import pytest
import httpx
from app.main import app

@pytest.mark.asyncio
async def test_traffic_flow_procedural():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/traffic/flow", params={"lat": 26.1445, "lon": 91.7362, "radius_km": 5.0})
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "active"
        assert len(data["segments"]) >= 3
        assert "mean_delay_minutes" in data

@pytest.mark.asyncio
async def test_evacuation_corridor():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/traffic/evacuation-corridor", params={
            "origin_lat": 26.1445,
            "origin_lon": 91.7362,
            "dest_lat": 26.2000,
            "dest_lon": 91.8000,
            "disaster_type": "flood_inundation"
        })
        assert res.status_code == 200
        data = res.json()
        assert data["alternate_route_available"] is True
        assert len(data["traffic_segments"]) >= 2
        assert any("EVAC-ALTERNATE" in s["segment_id"] for s in data["traffic_segments"])

@pytest.mark.asyncio
async def test_turn_by_turn_directions():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.post("/api/traffic/directions", params={
            "origin_lat": 26.1445,
            "origin_lon": 91.7362,
            "dest_lat": 26.2000,
            "dest_lon": 91.8000,
            "avoid_flood_zones": True
        })
        assert res.status_code == 200
        data = res.json()
        assert data["is_flood_safe"] is True
        assert data["clearance_safety_score_pct"] > 90.0
        assert len(data["steps"]) >= 4
        assert len(data["polyline"]) >= 8
