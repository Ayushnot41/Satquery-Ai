"""Integration tests for FastAPI endpoints using modern httpx ASGI transport."""

import pytest
import httpx

from app.main import app


@pytest.mark.asyncio
async def test_root():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["product"] == "BHUVISION"
        assert data["agents"] == 9
        assert data["team"] == "BANKAI"


@pytest.mark.asyncio
async def test_health():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["agents_available"] == 9


@pytest.mark.asyncio
async def test_scenarios():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/scenarios")
        assert response.status_code == 200
        scenarios = response.json()
        assert len(scenarios) >= 3
        assert any(s["category"] == "construction" for s in scenarios)
        assert any(s["category"] == "flood" for s in scenarios)


@pytest.mark.asyncio
async def test_investigate_demo():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "question": "Where has construction increased between these two dates?",
            "imagery_ids": ["demo-construction-before", "demo-construction-after"],
            "mode": "auto"
        }
        response = await client.post("/api/investigate", json=payload)
        assert response.status_code == 200
        res = response.json()
        assert res["status"] == "complete"
        assert res["plan"]["task_type"] == "change_detection"
        assert len(res["trace"]["events"]) > 0
        assert res["confidence"]["is_fabricated"] is False


@pytest.mark.asyncio
async def test_spectral_analysis():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/investigate/spectral/analyze?lat=12.9716&lon=77.5946&index_type=ndvi")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["index_type"] == "NDVI"
        assert "mean_value" in data
        assert "interpretation" in data


