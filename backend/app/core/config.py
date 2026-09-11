"""Application configuration — reads from environment and .env file."""

from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """BHUVISION application settings — SIH 2026 | SIH26167 | ISRO | Team BANKAI."""

    # --- Application ---
    app_name: str = "BHUVISION"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"
    cors_origins: str = "http://localhost:3000,http://localhost:8000"

    # --- Primary LLM Router: OpenRouter ---
    openrouter_api_key: str | None = None
    openai_base_url: str = "https://openrouter.ai/api/v1"
    openai_api_key: str = "sk-freellmapi-unified"

    # --- Per-Agent Model Assignments (OpenRouter IDs) ---
    agent1_model: str = "meta-llama/llama-3.3-70b-instruct"       # Query Planner
    agent2_model: str = "qwen/qwen-2.5-72b-instruct"              # Geo Validator
    agent3_model: str = "mistralai/mistral-small-3.2-24b-instruct:free"  # Sensor Router
    agent4_model: str = "google/gemini-2.5-flash"                 # RS-VQA Vision
    agent5_model: str = "deepseek/deepseek-r1-0528:free"          # SAR & Change Detection
    agent6_model: str = "meta-llama/llama-3.3-70b-instruct"       # Visual Grounding
    agent7_model: str = "deepseek/deepseek-r1:free"               # Evidence Fusion
    agent8_model: str = "google/gemini-2.5-flash"                 # Confidence & Uncertainty
    agent9_model: str = "google/gemini-2.5-flash-lite"            # Audit & Trace

    # --- VLM Primary (Agent 4 / GatewayBackend) ---
    vlm_model_name: str = "google/gemini-2.5-flash"
    vlm_backend: Literal["gateway", "vllm", "local_lora", "demo"] = "gateway"
    vllm_api_url: str = "http://localhost:8080/v1"

    # --- Astra / GPT-6 Astra Intelligence Gateway ---
    astra_api_key: str | None = None
    astra_base_url: str = "https://api.astra.datastax.com/v1"
    astra_model: str = "gpt-6-astra-geospatial"

    # --- Secondary Fallback: OmniRoute ---
    omniroute_base_url: str = "http://localhost:20128/v1"
    omniroute_api_key: str = "sk-omniroute-unified"

    # --- Tertiary Fallback: FreeLLMAPI ---
    freellm_base_url: str = "http://localhost:3001/v1"
    freellm_api_key: str = "sk-freellmapi-unified"

    # --- Map & Spatial Data API Keys ---
    google_maps_api_key: str | None = None
    nasa_earthdata_token: str | None = None
    maptiler_api_key: str | None = None
    mapbox_token: str | None = None
    copernicus_client_id: str | None = None
    copernicus_client_secret: str | None = None

    # --- Demo Mode ---
    demo_mode: bool = False

    # --- Storage ---
    upload_dir: str = "./data/uploads"
    max_upload_size_mb: int = 100

    # --- Database (optional) ---
    database_url: str | None = None

    @property
    def upload_path(self) -> Path:
        p = Path(self.upload_dir)
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def effective_api_key(self) -> str:
        """Return OpenRouter key if set, else FreeLLMAPI fallback."""
        return self.openrouter_api_key or self.freellm_api_key

    @property
    def effective_base_url(self) -> str:
        """Return OpenRouter URL if key is set, else FreeLLMAPI fallback."""
        if self.openrouter_api_key:
            return self.openai_base_url  # https://openrouter.ai/api/v1
        return self.freellm_base_url

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


# Singleton
settings = Settings()
