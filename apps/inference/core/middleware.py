"""
Request middleware: security headers, CORS enforcement, performance tracking.
"""

import time
from functools import wraps

from flask import request

from .config import ALLOWED_ORIGINS
from .logging_config import get_logger

logger = get_logger("foresee.app")
logger_security = get_logger("foresee.security")

# ── Performance Counters ─────────────────────────────────────────────────────

REQUEST_TIMES: list[float] = []   # Circular buffer of last 100 durations (ms)
SUCCESS_COUNT = 0
ERROR_COUNT = 0
DATA_SECURITY_STATUS = "HIPAA Compliant"


# ── Performance Tracking Decorator ───────────────────────────────────────────

def track_performance(f):
    """Wrap a route to count successes/errors and record latency."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        global SUCCESS_COUNT, ERROR_COUNT
        start_time = time.time()
        try:
            response = f(*args, **kwargs)
            if isinstance(response, tuple) and len(response) > 1:
                status_code = response[1]
                if 200 <= status_code < 300:
                    SUCCESS_COUNT += 1
                else:
                    ERROR_COUNT += 1
            else:
                SUCCESS_COUNT += 1

            duration = (time.time() - start_time) * 1000  # ms
            REQUEST_TIMES.append(duration)
            if len(REQUEST_TIMES) > 100:
                REQUEST_TIMES.pop(0)

            return response
        except Exception as e:
            ERROR_COUNT += 1
            logger.error("Request error in %s: %s", f.__name__, e)
            raise
    return decorated_function


# ── After-Request Handler ────────────────────────────────────────────────────

def register_after_request(app):
    """Register the CORS enforcement & security-header middleware."""

    @app.after_request
    def enforce_cors(response):
        origin = request.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Vary"] = "Origin"
        elif not response.headers.get("Access-Control-Allow-Origin"):
            response.headers["Access-Control-Allow-Origin"] = "null"

        if request.method == "OPTIONS":
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            )
            response.headers["Access-Control-Allow-Headers"] = (
                "Content-Type, Authorization, X-Requested-With"
            )
            response.headers["Access-Control-Max-Age"] = "600"

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        # Content-Security-Policy
        if request.path in ("/docs", "/docs/"):
            # Swagger UI needs CDN scripts/styles and inline script to boot
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
                "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
                "img-src 'self' data:; "
                "frame-ancestors 'none'"
            )
        else:
            # Strict policy for all API endpoints
            response.headers["Content-Security-Policy"] = (
                "default-src 'none'; "
                "frame-ancestors 'none'"
            )

        # Security event logging
        if response.status_code in (401, 403, 429):
            user_id = getattr(request, "user_id", "unauthenticated")
            logger_security.warning(
                "HTTP %s | %s %s | IP: %s | user: %s",
                response.status_code,
                request.method,
                request.path,
                request.remote_addr,
                user_id,
            )

        return response

    @app.errorhandler(429)
    def ratelimit_handler(e):
        from flask import jsonify
        return jsonify({
            "error": "Too Many Requests",
            "message": f"Rate limit exceeded. {e.description}",
        }), 429
