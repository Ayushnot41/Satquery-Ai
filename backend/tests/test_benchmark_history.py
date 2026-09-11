import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_benchmark_protocol_and_run():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Check protocol initial
        resp = await client.get("/api/benchmark/protocol")
        assert resp.status_code == 200
        data = resp.json()
        assert "categories" in data
        assert len(data["categories"]) == 4

        # 2. Run benchmark evaluation
        resp_run = await client.post("/api/benchmark/run")
        assert resp_run.status_code == 200
        run_data = resp_run.json()
        assert run_data["is_evaluated"] is True
        # Check that VQA accuracy is populated
        vqa_cat = next(c for c in run_data["categories"] if c["category_id"] == "vqa")
        acc_metric = next(m for m in vqa_cat["metrics"] if m["id"] == "vqa_acc")
        assert acc_metric["value"] == "84.9%"
        assert acc_metric["evaluated"] is True

        # 3. Reset protocol
        resp_reset = await client.post("/api/benchmark/reset")
        assert resp_reset.status_code == 200
        reset_data = resp_reset.json()
        assert reset_data["is_evaluated"] is False


@pytest.mark.asyncio
async def test_investigation_history_and_cache():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Get history list
        resp = await client.get("/api/investigate")
        assert resp.status_code == 200
        items = resp.json()
        assert isinstance(items, list)
        assert len(items) >= 4

        # 2. Clear cache
        resp_clear = await client.post("/api/investigate/clear-cache")
        assert resp_clear.status_code == 200
        assert resp_clear.json()["status"] == "cleared"

        # 3. Delete an item
        resp_del = await client.delete("/api/investigate/analysis-004")
        assert resp_del.status_code == 200
        assert resp_del.json()["status"] == "deleted"

        # 4. Confirm it was deleted
        resp_list = await client.get("/api/investigate")
        ids = [x["investigation_id"] for x in resp_list.json()]
        assert "analysis-004" not in ids
