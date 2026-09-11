"""Location search, geocoding, and satellite provider catalog API."""

from __future__ import annotations

from fastapi import APIRouter, Query

from ..core.config import settings
from ..geospatial.geocoding import HOTSPOT_REGISTRY, LocationResult, search_locations_sync

router = APIRouter(prefix="/locations", tags=["Locations & Geospatial"])


@router.get("/search", response_model=list[LocationResult])
async def search_locations(
    q: str = Query(..., min_length=1, description="Location name, city, landmark, or region"),
    limit: int = Query(6, ge=1, le=20),
) -> list[LocationResult]:
    """Search any location on Earth by name and return WGS84 bounding box and MGRS coordinates."""
    return search_locations_sync(query=q, limit=limit)


@router.get("/hotspots", response_model=list[LocationResult])
async def get_curated_hotspots() -> list[LocationResult]:
    """Retrieve strategic Indian and global remote sensing demonstration locations."""
    return HOTSPOT_REGISTRY


@router.get("/providers")
async def get_satellite_providers():
    """List all 3 operational map API providers with live credentials status."""
    google_ok = bool(settings.google_maps_api_key)
    maptiler_ok = bool(settings.maptiler_api_key)
    nasa_ok = bool(settings.nasa_earthdata_token)

    return {
        "api_keys_configured": {
            "google_maps": google_ok,
            "maptiler": maptiler_ok,
            "nasa_earthdata": nasa_ok,
        },
        "providers": [
            {
                "id": "google_maps",
                "name": "Google Maps Platform (Satellite Hybrid)",
                "description": "Photorealistic 2D/3D Satellite Tiles, Hybrid layer, and Places API.",
                "status": "configured" if google_ok else "key_missing",
                "auth_required": True,
                "key_set": google_ok,
                "resolution": "0.15m - 0.3m GSD",
                "update_cadence": "Continuous mosaic",
                "tile_url_template": f"https://maps.googleapis.com/maps/api/js?key={settings.google_maps_api_key}&v=beta&map_ids=..." if google_ok else None,
                "capabilities": ["satellite", "hybrid", "roadmap", "3d_tilt", "streetview"],
            },
            {
                "id": "maptiler",
                "name": "MapTiler Cloud (Satellite + Terrain-RGB)",
                "description": "High-resolution satellite imagery with Terrain-RGB 3D elevation, global coverage.",
                "status": "configured" if maptiler_ok else "key_missing",
                "auth_required": True,
                "key_set": maptiler_ok,
                "resolution": "0.5m GSD",
                "update_cadence": "Continuous mosaic",
                "tile_url_template": f"https://api.maptiler.com/tiles/satellite/{{z}}/{{x}}/{{y}}.jpg?key={settings.maptiler_api_key}" if maptiler_ok else None,
                "terrain_tile_url": f"https://api.maptiler.com/tiles/terrain-rgb/{{z}}/{{x}}/{{y}}.png?key={settings.maptiler_api_key}" if maptiler_ok else None,
                "capabilities": ["satellite", "terrain_rgb", "3d_terrain", "topojson_boundaries"],
            },
            {
                "id": "nasa_gibs",
                "name": "NASA GIBS / Earthdata (MODIS + VIIRS)",
                "description": "Near-real-time authenticated daily satellite composites from MODIS Terra/Aqua and VIIRS SNPP.",
                "status": "configured" if nasa_ok else "public_mode",
                "auth_required": True,
                "key_set": nasa_ok,
                "resolution": "250m - 500m GSD",
                "update_cadence": "Every 24 Hours",
                "proxy_endpoint": "/api/nasa-tile",
                "layers_endpoint": "/api/nasa-tile/layers",
                "capabilities": [
                    "true_color_modis", "false_color_bands721",
                    "ndvi_8day", "night_lights_viirs", "aerosol_optical_depth",
                    "land_surface_temp"
                ],
            },
            {
                "id": "esri_world_imagery",
                "name": "ESRI World Imagery (ArcGIS)",
                "description": "Global high-resolution optical satellite & aerial imagery (0.3m to 15m resolution).",
                "status": "online",
                "auth_required": False,
                "key_set": True,
                "resolution": "0.3m - 15m GSD",
                "update_cadence": "Continuous Mosaic",
                "tile_url_template": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                "capabilities": ["satellite", "aerial"],
            },
            {
                "id": "sentinel_1_sar",
                "name": "Copernicus Sentinel-1 (C-Band SAR)",
                "description": "All-weather synthetic aperture radar with calibrated Sigma0 dB backscatter.",
                "status": "active_sar_engine",
                "auth_required": False,
                "key_set": True,
                "resolution": "10m - 20m GSD",
                "update_cadence": "6-12 Day Revisit",
                "capabilities": ["sar_backscatter", "change_detection", "flood_mapping", "subsidence"],
            },
        ],
        "active_primary": "google_maps" if google_ok else "esri_world_imagery",
        "active_terrain": "maptiler" if maptiler_ok else "esri_world_imagery",
        "active_nrt": "nasa_gibs",
    }
