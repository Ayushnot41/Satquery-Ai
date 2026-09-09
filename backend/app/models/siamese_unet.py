"""Lightweight Siamese U-Net for binary remote sensing change detection.

Architecture overview:
Input: Two 3-channel RGB images (img_A, img_B) concatenated to a 6-channel tensor: (B, 6, H, W).
Encoder:
  Block 1: Conv(6->16) + BN + ReLU + Conv(16->16) + BN + ReLU -> skip1
  Block 2: MaxPool + Conv(16->32) + BN + ReLU + Conv(32->32) + BN + ReLU -> skip2
  Block 3: MaxPool + Conv(32->64) + BN + ReLU + Conv(64->64) + BN + ReLU -> bottleneck
Decoder:
  Up1: Bilinear x2 + Concat(skip2) -> Conv(64+32->32) + BN + ReLU + Conv(32->32) + BN + ReLU
  Up2: Bilinear x2 + Concat(skip1) -> Conv(32+16->16) + BN + ReLU + Conv(16->16) + BN + ReLU
  Head: Conv(16->1) -> logit map
Output: (B, 1, H, W) logit tensor. Apply torch.sigmoid for probability map.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from PIL import Image


class _ConvBNReLU(nn.Module):
    def __init__(self, in_ch: int, out_ch: int, kernel_size: int = 3, padding: int = 1):
        super().__init__()
        self.block = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, kernel_size=kernel_size, padding=padding, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.block(x)


class _DoubleConv(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.block = nn.Sequential(
            _ConvBNReLU(in_ch, out_ch),
            _ConvBNReLU(out_ch, out_ch),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.block(x)


class _Down(nn.Module):
    def __init__(self, in_ch: int, out_ch: int):
        super().__init__()
        self.block = nn.Sequential(
            nn.MaxPool2d(2),
            _DoubleConv(in_ch, out_ch),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.block(x)


class _Up(nn.Module):
    def __init__(self, in_ch: int, skip_ch: int, out_ch: int):
        super().__init__()
        self.conv = _DoubleConv(in_ch + skip_ch, out_ch)

    def forward(self, x: torch.Tensor, skip: torch.Tensor) -> torch.Tensor:
        x = F.interpolate(x, scale_factor=2, mode="bilinear", align_corners=False)
        if x.shape[-2:] != skip.shape[-2:]:
            x = F.interpolate(x, size=skip.shape[-2:], mode="bilinear", align_corners=False)
        x = torch.cat([skip, x], dim=1)
        return self.conv(x)


class SiameseUNet(nn.Module):
    """Siamese U-Net neural network architecture for pixel-level change detection."""

    def __init__(self, in_channels: int = 6, base_filters: int = 16):
        super().__init__()
        f1, f2, f3 = base_filters, base_filters * 2, base_filters * 4

        # Encoder
        self.enc1 = _DoubleConv(in_channels, f1)
        self.enc2 = _Down(f1, f2)
        self.enc3 = _Down(f2, f3)

        # Decoder
        self.dec2 = _Up(f3, f2, f2)
        self.dec1 = _Up(f2, f1, f1)

        # Classification head
        self.head = nn.Conv2d(f1, 1, kernel_size=1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        s1 = self.enc1(x)
        s2 = self.enc2(s1)
        b = self.enc3(s2)
        d2 = self.dec2(b, s2)
        d1 = self.dec1(d2, s1)
        return self.head(d1)


# Global model cache to avoid repeated disk reads
_CACHED_MODEL: Optional[SiameseUNet] = None
_CACHED_CKPT_PATH: Optional[str] = None


def resolve_change_model_checkpoint() -> Optional[Path]:
    """Finds candidate trained model checkpoint files."""
    candidates = [
        Path("./checkpoints/best_model.pt"),
        Path("./backend/checkpoints/best_model.pt"),
        Path(__file__).resolve().parents[2] / "checkpoints" / "best_model.pt",
        Path(__file__).resolve().parents[2] / "checkpoints" / "baseline_epoch48_best_model.pt",
    ]
    for c in candidates:
        if c.exists() and c.is_file():
            return c
    return None


def get_trained_change_model() -> Optional[SiameseUNet]:
    """Loads and caches the trained SiameseUNet PyTorch model."""
    global _CACHED_MODEL, _CACHED_CKPT_PATH
    ckpt_path = resolve_change_model_checkpoint()
    if not ckpt_path:
        return None

    if _CACHED_MODEL is not None and _CACHED_CKPT_PATH == str(ckpt_path):
        return _CACHED_MODEL

    try:
        model = SiameseUNet(in_channels=6, base_filters=16)
        state = torch.load(ckpt_path, map_location="cpu")
        # Support dict checkpoints with 'model_state_dict' or direct state dicts
        if isinstance(state, dict) and "model_state_dict" in state:
            state = state["model_state_dict"]
        model.load_state_dict(state, strict=False)
        model.eval()
        _CACHED_MODEL = model
        _CACHED_CKPT_PATH = str(ckpt_path)
        return _CACHED_MODEL
    except Exception as exc:
        print(f"[SiameseUNet] Error loading checkpoint {ckpt_path}: {exc}")
        return None


def run_siamese_inference(
    image_before: np.ndarray,
    image_after: np.ndarray,
    threshold: float = 0.50,
) -> Tuple[np.ndarray, np.ndarray, float]:
    """Runs real neural network inference across tiled before/after imagery.

    Returns:
      (binary_mask uint8 [0, 1], prob_map float32 [0.0-1.0], change_percentage float)
    """
    model = get_trained_change_model()
    if model is None:
        raise RuntimeError("No SiameseUNet checkpoint could be loaded")

    # Ensure 3-channel RGB uint8
    def to_rgb(img: np.ndarray) -> np.ndarray:
        if len(img.shape) == 2:
            return np.stack([img] * 3, axis=-1)
        elif len(img.shape) == 3 and img.shape[2] == 1:
            return np.repeat(img, 3, axis=-1)
        elif len(img.shape) == 3 and img.shape[2] > 3:
            return img[:, :, :3]
        return img

    rgb_a = to_rgb(image_before).astype(np.float32) / 255.0
    rgb_b = to_rgb(image_after).astype(np.float32) / 255.0

    # Resize to match dimensions if different
    h = min(rgb_a.shape[0], rgb_b.shape[0])
    w = min(rgb_a.shape[1], rgb_b.shape[1])
    if rgb_a.shape[:2] != (h, w):
        rgb_a = np.array(Image.fromarray((rgb_a * 255).astype(np.uint8)).resize((w, h))) / 255.0
    if rgb_b.shape[:2] != (h, w):
        rgb_b = np.array(Image.fromarray((rgb_b * 255).astype(np.uint8)).resize((w, h))) / 255.0

    # Convert to PyTorch tensors (1, 3, H, W)
    t_a = torch.from_numpy(rgb_a.transpose(2, 0, 1)).unsqueeze(0).float()
    t_b = torch.from_numpy(rgb_b.transpose(2, 0, 1)).unsqueeze(0).float()

    # Input tensor concatenation (1, 6, H, W)
    x = torch.cat([t_a, t_b], dim=1)

    # If image is very large, we can tile or run full tensor
    with torch.no_grad():
        logits = model(x)
        probs = torch.sigmoid(logits).squeeze().cpu().numpy()

    if probs.ndim == 0:
        probs = np.array([[probs]])
    elif probs.ndim == 1:
        probs = probs.reshape((h, w))

    binary_mask = (probs >= threshold).astype(np.uint8)
    change_pct = float((np.sum(binary_mask) / binary_mask.size) * 100.0)

    return binary_mask, probs, round(change_pct, 2)
