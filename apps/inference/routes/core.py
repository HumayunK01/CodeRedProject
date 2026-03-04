"""
Core routes: home, health check, DB connectivity test.
"""

import os
import traceback
from datetime import datetime

from flask import Blueprint, jsonify
from core.logging_config import get_logger

logger = get_logger("foresee.app")

core_bp = Blueprint("core", __name__)


@core_bp.route("/")
def home():
    return jsonify({
        "name": "OutbreakLens ML Inference API",
        "version": "1.0.0",
        "description": "AI-powered malaria diagnosis and outbreak forecasting",
        "status": "running",
    })


@core_bp.route("/health")
def health_check():
    import flask_app as _fa

    try:
        return jsonify({
            "status": "ok",
            "message": "OutbreakLens ML Inference API is operational",
            "timestamp": datetime.now().isoformat(),
            "models_loaded": {
                "cnn_diagnostic_model": _fa.malaria_model is not None,
                "arima_forecast_model": _fa.malaria_forecast_model is not None,
                "dhs_risk_model": _fa.SYMPTOM_MODEL_NAME,
            },
            "database_connected": _fa.DB_AVAILABLE,
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Health check failed: {str(e)}",
            "timestamp": datetime.now().isoformat(),
        }), 500


@core_bp.route("/api/db-test", methods=["GET"])
def test_db_connection():
    db_url = os.getenv("DATABASE_URL")

    result = {
        "db_url_exists": db_url is not None,
        "db_url_length": len(db_url) if db_url else 0,
    }

    if not db_url:
        return jsonify({
            **result,
            "status": "error",
            "message": "DATABASE_URL environment variable is not set",
        }), 500

    if "@" in db_url:
        try:
            parts = db_url.split("@")
            result["db_host"] = parts[1].split("/")[0] if len(parts) > 1 else "unknown"
        except Exception:
            result["db_host"] = "parse_error"

    try:
        import psycopg

        result["psycopg_version"] = psycopg.__version__

        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 as test")
                row = cur.fetchone()

        result["status"] = "ok"
        result["message"] = "Database connection successful"
        result["test_result"] = row[0] if row else None
        return jsonify(result)

    except Exception as e:
        result["status"] = "error"
        result["message"] = str(e)
        result["error_type"] = type(e).__name__
        result["traceback"] = traceback.format_exc()
        return jsonify(result), 500
