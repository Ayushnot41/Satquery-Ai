"""Tests for Real InSAR Interferometry Processing Engine and Futuristic APIs."""

import numpy as np
import pytest
from app.geospatial.insar import InSARProcessor, SENTINEL1_C_BAND_WAVELENGTH_MM
from app.api.futuristic import insar_engine


def test_insar_processor_slc_formation_and_coherence():
    """Verify complex interferogram formation and multi-look coherence estimation."""
    processor = InSARProcessor()
    h, w = 128, 128

    master, slave = processor.generate_synthetic_slc_pair(shape=(h, w), max_displacement_mm=-25.0)

    assert master.shape == (h, w)
    assert slave.shape == (h, w)
    assert np.iscomplexobj(master)
    assert np.iscomplexobj(slave)

    interf = processor.form_interferogram(master, slave)
    assert interf.shape == (h, w)
    assert np.iscomplexobj(interf)

    coherence = processor.estimate_coherence(master, slave, window_size=5)
    assert coherence.shape == (h, w)
    assert np.all(coherence >= 0.0)
    assert np.all(coherence <= 1.0)
    assert np.mean(coherence) > 0.3


def test_insar_phase_unwrapping_and_displacement():
    """Verify 2D phase unwrapping and conversion to millimeters."""
    processor = InSARProcessor()
    h, w = 64, 64

    # Simulated wrapped phase with gradient
    wrapped = np.random.uniform(-np.pi, np.pi, size=(h, w)).astype(np.float32)
    unwrapped = processor.unwrap_phase_poisson(wrapped)

    assert unwrapped.shape == (h, w)
    assert np.all(np.isfinite(unwrapped))

    disp_mm = processor.compute_los_displacement(unwrapped)
    assert disp_mm.shape == (h, w)
    assert np.all(np.isfinite(disp_mm))


def test_insar_end_to_end_pipeline():
    """Verify full InSAR execution with geodetic risk classification."""
    res = insar_engine.process(lat=30.5564, lon=79.5630, temporal_baseline_days=12)

    assert res.coherence_mean > 0.0
    assert len(res.points) > 0
    assert res.risk_level in ["CRITICAL_SUBSIDENCE", "MODERATE_SUBSIDENCE", "STABLE"]
    assert "wavelength_cm" in res.metadata

    # Check that individual points have valid geodetic keys
    pt = res.points[0]
    assert "point_id" in pt
    assert "lat" in pt
    assert "lon" in pt
    assert "displacement_mm_year" in pt
    assert "coherence" in pt
    assert "risk_classification" in pt
