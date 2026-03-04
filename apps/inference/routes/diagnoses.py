"""
Diagnosis routes: create, list, stats.
"""

from flask import Blueprint, jsonify, request
from core.logging_config import get_logger
from core.auth import require_auth, get_caller_role
from core.utils import validate_fields, ValidationError, serialize_datetime

logger = get_logger("foresee.app")

diagnoses_bp = Blueprint("diagnoses", __name__)


@diagnoses_bp.route("/api/diagnoses", methods=["POST"])
@require_auth()
def create_diagnosis():
    import flask_app as _fa

    if not _fa.DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        try:
            validate_fields(data, {
                "clerkId":    {"required": True,  "type": str, "max_length": 64},
                "result":     {"required": True,  "type": str, "max_length": 100},
                "confidence": {"required": False, "type": (int, float), "min_val": 0.0, "max_val": 1.0},
                "imageUrl":   {"required": False, "type": (str, type(None)), "max_length": 1000},
                "patientAge": {"required": False, "type": (int, float), "min_val": 0, "max_val": 150},
                "patientSex": {"required": False, "type": (str, type(None)),
                               "allowed": ["Male", "Female", "Other", None]},
                "location":   {"required": False, "type": (str, type(None)), "max_length": 200},
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

        diagnosis = _fa.db_create_diagnosis(
            user_id=user["id"],
            result=data.get("result", "Unknown"),
            confidence=data.get("confidence", 0),
            image_url=data.get("imageUrl"),
            species=data.get("species"),
            parasite_count=data.get("parasiteCount"),
            patient_age=data.get("patientAge"),
            patient_sex=data.get("patientSex"),
            location=data.get("location"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            symptoms=data.get("symptoms"),
            processing_time=data.get("processingTime"),
            model_version=data.get("modelVersion"),
        )

        return jsonify(diagnosis), 201
    except Exception as e:
        logger.error("Error creating diagnosis: %s", e)
        return jsonify({"error": str(e)}), 500


@diagnoses_bp.route("/api/diagnoses/<clerk_id>", methods=["GET"])
@require_auth()
def get_user_diagnoses(clerk_id):
    import flask_app as _fa

    user, err = _fa._resolve_user_or_error(clerk_id)
    if err:
        return err
    try:
        limit = request.args.get("limit", default=20, type=int)
        diagnoses = _fa.get_diagnoses_by_user(user["id"], limit=limit)
        return jsonify(serialize_datetime(diagnoses))
    except Exception as e:
        logger.error("Error getting diagnoses: %s", e)
        return jsonify({"error": str(e)}), 500


@diagnoses_bp.route("/api/diagnoses/<clerk_id>/stats", methods=["GET"])
@require_auth()
def get_diagnosis_stats(clerk_id):
    import flask_app as _fa

    user, err = _fa._resolve_user_or_error(clerk_id)
    if err:
        return err
    try:
        return jsonify(_fa.get_diagnosis_stats_by_user(user["id"]))
    except Exception as e:
        logger.error("Error getting diagnosis stats: %s", e)
        return jsonify({"error": str(e)}), 500
