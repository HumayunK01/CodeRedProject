"""
Activity & dashboard routes.
"""

import json
from datetime import datetime

from flask import Blueprint, jsonify, request

from core.auth import require_auth
from core.logging_config import get_logger
from core.utils import format_time_ago, safe_float, serialize_datetime

logger = get_logger("foresee.app")

activity_bp = Blueprint("activity", __name__)


# ── Dashboard Stats Computation ──────────────────────────────────────────────

def calculate_dashboard_stats(stored_results):
    """Compute dashboard stats from client-supplied stored results (fallback path)."""
    import flask_app as _fa

    today_diagnoses = 0
    active_forecasts = 0
    risk_regions: set[str] = set()
    today = datetime.now().date()

    for result in stored_results:
        try:
            if isinstance(result, dict) and "timestamp" in result:
                ts_str = result["timestamp"].replace("Z", "+00:00")
                result_date = datetime.fromisoformat(ts_str).date()

                if result.get("type") == "diagnosis" and result_date == today:
                    today_diagnoses += 1

                if result.get("type") == "forecast":
                    active_forecasts += 1
                    if "input" in result and "region" in result["input"]:
                        risk_regions.add(result["input"]["region"])
        except (ValueError, TypeError):
            continue

    # Real-time system metrics
    total_reqs = _fa.SUCCESS_COUNT + _fa.ERROR_COUNT
    system_health = round(100.0 * _fa.SUCCESS_COUNT / total_reqs, 1) if total_reqs > 0 else 100.0

    avg_latency = (
        int(sum(_fa.REQUEST_TIMES) / len(_fa.REQUEST_TIMES))
        if _fa.REQUEST_TIMES
        else 0
    )
    response_time = f"{avg_latency}ms" if avg_latency > 0 else "<200ms"

    data_security = _fa.DATA_SECURITY_STATUS
    global_reach = f"{max(1, len(risk_regions))}+"

    recent_activity: list[dict] = []
    sorted_results = sorted(
        [r for r in stored_results if "timestamp" in r],
        key=lambda x: x["timestamp"],
        reverse=True,
    )

    for result in sorted_results[:3]:
        time_str = format_time_ago(result.get("timestamp"))

        if result.get("type") == "diagnosis":
            label = result.get("result", {}).get("label", "Unknown")
            is_safe = (
                "negative" in label.lower()
                or "low" in label.lower()
                or "uninfected" in label.lower()
            )
            recent_activity.append({
                "type": "diagnosis",
                "title": "Diagnosis completed",
                "time": time_str,
                "result": label,
                "status": "success" if is_safe else "warning",
            })
        elif result.get("type") == "forecast":
            region = result.get("input", {}).get("region", "Unknown")
            hotspot_score = result.get("result", {}).get("hotspot_score", 0)
            risk = "Low risk"
            if hotspot_score > 0.7:
                risk = "High risk"
            elif hotspot_score > 0.4:
                risk = "Medium risk"
            recent_activity.append({
                "type": "forecast",
                "title": f"{region} forecast",
                "time": time_str,
                "result": risk,
                "status": "info",
            })

    while len(recent_activity) < 3:
        recent_activity.append({
            "type": "info",
            "title": "System operational",
            "time": "Recently",
            "result": "Stable",
            "status": "success",
        })

    return {
        "today_diagnoses": today_diagnoses,
        "active_forecasts": active_forecasts,
        "risk_regions": len(risk_regions),
        "system_health": system_health,
        "model_accuracy": _fa.MODEL_TEST_ACCURACY,
        "response_time": response_time,
        "data_security": data_security,
        "global_reach": global_reach,
        "recent_activity": recent_activity,
    }


# ── Routes ───────────────────────────────────────────────────────────────────

@activity_bp.route("/api/activity/<clerk_id>", methods=["GET"])
@require_auth()
def get_activity(clerk_id):
    import flask_app as _fa

    user, err = _fa._resolve_user_or_error(clerk_id)
    if err:
        return err
    try:
        limit = request.args.get("limit", default=5, type=int)
        activities = _fa.get_user_activity(user["id"], limit=limit)
        return jsonify(serialize_datetime(activities))
    except Exception as e:
        logger.error("Error getting activity: %s", e)
        return jsonify({"error": str(e)}), 500


