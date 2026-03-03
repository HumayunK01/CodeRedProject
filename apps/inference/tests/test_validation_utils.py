"""
Tests for flask_app.py — validation helpers, utility functions, and
the calculate_dashboard_stats function.

These are pure-function tests (no Flask client needed).
"""

import json
import base64
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
import pytest


# ---------------------------------------------------------------------------
# Import the real module (heavy deps already mocked by conftest)
# ---------------------------------------------------------------------------
import flask_app as fa


# ═══════════════════════════════════════════════════════════════════════════════
#  ValidationError & validate_fields
# ═══════════════════════════════════════════════════════════════════════════════


class TestValidationError:
    def test_error_attributes(self):
        err = fa.ValidationError("email", "is required")
        assert err.field == "email"
        assert err.message == "is required"
        assert "email" in str(err)

    def test_inherits_exception(self):
        err = fa.ValidationError("name", "too long")
        assert isinstance(err, Exception)


class TestValidateFields:
    """validate_fields should raise ValidationError on first failing field."""

    def test_passes_valid_data(self):
        schema = {
            "name": {"required": True, "type": str, "max_length": 50},
            "age": {"required": True, "type": int, "min_val": 0, "max_val": 150},
        }
        fa.validate_fields({"name": "Alice", "age": 30}, schema)  # no exception

    def test_missing_required_field(self):
        schema = {"email": {"required": True, "type": str}}
        with pytest.raises(fa.ValidationError) as exc_info:
            fa.validate_fields({}, schema)
        assert exc_info.value.field == "email"

    def test_wrong_type(self):
        schema = {"age": {"required": True, "type": int}}
        with pytest.raises(fa.ValidationError):
            fa.validate_fields({"age": "not a number"}, schema)

    def test_max_length_exceeded(self):
        schema = {"name": {"required": True, "type": str, "max_length": 5}}
        with pytest.raises(fa.ValidationError):
            fa.validate_fields({"name": "toolongname"}, schema)

    def test_blank_required_string(self):
        schema = {"name": {"required": True, "type": str}}
        with pytest.raises(fa.ValidationError):
            fa.validate_fields({"name": "   "}, schema)

    def test_min_val(self):
        schema = {"score": {"required": True, "type": float, "min_val": 0.0}}
        with pytest.raises(fa.ValidationError):
            fa.validate_fields({"score": -0.5}, schema)

    def test_max_val(self):
        schema = {"score": {"required": True, "type": float, "max_val": 1.0}}
        with pytest.raises(fa.ValidationError):
            fa.validate_fields({"score": 1.5}, schema)

    def test_allowed_values(self):
        schema = {"role": {"required": True, "type": str, "allowed": ["admin", "user"]}}
        with pytest.raises(fa.ValidationError):
            fa.validate_fields({"role": "superadmin"}, schema)

    def test_allowed_values_pass(self):
        schema = {"role": {"required": True, "type": str, "allowed": ["admin", "user"]}}
        fa.validate_fields({"role": "admin"}, schema)

    def test_optional_field_skipped(self):
        schema = {"bio": {"required": False, "type": str, "max_length": 500}}
        fa.validate_fields({}, schema)  # no exception


# ═══════════════════════════════════════════════════════════════════════════════
#  serialize_datetime
# ═══════════════════════════════════════════════════════════════════════════════


class TestSerializeDatetime:
    def test_dict_with_datetime(self):
        now = datetime(2026, 3, 1, 12, 0, 0)
        obj = {"created": now, "name": "test"}
        result = fa.serialize_datetime(obj)
        assert result["created"] == "2026-03-01T12:00:00"
        assert result["name"] == "test"

    def test_nested_dict(self):
        now = datetime(2026, 1, 1)
        obj = {"inner": {"ts": now}}
        fa.serialize_datetime(obj)
        assert obj["inner"]["ts"] == "2026-01-01T00:00:00"

    def test_list_of_dicts(self):
        now = datetime(2026, 6, 15)
        obj = [{"ts": now}]
        fa.serialize_datetime(obj)
        assert obj[0]["ts"] == "2026-06-15T00:00:00"

    def test_no_datetime(self):
        obj = {"key": "value", "num": 42}
        result = fa.serialize_datetime(obj)
        assert result == {"key": "value", "num": 42}


# ═══════════════════════════════════════════════════════════════════════════════
#  _format_time_ago
# ═══════════════════════════════════════════════════════════════════════════════


