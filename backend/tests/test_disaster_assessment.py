"""Tests for Disaster Risk Probability and Connected Evacuation Corridors."""

import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_disaster_flood_assessment():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "location_name": "Brahmaputra Flood Plain, Assam",
            "lat": 26.2006,
            "lon": 92.9376,
            "disaster_type": "flood",
            "weather_condition": "Monsoon Inundation > 150mm",
        }
        res = await client.post("/api/traffic/disaster-assessment", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["disaster_type"] == "FLOOD"
        assert data["disaster_probability_pct"] > 70.0
        assert data["hazard_severity"] in ["HIGH", "CRITICAL"]
        assert data["affected_area_sqkm"] > 0
        assert data["evacuation_corridor"]["alternate_route_available"] is True


@pytest.mark.asyncio
async def test_disaster_landslide_assessment():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "location_name": "Kedarnath Valley, Uttarakhand",
            "lat": 30.7346,
            "lon": 79.0669,
            "disaster_type": "landslide",
        }
        res = await client.post("/api/traffic/disaster-assessment", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["disaster_type"] == "LANDSLIDE"
        assert "InSAR" in data["satellite_evidence"]["radar_justification"]


@pytest.mark.asyncio
async def test_evacuation_corridor_post_json():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "origin_lat": 26.2006,
            "origin_lon": 92.9376,
            "dest_lat": 26.2800,
            "dest_lon": 93.0100,
            "disaster_type": "flood_inundation",
        }
        res = await client.post("/api/traffic/evacuation-corridor", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["primary_route_status"] == "compromised"
        assert data["alternate_route_available"] is True
        assert len(data["traffic_segments"]) == 2
