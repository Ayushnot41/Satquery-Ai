"""BHUVISION FastAPI Backend Application Entrypoint.

SIH26167: SatQuery AI - Interactive Vision-Language Assistant for Remote Sensing.
Team: BANKAI | Organization: ISRO
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from .api.health import router as health_router
from .api.imagery import router as imagery_router
from .api.investigation import router as investigation_router
from .api.scenarios import router as scenarios_router
from .api.locations import router as locations_router
from .api.traffic import router as traffic_router
from .api.futuristic import router as futuristic_router
from .api.nasa_tile import router as nasa_tile_router
from .api.auth import router as auth_router
from .core.config import settings
from .core.logging import get_logger, setup_logging

logger = get_logger("app.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown hooks."""
    setup_logging()
    logger.info("bhuvision_starting", version=settings.app_version, backend=settings.vlm_backend)
    
    # Ensure storage directories exist
    settings.upload_path.mkdir(parents=True, exist_ok=True)
    Path("./data/demo").mkdir(parents=True, exist_ok=True)

    yield

    logger.info("bhuvision_stopping")


app = FastAPI(
    title="BHUVISION — Agentic Earth Intelligence",
    description=(
        "An Interactive Vision-Language Assistant for Multimodal Remote Sensing Image Analysis "
        "through Text Queries (SIH26167, ISRO). Powered by 9 autonomous specialist agents."
    ),
    version=settings.app_version,
    lifespan=lifespan,
)

# CORS middleware with standards-compliant credential support
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list + [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:3000",
        "https://raw.githack.com",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception barrier preventing unhandled server crashes and raw stack traces."""
    logger.error("unhandled_server_exception", path=str(request.url), error=str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal spatial intelligence pipeline exception.",
            "error": str(exc),
            "status": "error",
        },
    )

# Static file mounts for previews and demo imagery
upload_path = settings.upload_path
demo_path = Path("./data/demo")
upload_path.mkdir(parents=True, exist_ok=True)
demo_path.mkdir(parents=True, exist_ok=True)

app.mount("/static/uploads", StaticFiles(directory=str(upload_path)), name="uploads")
app.mount("/static/demo", StaticFiles(directory=str(demo_path)), name="demo")

# Mount assets directory for 3D SVGs and PWA icons
assets_dir = Path(__file__).resolve().parents[2] / "assets"
if assets_dir.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

# Include API Routers
app.include_router(health_router, prefix="/api")
app.include_router(imagery_router, prefix="/api")
app.include_router(investigation_router, prefix="/api")
app.include_router(scenarios_router, prefix="/api")
app.include_router(locations_router, prefix="/api")
app.include_router(traffic_router, prefix="/api")
app.include_router(futuristic_router, prefix="/api")
app.include_router(nasa_tile_router, prefix="/api")
app.include_router(auth_router, prefix="/api")


@app.get("/", tags=["Root"])
async def get_root():
    """System banner and metadata."""
    return {
        "product": "BHUVISION",
        "tagline": "Ask the Earth. AI decides how to investigate it.",
        "problem_statement_id": "SIH26167",
        "organization": "Indian Space Research Organisation (ISRO)",
        "team": "BANKAI",
        "version": settings.app_version,
        "app_url": "/app",
        "docs_url": "/docs",
        "health_url": "/api/health",
        "status": "online",
        "agents": 9,
    }


@app.get("/manifest.json", tags=["PWA"])
async def get_manifest():
    """Serves the Progressive Web App (PWA) manifest."""
    manifest_file = Path(__file__).resolve().parents[2] / "manifest.json"
    if manifest_file.exists():
        return FileResponse(manifest_file, media_type="application/manifest+json")
    return {"name": "BHUVISION", "short_name": "BHUVISION"}


@app.api_route("/app", methods=["GET", "HEAD"], tags=["Frontend Application"])
@app.api_route("/preview", methods=["GET", "HEAD"], tags=["Frontend Application"])
async def get_interactive_app():
    """Serves the complete production-level BHUVISION 3D Earth & Surveillance Cockpit."""
    preview_file = Path(__file__).resolve().parents[2] / "bhuvision_preview.html"
    if preview_file.exists():
        return FileResponse(preview_file, media_type="text/html")
    return {"error": "Application file not found", "path": str(preview_file)}


@app.api_route("/api/download/deployment-manual", methods=["GET", "HEAD"], tags=["Documentation"])
@app.api_route("/docs/deployment-manual.pdf", methods=["GET", "HEAD"], tags=["Documentation"])
async def download_deployment_manual_pdf():
    """Serves the complete Enterprise Production Deployment Manual PDF for direct download."""
    pdf_file = Path(__file__).resolve().parents[2] / "docs" / "BHUVISION_PRODUCTION_DEPLOYMENT_MANUAL.pdf"
    if pdf_file.exists():
        return FileResponse(
            pdf_file,
            media_type="application/pdf",
            filename="BHUVISION_PRODUCTION_DEPLOYMENT_MANUAL.pdf",
            headers={"Content-Disposition": "attachment; filename=BHUVISION_PRODUCTION_DEPLOYMENT_MANUAL.pdf"}
        )
    return {"error": "Deployment manual PDF not found", "path": str(pdf_file)}


