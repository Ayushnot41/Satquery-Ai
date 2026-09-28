"""NASA Earthdata & GIBS Tile Proxy — authenticated satellite imagery tile server.

Proxies NASA GIBS WMTS tiles with the NASA Earthdata JWT Bearer token.
Supports: MODIS True Color, MODIS False Color (Bands 7-2-1), NDVI, Night Lights, Aerosol.

Frontend calls: GET /api/nasa-tile?layer=MODIS_Terra_CorrectedReflectance_TrueColor&date=2024-01-15&z=5&y=12&x=22
Backend injects: Authorization: Bearer <NASA_EARTHDATA_TOKEN>
"""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response

from ..core.config import settings
from ..core.logging import get_logger

logger = get_logger("api.nasa_tile")

router = APIRouter(prefix="/nasa-tile", tags=["NASA Earthdata & GIBS"])

# Validated GIBS WMTS layers available via Earthdata authentication
VALID_LAYERS = {
    "MODIS_Terra_CorrectedReflectance_TrueColor",
    "MODIS_Terra_CorrectedReflectance_Bands721",
    "MODIS_Aqua_CorrectedReflectance_TrueColor",
    "MODIS_Terra_NDVI_8Day",
    "VIIRS_SNPP_DayNightBand_ENCC",
    "MODIS_Terra_Aerosol",
    "MODIS_Terra_Land_Surface_Temp_Day",
    "VIIRS_SNPP_CorrectedReflectance_TrueColor",
}

# GIBS zoom level limits per layer (MODIS: max 9, VIIRS Day/Night: max 8)
LAYER_MAX_ZOOM = {
    "MODIS_Terra_CorrectedReflectance_TrueColor": 9,
    "MODIS_Terra_CorrectedReflectance_Bands721": 9,
    "MODIS_Aqua_CorrectedReflectance_TrueColor": 9,
    "MODIS_Terra_NDVI_8Day": 7,
    "VIIRS_SNPP_DayNightBand_ENCC": 8,
    "MODIS_Terra_Aerosol": 7,
    "MODIS_Terra_Land_Surface_Temp_Day": 7,
    "VIIRS_SNPP_CorrectedReflectance_TrueColor": 9,
}

GIBS_BASE = "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best"