@activity_bp.route("/dashboard/stats", methods=["GET", "POST"])
def dashboard_stats():
    import flask_app as _fa

    try:
        if request.method == "POST":
            body = request.get_json(silent=True) or {}
            clerk_id = body.get("clerkId")
        else:
            body = {}
            clerk_id = request.args.get("clerkId")

        # --- Database path (authenticated user) ---
        if clerk_id and _fa.DB_AVAILABLE:
            try:
                user = _fa.get_user_by_clerk_id(clerk_id)
                if user:
                    user_id = user["id"]

                    recent_diagnoses = _fa.get_diagnoses_by_user(user_id, limit=50)
                    forecast_stats = _fa.get_forecast_stats_by_user(user_id)
                    recent_activity_raw = _fa.get_user_activity(user_id, limit=5)
                    logger.debug(
                        "Dashboard data: user_id=%s diagnoses=%d forecast_stats=%s activity=%d",
                        user_id, len(recent_diagnoses), forecast_stats, len(recent_activity_raw),
                    )

                    today = datetime.now().date()
                    today_diagnoses = 0
                    today_positive = 0
                    for d in recent_diagnoses:
                        created_at = d.get("createdAt")
                        if isinstance(created_at, str):
                            try:
                                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                            except (ValueError, TypeError):
                                continue
                        if isinstance(created_at, datetime):
                            diag_date = created_at.replace(tzinfo=None).date()
                            if diag_date == today:
                                today_diagnoses += 1
                                res_r = d.get("result", "Unknown")
                                if "parasitized" in res_r.lower() or "high" in res_r.lower():
                                    today_positive += 1

                    active_forecasts = forecast_stats.get("active", 0)

                    recent_activity: list[dict] = []
                    for act in recent_activity_raw:
                        time_str = format_time_ago(act.get("createdAt"))

                        if act.get("type") == "diagnosis":
                            result_val = act.get("result") or "Unknown"
                            is_safe = (
                                "negative" in result_val.lower()
                                or "uninfected" in result_val.lower()
                                or "low" in result_val.lower()
                            )
                            recent_activity.append({
                                "type": "diagnosis",
                                "title": "Diagnosis completed",
                                "time": time_str,
                                "result": result_val,
                                "status": "success" if is_safe else "warning",
                            })
                        elif act.get("type") == "forecast":
                            risk = act.get("riskLevel") or "Unknown"
                            recent_activity.append({
                                "type": "forecast",
                                "title": f"{act.get('region', 'Unknown')} forecast",
                                "time": time_str,
                                "result": f"{risk} Risk",
                                "status": "info" if risk and risk.lower() in ["low", "medium"] else "warning",
                            })

                    total_reqs = _fa.SUCCESS_COUNT + _fa.ERROR_COUNT
                    health_pct = round(100.0 * _fa.SUCCESS_COUNT / total_reqs, 1) if total_reqs > 0 else 100.0
                    avg_latency = (
                        int(sum(_fa.REQUEST_TIMES) / len(_fa.REQUEST_TIMES))
                        if _fa.REQUEST_TIMES
                        else 0
                    )

                    recent_forecasts = _fa.get_forecasts_by_user(user_id, limit=1)
                    live_env_str = "Standby"
                    live_region_str = "Global"
                    if recent_forecasts and recent_forecasts[0].get("temperature") is not None:
                        f = recent_forecasts[0]
                        temp = safe_float(f["temperature"])
                        hum = safe_float(f.get("humidity"))
                        rain = safe_float(f.get("rainfall"))
                        live_env_str = f"{temp}°C | {hum}% | {rain}mm"
                        live_region_str = f["region"]

                    return jsonify({
                        "today_diagnoses": today_diagnoses,
                        "today_positive": today_positive,
                        "active_forecasts": active_forecasts,
                        "high_risk_forecasts": forecast_stats.get("highRisk", 0),
                        "risk_regions": forecast_stats.get("active", 0),
                        "system_health": health_pct,
                        "model_accuracy": _fa.MODEL_TEST_ACCURACY,
                        "response_time": f"{avg_latency}ms" if avg_latency > 0 else "<200ms",
                        "data_security": live_region_str,
                        "global_reach": live_env_str,
                        "recent_activity": recent_activity,
                    })
            except Exception:
                logger.error("Error fetching DB stats for dashboard", exc_info=True)

        # --- Fallback path (local storage / unauthenticated) ---
        if request.method == "POST":
            stored_results = body.get("stored_results", [])
        else:
            stored_results_json = request.args.get("stored_results", "[]")
            try:
                stored_results = json.loads(stored_results_json)
            except json.JSONDecodeError:
                stored_results = []

        stats = calculate_dashboard_stats(stored_results)
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
