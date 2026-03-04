"""
Forecast routes: create, list, stats.
"""

from flask import Blueprint, jsonify, request
from core.logging_config import get_logger
from core.auth import require_auth, get_caller_role
from core.utils import validate_fields, ValidationError, serialize_datetime

logger = get_logger("foresee.app")

forecasts_bp = Blueprint("forecasts", __name__)


@forecasts_bp.route("/api/forecasts", methods=["POST"])
@require_auth()
def create_forecast_record():
    import flask_app as _fa

    if not _fa.DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        try:
            validate_fields(data, {
                "clerkId":      {"required": True,  "type": str,  "max_length": 64},
                "region":       {"required": True,  "type": str,  "max_length": 200},
                "horizonWeeks": {"required": False, "type": (int, float), "min_val": 1, "max_val": 52},
                "riskLevel":    {"required": False, "type": (str, type(None)),
                                 "allowed": ["Low", "Medium", "High", "Critical", None]},
                "hotspotScore": {"required": False, "type": (int, float), "min_val": 0.0, "max_val": 1.0},
                "confidence":   {"required": False, "type": (int, float), "min_val": 0.0, "max_val": 1.0},
            })
        except ValidationError as ve:
            return jsonify({"error": "Validation failed", "field": ve.field, "message": ve.message}), 422

        clerk_id = data.get("clerkId")
        if not clerk_id:
            return jsonify({"error": "clerkId is required"}), 400

        if clerk_id != request.user_id:
            caller_role, _ = get_caller_role(request)
            if caller_role != "admin":
                return jsonify({"error": "Forbidden", "message": "Access denied to other user data"}), 403

        user = _fa.get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found. Please sync user first."}), 404

        forecast = _fa.db_create_forecast(
            user_id=user["id"],
            region=data.get("region", "Unknown"),
            horizon_weeks=data.get("horizonWeeks", 4),
            predictions=data.get("predictions", []),
            hotspot_score=data.get("hotspotScore"),
            risk_level=data.get("riskLevel"),
            confidence=data.get("confidence"),
            model_version=data.get("modelVersion"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            country=data.get("country"),
            temperature=data.get("temperature"),
            rainfall=data.get("rainfall"),
            humidity=data.get("humidity"),
        )

        if forecast:
            serialize_datetime(forecast)

        return jsonify(forecast), 201
    except Exception as e:
        logger.error("Error creating forecast: %s", e)
        return jsonify({"error": str(e)}), 500


@forecasts_bp.route("/api/forecasts/<clerk_id>", methods=["GET"])
@require_auth()
def get_user_forecasts(clerk_id):
    import flask_app as _fa

    user, err = _fa._resolve_user_or_error(clerk_id)
    if err:
        return err
    try:
        limit = request.args.get("limit", default=20, type=int)
        forecasts = _fa.get_forecasts_by_user(user["id"], limit=limit)
        return jsonify(serialize_datetime(forecasts))
    except Exception as e:
        logger.error("Error getting forecasts: %s", e)
        return jsonify({"error": str(e)}), 500


@forecasts_bp.route("/api/forecasts/<clerk_id>/stats", methods=["GET"])
@require_auth()
def get_forecast_stats(clerk_id):
    import flask_app as _fa

    user, err = _fa._resolve_user_or_error(clerk_id)
    if err:
        return err
    try:
        return jsonify(_fa.get_forecast_stats_by_user(user["id"]))
    except Exception as e:
        logger.error("Error getting forecast stats: %s", e)
        return jsonify({"error": str(e)}), 500
