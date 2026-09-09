"""Tests for Neural Siamese U-Net model and checkpoint integrity."""

import numpy as np
import pytest
from pathlib import Path

from app.models.siamese_unet import (
    SiameseUNet,
    ensure_checkpoint_exists,
    is_siamese_available,
    run_siamese_inference,
)


def test_checkpoint_exists_and_size():
    """Verify that Siamese checkpoint file exists and is approximately 1.48 MB."""
    ckpt = ensure_checkpoint_exists()
    assert ckpt.exists(), "Checkpoint file must exist on disk"
    # Target size: ~1.48 MB (+/- 5%)
    size_mb = ckpt.stat().st_size / (1024 * 1024)
    assert 1.35 <= size_mb <= 1.60, f"Checkpoint size {size_mb:.2f} MB not in expected ~1.48 MB range"
    assert is_siamese_available() is True


def test_siamese_inference_synthetic_pair():
    """Verify Siamese U-Net inference on synthetic before/after satellite images."""
    np.random.seed(42)
    # Create T1 baseline (greenish agriculture)
    t1 = np.full((256, 256, 3), 100, dtype=np.uint8)
    t1[:, :, 1] = 160

    # Create T2 with a distinct change box (urban expansion / bright roof)
    t2 = t1.copy()
    t2[50:120, 50:120, :] = 240

    result = run_siamese_inference(t1, t2, threshold=0.45)

    assert result["has_change"] is True
    assert result["change_percentage"] > 0.0
    assert result["confidence"] > 0.0
    assert result["change_mask"].shape == (256, 256)
    assert result["probability_map"].shape == (256, 256)
    assert "model_name" in result
    assert "Siamese-UNet" in result["model_name"]
    assert result["total_changed_pixels"] > 0


def test_siamese_inference_identical_pair():
    """Verify Siamese U-Net inference on identical images produces minimal/no change."""
    t1 = np.full((128, 128, 3), 120, dtype=np.uint8)
    t2 = t1.copy()

    result = run_siamese_inference(t1, t2, threshold=0.60)
    # For identical images, change percentage should be very low or zero
    assert result["change_percentage"] < 5.0
