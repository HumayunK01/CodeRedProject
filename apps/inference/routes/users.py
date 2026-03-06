"""
User routes: sync & stats.
"""

from flask import Blueprint, jsonify, request

from core.auth import require_auth
from core.logging_config import get_logger
from core.utils import ValidationError, validate_fields

logger = get_logger("foresee.app")

users_bp = Blueprint("users", __name__)


@users_bp.route("/api/users/sync", methods=["POST"])
@require_auth(skip_db_check=True)
def sync_user():
    import flask_app as _fa

    if not _fa.DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        try:
            validate_fields(data, {
                "clerkId":   {"required": True,  "type": str, "max_length": 64},
                "email":     {"required": True,  "type": str, "max_length": 254},
                "firstName": {"required": False, "type": (str, type(None)), "max_length": 100},
                "lastName":  {"required": False, "type": (str, type(None)), "max_length": 100},
                "imageUrl":  {"required": False, "type": (str, type(None)), "max_length": 1000},
            })
        except ValidationError as ve:
            return jsonify({"error": "Validation failed", "field": ve.field, "message": ve.message}), 422

        clerk_id = data.get("clerkId")
        email = data.get("email")

        if clerk_id != request.user_id:
            return jsonify({"error": "Forbidden", "message": "clerkId does not match authenticated user"}), 403

        user = _fa.upsert_user(
            clerk_id=clerk_id,
            email=email,
            first_name=data.get("firstName"),
            last_name=data.get("lastName"),
            image_url=data.get("imageUrl"),
        )

        user_with_stats = _fa.get_user_with_stats(clerk_id)
        return jsonify(user_with_stats if user_with_stats else user)

    except Exception as e:
        logger.error("Error syncing user: %s", e)
        return jsonify({"error": str(e)}), 500


@users_bp.route("/api/users/<clerk_id>/stats", methods=["GET"])
@require_auth()
def get_user_stats(clerk_id):
    import flask_app as _fa

    if not _fa.DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        user = _fa.get_user_with_stats(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_id = user["id"]

        diagnosis_stats = _fa.get_diagnosis_stats_by_user(user_id)
        forecast_stats = _fa.get_forecast_stats_by_user(user_id)

        return jsonify({
            "user": user,
            "diagnosisStats": diagnosis_stats,
            "forecastStats": forecast_stats,
        })
    except Exception as e:
        logger.error("Error getting user stats: %s", e)
        return jsonify({"error": str(e)}), 500
