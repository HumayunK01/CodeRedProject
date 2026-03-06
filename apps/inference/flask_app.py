"""WSGI entry-point: ``gunicorn flask_app:app``

Re-exports symbols so existing test patches like
``@patch("flask_app.get_user_by_clerk_id")`` keep working.
"""

import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from werkzeug.middleware.proxy_fix import ProxyFix

load_dotenv()
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from core.logging_config import get_logger

logger = get_logger("foresee.app")
logger_security = get_logger("foresee.security")

import core.middleware as _middleware  # noqa: E402

# ---------------------------------------------------------------------------
# PEP 562 — delegate mutable globals (model refs, perf counters) to owning
# modules so mutations stay visible. Writing to flask_app.__dict__ (e.g. in
# tests) shadows __getattr__ for that name.
# ---------------------------------------------------------------------------
import core.ml_loader as _ml_loader  # noqa: E402
from core.auth import (  # noqa: F401
    CLERK_JWKS_URL,
    get_clerk_public_key,
    require_auth,
)
from core.auth import (
    clerk_request as _clerk_request,
)
from core.auth import (
    decode_jwt_payload as _decode_jwt_payload,
)
from core.auth import (
    get_caller_role as _get_caller_role,
)
from core.auth import (
    test_clerk_connection as _test_clerk_connection,
)
from core.config import (  # noqa: F401
    ALLOWED_ORIGINS,
    CLERK_SECRET_KEY,
    DEBUG_MODE,
    DEFAULT_RATE_LIMIT,
    FLASK_SECRET_KEY,
    HOST,
    IMAGE_ALLOWED_EXTENSIONS,
    IMAGE_ALLOWED_MIME_TYPES,
    IMAGE_MAGIC_BYTES,
    IMAGE_MAX_FILE_SIZE_BYTES,
    IMAGE_MAX_FILE_SIZE_MB,
    PORT,
    REDIS_URL,
    _build_allowed_origins,
)
from core.middleware import track_performance  # noqa: F401
from core.ml_loader import load_models  # noqa: F401
from core.utils import (  # noqa: F401
    ValidationError,
    serialize_datetime,
    validate_fields,
)
from core.utils import (
    format_time_ago as _format_time_ago,
)
from core.utils import (
    safe_float as _safe_float,
)

_DELEGATE_MAP: dict[str, object] = {
    "malaria_model": _ml_loader,
    "malaria_forecast_model": _ml_loader,
    "symptoms_model": _ml_loader,
    "gatekeeper_model": _ml_loader,
    "gatekeeper_threshold": _ml_loader,
    "SYMPTOM_MODEL_NAME": _ml_loader,
    "MODEL_TEST_ACCURACY": _ml_loader,
    "adaptive_ensemble": _ml_loader,
    "ensemble_metadata": _ml_loader,
    "SUCCESS_COUNT": _middleware,
    "ERROR_COUNT": _middleware,
    "REQUEST_TIMES": _middleware,
    "DATA_SECURITY_STATUS": _middleware,
}


def __getattr__(name: str):
    mod = _DELEGATE_MAP.get(name)
    if mod is not None:
        return getattr(mod, name)
    raise AttributeError(f"module 'flask_app' has no attribute {name!r}")


import pandas as pd  # noqa: F401,E402

try:
    from xhtml2pdf import pisa  # noqa: F401
except Exception:
    pisa = None  # type: ignore[assignment]
from flask import render_template  # noqa: F401

# --- Database layer --------------------------------------------------------
try:
    from db.database import (
        create_diagnosis as db_create_diagnosis,
    )
    from db.database import (
        create_forecast as db_create_forecast,
    )
    from db.database import (
        get_diagnoses_by_user,
        get_diagnosis_stats_by_user,
        get_forecast_stats_by_user,
        get_forecasts_by_user,
        get_user_activity,
        get_user_by_clerk_id,
        get_user_with_stats,
        upsert_user,
    )
    DB_AVAILABLE = True
    logger.info("Database module loaded successfully")
except Exception as e:
    logger.error("Database module could not be imported", exc_info=e)
    DB_AVAILABLE = False

    def upsert_user(**kw):                       raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def get_user_with_stats(*a):                 raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def get_user_by_clerk_id(*a):                raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def db_create_diagnosis(**kw):               raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def get_diagnoses_by_user(*a, **kw):         raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def get_diagnosis_stats_by_user(*a):         raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def db_create_forecast(**kw):                raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def get_forecasts_by_user(*a, **kw):         raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def get_forecast_stats_by_user(*a):          raise RuntimeError("DB unavailable")  # noqa: E501,E704
    def get_user_activity(*a, **kw):             raise RuntimeError("DB unavailable")  # noqa: E501,E704


def _resolve_user_or_error(clerk_id: str):
    if not DB_AVAILABLE:
        return None, (jsonify({"error": "Database module not available"}), 503)
    user = get_user_by_clerk_id(clerk_id)
    if not user:
        return None, (jsonify({"error": "User not found"}), 404)
    return user, None


def create_app() -> Flask:
    application = Flask(__name__)
    application.secret_key = FLASK_SECRET_KEY
    application.wsgi_app = ProxyFix(application.wsgi_app, x_for=1, x_proto=1)  # type: ignore[assignment]

    from core.extensions import init_extensions
    init_extensions(application)

    from core.middleware import register_after_request
    register_after_request(application)

    from routes import register_blueprints
    register_blueprints(application)

    load_models()
    _test_clerk_connection()
    return application


app = create_app()

from routes.activity import calculate_dashboard_stats  # noqa: F401,E402

if __name__ == "__main__":
    if DEBUG_MODE:
        logger_security.warning("Running in DEBUG mode — NEVER use this in production!")
    logger.info("Starting Foresee ML Inference API on %s:%d (debug=%s)", HOST, PORT, DEBUG_MODE)
    app.run(host=HOST, port=PORT, debug=DEBUG_MODE)
