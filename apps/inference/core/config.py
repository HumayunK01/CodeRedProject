"""
Centralised configuration for the Foresee Inference API.

All environment-variable reads live here so the rest of the code-base
can ``from config import …`` without touching ``os.getenv`` directly.
"""

import os
import secrets
from dotenv import load_dotenv
from .logging_config import get_logger

load_dotenv()

logger = get_logger("foresee.config")

# ── Flask core ───────────────────────────────────────────────────────────────

_secret_key = os.getenv("FLASK_SECRET_KEY")
if not _secret_key:
    _secret_key = secrets.token_hex(32)
    logger.warning(
        "FLASK_SECRET_KEY not set — using ephemeral random key. "
        "Set FLASK_SECRET_KEY in .env for production."
    )
else:
    logger.info("FLASK_SECRET_KEY loaded from environment.")

FLASK_SECRET_KEY = _secret_key

DEBUG_MODE = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))

# ── CORS ─────────────────────────────────────────────────────────────────────

DEFAULT_DEV_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8080",
]


def _build_allowed_origins() -> list[str]:
    origins = list(DEFAULT_DEV_ORIGINS)
    frontend_url = os.getenv("FRONTEND_URL", "").strip()
    if frontend_url:
        origins.append(frontend_url.rstrip("/"))
    extra = os.getenv("ALLOWED_ORIGINS", "")
    for o in extra.split(","):
        o = o.strip().rstrip("/")
        if o:
            origins.append(o)
    seen: set[str] = set()
    result: list[str] = []
    for o in origins:
        if o not in seen:
            seen.add(o)
            result.append(o)
    return result


ALLOWED_ORIGINS = _build_allowed_origins()
logger.info("CORS allowed origins: %s", ALLOWED_ORIGINS)

# ── Rate Limiting ────────────────────────────────────────────────────────────

DEFAULT_RATE_LIMIT = os.getenv("DEFAULT_RATE_LIMIT", "100 per minute")
REDIS_URL = os.getenv("REDIS_URL", "").strip()

# ── Clerk / Auth ─────────────────────────────────────────────────────────────

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "").strip()
CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY", "")
CLERK_API_BASE = "https://api.clerk.com/v1"

# ── Image upload limits ──────────────────────────────────────────────────────

IMAGE_MAX_FILE_SIZE_MB = 10
IMAGE_MAX_FILE_SIZE_BYTES = IMAGE_MAX_FILE_SIZE_MB * 1024 * 1024
IMAGE_ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/bmp", "image/tiff", "image/webp"}
IMAGE_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif", ".webp"}
IMAGE_MAGIC_BYTES = [
    (b"\xff\xd8\xff", "JPEG"),
    (b"\x89PNG\r\n\x1a\n", "PNG"),
    (b"BM", "BMP"),
    (b"II\x2a\x00", "TIFF-LE"),
    (b"MM\x00\x2a", "TIFF-BE"),
    (b"RIFF", "WEBP"),
]