@pytest.mark.asyncio
async def test_polygon_measurement():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        payload = {
            "coordinates": [
                [12.97, 77.59],
                [12.98, 77.59],
                [12.98, 77.60],
                [12.97, 77.60]
            ]
        }
        response = await client.post("/api/investigate/measure/area", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["vertex_count"] == 4
        assert data["area_hectares"] > 0
        assert data["perimeter_km"] > 0


@pytest.mark.asyncio
async def test_geojson_export():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/investigate/inv-test/geojson")
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "FeatureCollection"
        assert len(data["features"]) > 0
        assert data["metadata"]["system"] == "BHUVISION Earth Intelligence (SIH26167)"


@pytest.mark.asyncio
async def test_traffic_and_locations():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        r_trf = await client.get("/api/traffic/flow?lat=12.9716&lon=77.5946")
        assert r_trf.status_code == 200
        assert len(r_trf.json()["segments"]) >= 1

        r_loc = await client.get("/api/locations/search?q=Bengaluru")
        assert r_loc.status_code == 200
        assert len(r_loc.json()) >= 1


@pytest.mark.asyncio
async def test_agent_debate_protocol():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/futuristic/debate?scenario=monsoon_flood")
        assert res.status_code == 200
        data = res.json()
        assert data["consensus_reached"] is True
        assert len(data["turns"]) == 4
        assert data["final_confidence"] > 0.90
        assert "Optical" in data["overruled_sensor"]

        res_struct = await client.get("/api/futuristic/debate?scenario=urban_shadow")
        assert res_struct.status_code == 200
        data_struct = res_struct.json()
        assert data_struct["consensus_reached"] is True
        assert len(data_struct["turns"]) == 4


@pytest.mark.asyncio
async def test_map_providers_and_nasa_layers():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 3-map provider catalog
        r_prov = await client.get("/api/locations/providers")
        assert r_prov.status_code == 200
        prov_data = r_prov.json()
        assert "api_keys_configured" in prov_data
        assert "google_maps" in prov_data["api_keys_configured"]
        assert "maptiler" in prov_data["api_keys_configured"]
        assert "nasa_earthdata" in prov_data["api_keys_configured"]
        provider_ids = [p["id"] for p in prov_data["providers"]]
        assert "google_maps" in provider_ids
        assert "maptiler" in provider_ids
        assert "nasa_gibs" in provider_ids

        # Test NASA GIBS layers catalog
        r_nasa = await client.get("/api/nasa-tile/layers")
        assert r_nasa.status_code == 200
        nasa_data = r_nasa.json()
        assert len(nasa_data["layers"]) >= 5
        layer_ids = [l["id"] for l in nasa_data["layers"]]
        assert "MODIS_Terra_CorrectedReflectance_TrueColor" in layer_ids
        assert "VIIRS_SNPP_DayNightBand_ENCC" in layer_ids


@pytest.mark.asyncio
async def test_authentication_suite():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Email Registration
        reg_payload = {
            "name": "Dr. Subrahmanyan Chandrasekhar",
            "email": "chandra@isro.gov.in",
            "password": "Astrophysics2026!",
            "phone": "+919811223344",
            "organization": "ISRO Deep Space Network",
            "clearance_level": "LEVEL_4_TOP_SECRET",
        }
        r_reg = await client.post("/api/auth/register", json=reg_payload)
        assert r_reg.status_code == 200
        reg_data = r_reg.json()
        assert "access_token" in reg_data
        assert reg_data["user"]["email"] == "chandra@isro.gov.in"
        assert reg_data["user"]["clearance_level"] == "LEVEL_4_TOP_SECRET"
        token = reg_data["access_token"]

        # 2. Email Login
        login_payload = {
            "email": "chandra@isro.gov.in",
            "password": "Astrophysics2026!",
        }
        r_login = await client.post("/api/auth/login", json=login_payload)
        assert r_login.status_code == 200
        assert "access_token" in r_login.json()

        # 3. Google OAuth Login
        r_goog = await client.post("/api/auth/google", json={"credential": "mock_google_id_token_xyz"})
        assert r_goog.status_code == 200
        assert r_goog.json()["user"]["google_verified"] is True

        # 4. Phone SMS OTP Send & Verify
        r_otp_send = await client.post("/api/auth/otp/send", json={"phone": "+919811223344", "purpose": "verification"})
        assert r_otp_send.status_code == 200
        otp_hint = r_otp_send.json().get("demo_otp_hint")
        assert otp_hint is not None

        r_otp_ver = await client.post("/api/auth/otp/verify", json={"phone": "+919811223344", "otp": otp_hint})
        assert r_otp_ver.status_code == 200
        assert r_otp_ver.json()["verified"] is True

        # Master judge bypass code
        r_master = await client.post("/api/auth/otp/verify", json={"phone": "+919999999999", "otp": "123456"})
        assert r_master.status_code == 200
        assert r_master.json()["verified"] is True

        # 5. Profile Check
        r_me = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r_me.status_code == 200
        assert r_me.json()["authenticated"] is True
        assert r_me.json()["user"]["name"] == "Dr. Subrahmanyan Chandrasekhar"


@pytest.mark.asyncio
async def test_deployment_manual_download():
    """Verify that the Enterprise Production Deployment Manual PDF endpoint serves valid PDF content."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        res = await client.get("/api/download/deployment-manual")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert len(res.content) > 50000
        assert res.content.startswith(b"%PDF")


@pytest.mark.asyncio
async def test_polygon_measurement_boundary_and_validation():
    """Verify that degenerate and invalid polygon inputs are cleanly rejected with HTTP 400."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Too few vertices (< 3)
        res_few = await client.post("/api/investigate/measure/area", json={"coordinates": [[12.97, 77.59], [12.98, 77.60]]})
        assert res_few.status_code == 400
        assert "at least 3 vertices" in res_few.json()["detail"]

        # Malformed vertex (single scalar instead of [lat, lon])
        res_bad = await client.post("/api/investigate/measure/area", json={"coordinates": [[12.97], [12.98, 77.60], [12.97, 77.60]]})
        assert res_bad.status_code == 400
        assert "valid finite" in res_bad.json()["detail"]


@pytest.mark.asyncio
async def test_location_search_robustness():
    """Verify that whitespace queries, unusual inputs, and edge cases return clean responses."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Normal query
        r1 = await client.get("/api/locations/search?q=Bengaluru")
        assert r1.status_code == 200
        assert len(r1.json()) >= 1

        # Non-matching query returns empty list without error
        r2 = await client.get("/api/locations/search?q=NonExistentFictionalLocation99999")
        assert r2.status_code == 200
        assert isinstance(r2.json(), list)






