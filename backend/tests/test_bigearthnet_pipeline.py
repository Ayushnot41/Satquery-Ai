import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from pipeline.bigearthnet.acquire import (
    download_parquet_manifest,
    acquire_sample_pairs,
    stream_bigearthnet_manifest,
    get_dataset_metadata
)

def test_bigearthnet_metadata_fetch():
    meta = get_dataset_metadata()
    assert "modalities" in meta or "id" in meta

def test_bigearthnet_parquet_generation_and_streaming(tmp_path):
    target_dir = tmp_path / "bigearthnet"
    parquet_path = download_parquet_manifest(str(target_dir), split="train")
    assert parquet_path.exists()
    assert parquet_path.stat().st_size > 50

    # Test streaming iterator
    records = list(stream_bigearthnet_manifest(parquet_path))
    assert len(records) >= 4
    first = records[0]
    assert "patch_id" in first
    assert "task_category" in first

def test_bigearthnet_sample_pair_caching(tmp_path):
    samples_dir = tmp_path / "samples"
    pairs = acquire_sample_pairs(str(samples_dir), count=2)
    assert len(pairs) == 2
    for p in pairs:
        assert Path(p["optical_path"]).exists()
        assert Path(p["sar_path"]).exists()
