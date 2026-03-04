"""
Flask extensions (CORS, Rate Limiter).

Initialised here so they can be imported by any module without circular deps.
The actual ``init_app`` calls happen in ``flask_app.create_app()``.
"""

from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from .logging_config import get_logger
from .config import ALLOWED_ORIGINS, DEFAULT_RATE_LIMIT, REDIS_URL

logger = get_logger("foresee.extensions")


# ── Limiter Storage Resolution ───────────────────────────────────────────────

def _resolve_limiter_storage(redis_url: str) -> str:
    if not redis_url:
        logger.warning("REDIS_URL not set — using in-memory rate-limit storage (dev mode).")
        return "memory://"
    try:
        import redis as _redis
        _client = _redis.from_url(redis_url, socket_connect_timeout=2)
        _client.ping()
        logger.info("Redis connected: %s", redis_url.split("@")[-1])
        return redis_url
    except Exception as e:
        logger.warning(
            "Redis unreachable (%s: %s) — falling back to in-memory storage. "
            "This is expected when running locally with a Railway private Redis URL.",
            e.__class__.__name__, e,
        )
        return "memory://"


_storage_uri = _resolve_limiter_storage(REDIS_URL)


def _get_user_identity():
    """Identify users for rate limiting: Clerk user ID if available, else IP."""
    from flask import request
    from core.auth import decode_jwt_payload

    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        payload = decode_jwt_payload(auth.split(" ", 1)[1])
        if payload and payload.get("sub"):
            return f"user:{payload['sub']}"
    return f"ip:{get_remote_address()}"


limiter = Limiter(
    key_func=_get_user_identity,
    default_limits=[DEFAULT_RATE_LIMIT],
    storage_uri=_storage_uri,
)


def init_extensions(app):
    """Attach extensions to the Flask app instance."""
    # CORS
    CORS(
        app,
        origins=ALLOWED_ORIGINS,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
        supports_credentials=True,
        max_age=600,
    )

    # Rate limiter
    limiter.init_app(app)
