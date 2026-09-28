import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_nasa_layers_metadata():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.get('/api/nasa-tile/layers')
        assert resp.status_code == 200
        data = resp.json()
        assert 'layers' in data
        assert len(data['layers']) > 0

@pytest.mark.asyncio
async def test_nasa_tile_proxy_invalid_layer():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.get('/api/nasa-tile', params={'layer': 'INVALID', 'date': '2024-01-15', 'z': 5, 'y': 12, 'x': 22})
        assert resp.status_code == 400

@pytest.mark.asyncio
async def test_nasa_tile_proxy_valid_layer():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as client:
        resp = await client.get('/api/nasa-tile', params={'layer': 'MODIS_Terra_CorrectedReflectance_TrueColor', 'date': '2024-01-15', 'z': 4, 'y': 6, 'x': 11})
        assert resp.status_code == 200
        assert resp.headers.get('content-type') == 'image/jpeg'
        assert len(resp.content) > 1000
