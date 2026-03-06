"""
Admin routes: user listing & role management via Clerk Management API.
"""

from flask import Blueprint, jsonify, request

from core.auth import clerk_request, get_caller_role, require_auth
from core.config import CLERK_SECRET_KEY
from core.logging_config import get_logger

logger_admin = get_logger("foresee.admin")

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/users", methods=["GET", "OPTIONS"])
@require_auth(roles=["admin"])
def admin_get_users():
    """List all Clerk users with their roles. Admin only."""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    caller_role, reason = get_caller_role(request)
    logger_admin.info("/admin/users → role=%r, reason=%r", caller_role, reason)
    if caller_role != "admin":
        return jsonify({"error": "Forbidden", "resolved_role": caller_role, "reason": reason}), 403

    if not CLERK_SECRET_KEY:
        return jsonify({"error": "CLERK_SECRET_KEY not configured on server"}), 500

    data, status = clerk_request("GET", "/users?limit=100&order_by=-created_at")
    if status != 200:
        return jsonify({"error": "Failed to fetch users from Clerk", "detail": data}), 502

    users = []
    for u in data:
        users.append({
            "id": u["id"],
            "firstName": u.get("first_name") or "",
            "lastName": u.get("last_name") or "",
            "email": (u.get("email_addresses") or [{}])[0].get("email_address", ""),
            "imageUrl": u.get("image_url", ""),
            "role": (u.get("public_metadata") or {}).get("role", "patient"),
            "createdAt": u.get("created_at"),
        })

    return jsonify(users), 200


@admin_bp.route("/admin/set-role", methods=["POST", "OPTIONS"])
@require_auth(roles=["admin"])
def admin_set_role():
    """Update a user's role via Clerk publicMetadata. Admin only."""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    caller_role, reason = get_caller_role(request)
    if caller_role != "admin":
        return jsonify({"error": "Forbidden", "reason": reason}), 403

    if not CLERK_SECRET_KEY:
        return jsonify({"error": "CLERK_SECRET_KEY not configured on server"}), 500

    body = request.get_json(force=True)
    user_id = body.get("userId")
    new_role = body.get("role")

    if not user_id or not new_role:
        return jsonify({"error": "userId and role are required"}), 400

    if new_role not in ("doctor", "patient", "admin"):
        return jsonify({"error": "Invalid role"}), 400

    patch_body = {"public_metadata": {"role": new_role}}
    data, status = clerk_request("PATCH", f"/users/{user_id}/metadata", patch_body)

    if status != 200:
        return jsonify({"error": "Failed to update role", "detail": data}), 502

    return jsonify({"success": True, "userId": user_id, "role": new_role}), 200
