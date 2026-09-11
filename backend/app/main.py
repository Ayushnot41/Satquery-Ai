"""BHUVISION FastAPI Backend Application Entrypoint.

SIH26167: SatQuery AI - Interactive Vision-Language Assistant for Remote Sensing.
Team: BANKAI | Organization: ISRO
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
import httpx

from .api.health import router as health_router
from .api.imagery import router as imagery_router
from .api.investigation import router as investigation_router
from .api.scenarios import router as scenarios_router
from .api.locations import router as locations_router
from .api.traffic import router as traffic_router
from .api.futuristic import router as futuristic_router, debate_router
from .api.nasa_tile import router as nasa_tile_router
from .api.auth import router as auth_router
from .api.benchmark import router as benchmark_router
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
app.include_router(debate_router, prefix="/api")
app.include_router(nasa_tile_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(benchmark_router, prefix="/api")


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


NEXTJS_CANDIDATE_URLS = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://[::1]:3000",
]

_MIME_TYPES = {
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
    ".ttf": "font/ttf",
    ".webp": "image/webp",
}


async def _proxy_to_nextjs(request: Request, target_path: str) -> Response:
    """Proxy request to Next.js server with fallback to pre-built Next.js assets or preview HTML."""
    query_string = f"?{request.url.query}" if request.url.query else ""

    # 1. Try forwarding to active Next.js server (e.g. running on localhost:3000 or 127.0.0.1:3000)
    for base_url in NEXTJS_CANDIDATE_URLS:
        target_url = f"{base_url}{target_path}{query_string}"
        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(10.0, connect=1.5)) as client:
                req_headers = {
                    k: v for k, v in request.headers.items()
                    if k.lower() not in ("host", "content-length", "content-encoding")
                }
                body = await request.body() if request.method in ("POST", "PUT", "PATCH") else None
                resp = await client.request(
                    method=request.method,
                    url=target_url,
                    headers=req_headers,
                    content=body,
                )
                excluded_headers = {"content-encoding", "content-length", "transfer-encoding", "connection"}
                headers = {k: v for k, v in resp.headers.items() if k.lower() not in excluded_headers}
                # Prevent browser caching of HTML so edits on localhost:3000 show immediately on :8000/app
                if "text/html" in resp.headers.get("content-type", ""):
                    headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
                    headers["Pragma"] = "no-cache"
                    headers["Expires"] = "0"
                return Response(content=resp.content, status_code=resp.status_code, headers=headers)
        except Exception:
            continue

    # 2. Fallback to locally built Next.js production output if Next.js dev server is not reachable
    frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
    next_dir = frontend_dir / ".next"

    if target_path.startswith("/_next/"):
        sub_path = target_path.replace("/_next/", "")
        local_asset = next_dir / sub_path
        if local_asset.exists() and local_asset.is_file():
            media_type = _MIME_TYPES.get(local_asset.suffix.lower())
            return FileResponse(local_asset, media_type=media_type)

    # Route-specific HTML check (e.g. /analysis/new -> server/app/analysis/new.html)
    clean_path = target_path.strip("/")
    if clean_path:
        route_html = next_dir / "server" / "app" / f"{clean_path}.html"
        if route_html.exists() and route_html.is_file():
            return FileResponse(
                route_html,
                media_type="text/html",
                headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
            )

    built_index = next_dir / "server" / "app" / "index.html"
    if built_index.exists():
        return FileResponse(
            built_index,
            media_type="text/html",
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )

    # 3. Fallback to standalone preview HTML
    preview_file = Path(__file__).resolve().parents[2] / "bhuvision_preview.html"
    if preview_file.exists():
        return FileResponse(
            preview_file,
            media_type="text/html",
            headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
        )

    return JSONResponse(status_code=404, content={"error": "Application not found"})


@app.api_route("/app", methods=["GET", "HEAD"], tags=["Frontend Application"])
@app.api_route("/app/{full_path:path}", methods=["GET", "HEAD", "POST"], tags=["Frontend Application"])
@app.api_route("/preview", methods=["GET", "HEAD"], tags=["Frontend Application"])
async def get_interactive_app(request: Request, full_path: str = ""):
    """Serves the active Next.js frontend application with real-time updates."""
    target_path = f"/{full_path}" if full_path else "/"
    return await _proxy_to_nextjs(request, target_path)


@app.api_route("/_next/{path:path}", methods=["GET", "HEAD"], tags=["Frontend Application"])
async def proxy_next_assets(request: Request, path: str):
    """Serves Next.js bundled assets, chunks, and CSS."""
    return await _proxy_to_nextjs(request, f"/_next/{path}")


@app.api_route("/analysis/{path:path}", methods=["GET", "HEAD"], tags=["Frontend Application"])
async def proxy_analysis_pages(request: Request, path: str):
    """Serves Next.js analysis pages."""
    return await _proxy_to_nextjs(request, f"/analysis/{path}")


@app.api_route("/preview-3d", methods=["GET", "HEAD"], tags=["Frontend Application"])
@app.api_route("/preview-hud", methods=["GET", "HEAD"], tags=["Frontend Application"])
async def get_standalone_3d_preview():
    """Serves the standalone Three.js God's Eye WebGL preview."""
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


