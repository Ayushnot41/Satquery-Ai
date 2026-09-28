from typing import Any, Optional
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile

from ..core.config import settings
from ..core.security import ensure_safe_path, sanitize_filename, validate_file_extension
from ..geospatial.raster import extract_metadata
from ..schemas.imagery import ImageryMetadata, ImageryUploadResponse
from ..services.image_comparison import perform_bi_temporal_comparison

router = APIRouter(prefix="/imagery", tags=["Imagery"])

# In-memory registry for uploaded imagery records
IMAGERY_REGISTRY: dict[str, ImageryMetadata] = {}


@router.post("/upload", response_model=ImageryUploadResponse)
async def upload_image(file: UploadFile = File(...)) -> ImageryUploadResponse:
    """Upload a satellite image (GeoTIFF, JP2, PNG, JPEG) and parse geospatial metadata."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    safe_name = sanitize_filename(file.filename)
    if not validate_file_extension(safe_name):
        raise HTTPException(status_code=400, detail=f"Unsupported file format: {safe_name}")

    image_id = f"img-{uuid.uuid4().hex[:8]}"
    upload_dir = settings.upload_path
    target_path = ensure_safe_path(f"{image_id}_{safe_name}", str(upload_dir))

    # Guard against disk-exhaustion upload attacks
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    if file_size > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Uploaded file size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed size of {settings.max_upload_size_mb} MB"
        )

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        metadata = extract_metadata(target_path, image_id)
        IMAGERY_REGISTRY[image_id] = metadata
        return ImageryUploadResponse(
            id=image_id,
            filename=safe_name,
            metadata=metadata,
            preview_url=f"/static/uploads/{target_path.name}",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process imagery metadata: {e}")


@router.get("/{image_id}", response_model=ImageryMetadata)
async def get_imagery_metadata(image_id: str) -> ImageryMetadata:
    """Retrieve metadata for an uploaded or cached satellite image."""
    if image_id not in IMAGERY_REGISTRY:
        raise HTTPException(status_code=404, detail="Imagery not found")
    return IMAGERY_REGISTRY[image_id]


@router.get("", response_model=list[ImageryMetadata])
async def list_all_imagery() -> list[ImageryMetadata]:
    """List all registered imagery in the workspace."""
    return list(IMAGERY_REGISTRY.values())


@router.post("/compare")
async def compare_imagery_alias(
    request: Request,
    file_a: Optional[UploadFile] = File(None),
    file_b: Optional[UploadFile] = File(None),
    preset_a: Optional[str] = Form(None),
    preset_b: Optional[str] = Form(None),
    sensor_a: Optional[str] = Form(None),
    sensor_b: Optional[str] = Form(None),
    query: Optional[str] = Form(None),
) -> dict[str, Any]:
    """Alias for Siamese bi-temporal image comparison endpoint under /api/imagery/compare."""
    content_type = request.headers.get("content-type", "")
    source_a = None
    source_b = None
    resolved_sensor_a = sensor_a or "Sentinel-1 C-SAR (VV+VH)"
    resolved_sensor_b = sensor_b or "RISAT-1B Hybrid Polarimetric"
    resolved_query = query or "Analyze bi-temporal changes between past and current imagery"

    if "application/json" in content_type:
        try:
            body = await request.json()
            source_a = body.get("image_a") or body.get("preset_a") or "kerala_pre"
            source_b = body.get("image_b") or body.get("preset_b") or "kerala_post"
            resolved_sensor_a = body.get("sensor_a") or resolved_sensor_a
            resolved_sensor_b = body.get("sensor_b") or resolved_sensor_b
            resolved_query = body.get("query") or resolved_query
        except Exception:
            pass

    if source_a is None:
        if file_a is not None and file_a.filename:
            source_a = await file_a.read()
        elif preset_a:
            source_a = preset_a
        else:
            source_a = "kerala_pre"

    if source_b is None:
        if file_b is not None and file_b.filename:
            source_b = await file_b.read()
        elif preset_b:
            source_b = preset_b
        else:
            source_b = "kerala_post"

    return perform_bi_temporal_comparison(
        source_a=source_a,
        source_b=source_b,
        sensor_a=resolved_sensor_a,
        sensor_b=resolved_sensor_b,
        query=resolved_query,
    )