class TestFormatTimeAgo:
    def test_none_input(self):
        assert fa._format_time_ago(None) == "Recently"

    def test_just_now(self):
        result = fa._format_time_ago(datetime.now())
        assert result == "Just now"

    def test_minutes_ago(self):
        result = fa._format_time_ago(datetime.now() - timedelta(minutes=5))
        assert "minute" in result

    def test_hours_ago(self):
        result = fa._format_time_ago(datetime.now() - timedelta(hours=3))
        assert "hour" in result

    def test_days_ago(self):
        result = fa._format_time_ago(datetime.now() - timedelta(days=2))
        assert "day" in result

    def test_iso_string(self):
        ts = (datetime.now() - timedelta(hours=1)).isoformat()
        result = fa._format_time_ago(ts)
        assert "hour" in result or "minute" in result

    def test_invalid_type(self):
        assert fa._format_time_ago(12345) == "Recently"


# ═══════════════════════════════════════════════════════════════════════════════
#  _safe_float
# ═══════════════════════════════════════════════════════════════════════════════


class TestSafeFloat:
    def test_normal_float(self):
        assert fa._safe_float(3.14159, decimals=2) == 3.14

    def test_none_returns_default(self):
        assert fa._safe_float(None, default=0) == 0

    def test_string_number(self):
        assert fa._safe_float("42.7", decimals=0) == 43.0

    def test_invalid_string(self):
        assert fa._safe_float("abc", default=-1) == -1


# ═══════════════════════════════════════════════════════════════════════════════
#  _decode_jwt_payload
# ═══════════════════════════════════════════════════════════════════════════════


class TestDecodeJwtPayload:
    def test_valid_jwt(self):
        header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256"}).encode()).decode().rstrip("=")
        payload = base64.urlsafe_b64encode(json.dumps({"sub": "user_1", "exp": 9999999999}).encode()).decode().rstrip("=")
        sig = base64.urlsafe_b64encode(b"sig").decode().rstrip("=")
        token = f"{header}.{payload}.{sig}"

        result = fa._decode_jwt_payload(token)
        assert result["sub"] == "user_1"

    def test_malformed_token(self):
        assert fa._decode_jwt_payload("not.a.jwt") is None

    def test_too_few_parts(self):
        assert fa._decode_jwt_payload("onlyonepart") is None

    def test_empty_string(self):
        assert fa._decode_jwt_payload("") is None


# ═══════════════════════════════════════════════════════════════════════════════
#  _build_allowed_origins
# ═══════════════════════════════════════════════════════════════════════════════


class TestBuildAllowedOrigins:
    def test_includes_dev_origins(self):
        origins = fa._build_allowed_origins()
        assert "http://localhost:5173" in origins
        assert "http://localhost:3000" in origins

    def test_no_duplicates(self):
        origins = fa._build_allowed_origins()
        assert len(origins) == len(set(origins))


# ═══════════════════════════════════════════════════════════════════════════════
#  calculate_dashboard_stats
# ═══════════════════════════════════════════════════════════════════════════════


class TestCalculateDashboardStats:
    def test_empty_results(self):
        stats = fa.calculate_dashboard_stats([])
        assert stats["today_diagnoses"] == 0
        assert stats["active_forecasts"] == 0
        assert stats["risk_regions"] == 0
        assert stats["system_health"] == 100.0  # no errors recorded
        assert len(stats["recent_activity"]) == 3  # filled with defaults

    def test_with_diagnosis_today(self):
        now = datetime.now().isoformat() + "Z"
        results = [
            {"type": "diagnosis", "timestamp": now, "result": {"label": "Uninfected"}},
        ]
        stats = fa.calculate_dashboard_stats(results)
        assert stats["today_diagnoses"] == 1

    def test_with_forecast(self):
        now = datetime.now().isoformat() + "Z"
        results = [
            {
                "type": "forecast",
                "timestamp": now,
                "input": {"region": "Kerala"},
                "result": {"hotspot_score": 0.8},
            },
        ]
        stats = fa.calculate_dashboard_stats(results)
        assert stats["active_forecasts"] == 1
        assert stats["risk_regions"] >= 1


# ═══════════════════════════════════════════════════════════════════════════════
#  track_performance decorator
# ═══════════════════════════════════════════════════════════════════════════════


class TestTrackPerformance:
    def test_increments_success(self):
        old_success = fa.SUCCESS_COUNT

        @fa.track_performance
        def dummy():
            return {"ok": True}

        dummy()
        assert fa.SUCCESS_COUNT == old_success + 1

    def test_increments_error_on_exception(self):
        old_error = fa.ERROR_COUNT

        @fa.track_performance
        def fail():
            raise ValueError("boom")

        with pytest.raises(ValueError):
            fail()
        assert fa.ERROR_COUNT == old_error + 1

    def test_tracks_time(self):
        @fa.track_performance
        def slow():
            import time
            time.sleep(0.01)
            return "ok"

        slow()
        # At least one timing entry should exist
        assert len(fa.REQUEST_TIMES) > 0