@router.get("")
async def proxy_nasa_gibs_tile(
    layer: str = Query(..., description="NASA GIBS layer name"),
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
    z: int = Query(..., ge=0, le=15, description="Zoom level"),
    y: int = Query(..., ge=0, description="Tile Y coordinate"),
    x: int = Query(..., ge=0, description="Tile X coordinate"),
) -> Response:
    """Proxy authenticated NASA GIBS WMTS tiles with NASA Earthdata Bearer token.
    
    Supports all major MODIS Terra/Aqua and VIIRS SNPP datasets. Returns JPEG tile.
    Falls back to unauthenticated public endpoint if token is not configured.
    """
    if layer not in VALID_LAYERS:
        raise HTTPException(status_code=400, detail=f"Invalid layer. Valid options: {sorted(VALID_LAYERS)}")

    # Clamp zoom to layer maximum
    max_z = LAYER_MAX_ZOOM.get(layer, 9)
    z_clamped = min(z, max_z)
    matrix_set = f"GoogleMapsCompatible_Level{max_z}"

    # Build GIBS WMTS tile URL (EPSG:3857 uses GoogleMapsCompatible_Level{max_z})
    tile_url = f"{GIBS_BASE}/{layer}/default/{date}/{matrix_set}/{z_clamped}/{y}/{x}.jpg"

    # Build request headers — inject NASA Earthdata JWT token if configured
    headers: dict[str, str] = {
        "User-Agent": "BHUVISION/1.0 (SIH26167; ISRO; Team BANKAI)",
        "Accept": "image/jpeg,image/*;q=0.9,*/*;q=0.5",
    }
    if settings.nasa_earthdata_token:
        headers["Authorization"] = f"Bearer {settings.nasa_earthdata_token}"
        logger.debug("nasa_tile_auth", layer=layer, date=date, z=z_clamped, y=y, x=x)
    else:
        logger.warning("nasa_tile_no_auth", message="NASA_EARTHDATA_TOKEN not configured, using public endpoint")

    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            resp = await client.get(tile_url, headers=headers)

            if resp.status_code == 200:
                return Response(
                    content=resp.content,
                    media_type="image/jpeg",
                    headers={
                        "Cache-Control": "public, max-age=86400",  # Cache tiles for 24h
                        "X-NASA-Layer": layer,
                        "X-Tile-Date": date,
                        "X-Auth": "bearer" if settings.nasa_earthdata_token else "public",
                    }
                )
            elif resp.status_code in (400, 404):
                # GIBS near-real-time tiles can lag by 1-2 days — try yesterday and 2-days-prior
                from datetime import datetime, timedelta, timezone
                now_utc = datetime.now(timezone.utc)
                for day_offset in [1, 2, 3]:
                    fallback_date = (now_utc - timedelta(days=day_offset)).strftime("%Y-%m-%d")
                    fallback_url = f"{GIBS_BASE}/{layer}/default/{fallback_date}/{matrix_set}/{z_clamped}/{y}/{x}.jpg"
                    resp_fallback = await client.get(fallback_url, headers=headers)
                    if resp_fallback.status_code == 200:
                        return Response(
                            content=resp_fallback.content,
                            media_type="image/jpeg",
                            headers={"Cache-Control": "public, max-age=3600", "X-Fallback-Date": fallback_date},
                        )

            # Ultimate fallback to ESRI World Imagery if NASA layer is temporarily unreachable
            esri_url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            esri_resp = await client.get(esri_url)
            if esri_resp.status_code == 200:
                return Response(
                    content=esri_resp.content,
                    media_type="image/jpeg",
                    headers={"Cache-Control": "public, max-age=86400", "X-Fallback-Source": "esri-world-imagery"},
                )

            raise HTTPException(status_code=resp.status_code, detail=f"GIBS returned: {resp.status_code}")

    except httpx.TimeoutException:
        # Fallback to ESRI on timeout
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                esri_url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                esri_resp = await client.get(esri_url)
                if esri_resp.status_code == 200:
                    return Response(
                        content=esri_resp.content,
                        media_type="image/jpeg",
                        headers={"Cache-Control": "public, max-age=86400", "X-Fallback-Source": "esri-world-imagery"},
                    )
        except Exception:
            pass
        raise HTTPException(status_code=504, detail="NASA GIBS tile request timed out")
    except httpx.RequestError as exc:
        logger.error("nasa_tile_error", error=str(exc))
        raise HTTPException(status_code=502, detail=f"Failed to fetch NASA tile: {exc}")


@router.get("/layers")
async def get_nasa_gibs_layers() -> dict:
    """List all available NASA GIBS layers with metadata."""
    return {
        "authenticated": bool(settings.nasa_earthdata_token),
        "token_configured": bool(settings.nasa_earthdata_token),
        "gibs_base_url": GIBS_BASE,
        "layers": [
            {
                "id": "MODIS_Terra_CorrectedReflectance_TrueColor",
                "name": "MODIS Terra True Color",
                "description": "Daily near-true-color composite from Terra MODIS (Bands 1, 4, 3)",
                "resolution_m": 250,
                "max_zoom": 9,
                "update_cadence": "Daily",
                "sensor": "MODIS Terra",
            },
            {
                "id": "MODIS_Terra_CorrectedReflectance_Bands721",
                "name": "MODIS Terra False Color (7-2-1)",
                "description": "False color composite highlighting vegetation (green), bare soil (brown), snow (cyan)",
                "resolution_m": 250,
                "max_zoom": 9,
                "update_cadence": "Daily",
                "sensor": "MODIS Terra",
            },
            {
                "id": "VIIRS_SNPP_DayNightBand_ENCC",
                "name": "VIIRS Night Lights (Day-Night Band)",
                "description": "Nighttime luminescence — artificial light pollution and human settlement density",
                "resolution_m": 500,
                "max_zoom": 8,
                "update_cadence": "Daily",
                "sensor": "VIIRS SNPP",
            },
            {
                "id": "MODIS_Terra_NDVI_8Day",
                "name": "MODIS NDVI (8-Day Composite)",
                "description": "Normalized Difference Vegetation Index — vegetation health and density",
                "resolution_m": 250,
                "max_zoom": 7,
                "update_cadence": "8-Day Rolling Composite",
                "sensor": "MODIS Terra",
            },
            {
                "id": "MODIS_Terra_Aerosol",
                "name": "MODIS Aerosol Optical Depth",
                "description": "Atmospheric aerosol and smoke/dust particle density",
                "resolution_m": 10000,
                "max_zoom": 7,
                "update_cadence": "Daily",
                "sensor": "MODIS Terra",
            },
        ],
    }
