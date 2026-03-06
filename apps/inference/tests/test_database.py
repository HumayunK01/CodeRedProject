"""
Tests for db/database.py — all DB calls are mocked via psycopg.

Tests cover:
  - upsert_user (insert + update paths)
  - get_user_by_clerk_id (found / not found)
  - get_user_with_stats
  - create_diagnosis
  - get_diagnoses_by_user
  - get_diagnosis_stats_by_user
  - create_forecast
  - get_forecasts_by_user
  - get_forecast_stats_by_user
  - get_user_activity
"""

from datetime import datetime
from unittest.mock import MagicMock, patch


# ---------------------------------------------------------------------------
# Helper: build a mock connection / cursor context manager
# ---------------------------------------------------------------------------
def _mock_db_connection(rows=None, fetchone_val=None, fetchall_val=None):
    """Return a mock psycopg connection context manager."""
    mock_cursor = MagicMock()
    if fetchone_val is not None:
        mock_cursor.fetchone.return_value = fetchone_val
    else:
        mock_cursor.fetchone.return_value = rows[0] if rows else None
    mock_cursor.fetchall.return_value = fetchall_val if fetchall_val is not None else (rows or [])

    mock_conn = MagicMock()
    mock_conn.__enter__ = MagicMock(return_value=mock_conn)
    mock_conn.__exit__ = MagicMock(return_value=False)
    mock_conn.cursor.return_value.__enter__ = MagicMock(return_value=mock_cursor)
    mock_conn.cursor.return_value.__exit__ = MagicMock(return_value=False)

    return mock_conn, mock_cursor


# ---------------------------------------------------------------------------
# Patch path — we patch get_db_connection at the module level
# ---------------------------------------------------------------------------
DB_MOD = "db.database"
PATCH_CONN = f"{DB_MOD}.get_db_connection"


# We need to import the real module — not the mock from conftest.
# So we re-import it directly from the file.
import importlib.util
import os
import sys

_spec = importlib.util.spec_from_file_location(
    "db.database",
    os.path.join(os.path.dirname(__file__), "..", "db", "database.py"),
)
_real_db = importlib.util.module_from_spec(_spec)

# We need psycopg available (or mocked) for the import
sys.modules.setdefault("psycopg", MagicMock())
sys.modules.setdefault("psycopg.rows", MagicMock())

_spec.loader.exec_module(_real_db)

# Alias functions under test
upsert_user = _real_db.upsert_user
get_user_by_clerk_id = _real_db.get_user_by_clerk_id
get_user_with_stats = _real_db.get_user_with_stats
create_diagnosis = _real_db.create_diagnosis
get_diagnoses_by_user = _real_db.get_diagnoses_by_user
get_diagnosis_stats_by_user = _real_db.get_diagnosis_stats_by_user
create_forecast = _real_db.create_forecast
get_forecasts_by_user = _real_db.get_forecasts_by_user
get_forecast_stats_by_user = _real_db.get_forecast_stats_by_user
get_user_activity = _real_db.get_user_activity

# Patch target for the real module
REAL_CONN = "db.database.get_db_connection"


class TestUpsertUser:
    """upsert_user should INSERT when user doesn't exist, UPDATE when it does."""

    @patch.object(_real_db, "get_db_connection")
    def test_insert_new_user(self, mock_get_conn):
        new_user = {
            "id": "uuid-1",
            "clerkId": "clerk_new",
            "email": "new@example.com",
            "firstName": "Test",
            "lastName": "User",
            "imageUrl": None,
            "createdAt": datetime.now(),
            "updatedAt": datetime.now(),
        }
        mock_conn, mock_cursor = _mock_db_connection()
        # First fetchone (SELECT) returns None → new user
        mock_cursor.fetchone.side_effect = [None, new_user]
        mock_get_conn.return_value = mock_conn

        result = upsert_user("clerk_new", "new@example.com", "Test", "User")

        assert result["clerkId"] == "clerk_new"
        assert result["email"] == "new@example.com"
        # Two SQL calls: SELECT then INSERT
        assert mock_cursor.execute.call_count == 2

    @patch.object(_real_db, "get_db_connection")
    def test_update_existing_user(self, mock_get_conn):
        existing = {
            "id": "uuid-2",
            "clerkId": "clerk_existing",
            "email": "old@example.com",
        }
        updated = {**existing, "email": "updated@example.com", "firstName": "Updated"}
        mock_conn, mock_cursor = _mock_db_connection()
        mock_cursor.fetchone.side_effect = [existing, updated]
        mock_get_conn.return_value = mock_conn

        result = upsert_user("clerk_existing", "updated@example.com", "Updated")

        assert result["email"] == "updated@example.com"
        assert mock_cursor.execute.call_count == 2  # SELECT + UPDATE


class TestGetUserByClerkId:
    @patch.object(_real_db, "get_db_connection")
    def test_found(self, mock_get_conn):
        user = {"id": "uuid-3", "clerkId": "clerk_123", "email": "a@b.com"}
        mock_conn, mock_cursor = _mock_db_connection(fetchone_val=user)
        mock_get_conn.return_value = mock_conn

        result = get_user_by_clerk_id("clerk_123")
        assert result["clerkId"] == "clerk_123"

    @patch.object(_real_db, "get_db_connection")
    def test_not_found(self, mock_get_conn):
        mock_conn, mock_cursor = _mock_db_connection(fetchone_val=None)
        mock_get_conn.return_value = mock_conn

        result = get_user_by_clerk_id("nonexistent")
        assert result is None


class TestGetUserWithStats:
    @patch.object(_real_db, "get_db_connection")
    def test_returns_stats(self, mock_get_conn):
        row = {
            "id": "uuid-4",
            "clerkId": "clerk_s",
            "email": "s@b.com",
            "diagnosis_count": 5,
            "forecast_count": 3,
            "report_count": 1,
        }
        mock_conn, mock_cursor = _mock_db_connection(fetchone_val=row)
        mock_get_conn.return_value = mock_conn

        result = get_user_with_stats("clerk_s")
        assert result["_count"]["diagnoses"] == 5
        assert result["_count"]["forecasts"] == 3
        assert result["_count"]["reports"] == 1
        assert "diagnosis_count" not in result  # popped

    @patch.object(_real_db, "get_db_connection")
    def test_not_found(self, mock_get_conn):
        mock_conn, mock_cursor = _mock_db_connection(fetchone_val=None)
        mock_get_conn.return_value = mock_conn

        assert get_user_with_stats("missing") is None


class TestCreateDiagnosis:
    @patch.object(_real_db, "get_db_connection")
    def test_creates_diagnosis(self, mock_get_conn):
        diag = {
            "id": "diag-1",
            "userId": "uuid-5",
            "result": "Parasitized",
            "confidence": 0.95,
            "createdAt": datetime.now(),
        }
        mock_conn, mock_cursor = _mock_db_connection(fetchone_val=diag)
        mock_get_conn.return_value = mock_conn

        result = create_diagnosis(
            user_id="uuid-5",
            result="Parasitized",
            confidence=0.95,
            image_url="https://example.com/img.png",
        )
        assert result["result"] == "Parasitized"
        assert result["confidence"] == 0.95


class TestGetDiagnosesByUser:
    @patch.object(_real_db, "get_db_connection")
    def test_returns_list(self, mock_get_conn):
        rows = [
            {"id": "d1", "result": "Parasitized"},
            {"id": "d2", "result": "Uninfected"},
        ]
        mock_conn, mock_cursor = _mock_db_connection(fetchall_val=rows)
        mock_get_conn.return_value = mock_conn

        result = get_diagnoses_by_user("uuid-5", limit=10)
        assert len(result) == 2
        assert result[0]["result"] == "Parasitized"


class TestGetDiagnosisStatsByUser:
    @patch.object(_real_db, "get_db_connection")
    def test_stats(self, mock_get_conn):
        row = {"total": 10, "positive": 3, "negative": 7, "last_diagnosis": datetime.now()}
        mock_conn, mock_cursor = _mock_db_connection(fetchone_val=row)
        mock_get_conn.return_value = mock_conn

        result = get_diagnosis_stats_by_user("uuid-5")
        assert result["total"] == 10
        assert result["positive"] == 3
        assert result["negative"] == 7
        assert result["lastDiagnosis"] is not None


class TestCreateForecast:
    @patch.object(_real_db, "get_db_connection")
    def test_creates_forecast(self, mock_get_conn):
        fc = {
            "id": "fc-1",
            "userId": "uuid-6",
            "region": "Maharashtra",
            "riskLevel": "high",
            "createdAt": datetime.now(),
        }
        mock_conn, mock_cursor = _mock_db_connection(fetchone_val=fc)
        mock_get_conn.return_value = mock_conn

        result = create_forecast(
            user_id="uuid-6",
            region="Maharashtra",
            horizon_weeks=4,
            predictions=[{"week": "2026-03-10", "cases": 100}],
            risk_level="High",
        )
        assert result["region"] == "Maharashtra"


class TestGetForecastsByUser:
    @patch.object(_real_db, "get_db_connection")
    def test_returns_list(self, mock_get_conn):
        rows = [{"id": "fc1", "region": "Kerala"}, {"id": "fc2", "region": "Goa"}]
        mock_conn, mock_cursor = _mock_db_connection(fetchall_val=rows)
        mock_get_conn.return_value = mock_conn

        result = get_forecasts_by_user("uuid-6", limit=5)
        assert len(result) == 2


class TestGetForecastStatsByUser:
    @patch.object(_real_db, "get_db_connection")
    def test_stats(self, mock_get_conn):
        row = {"total": 8, "active": 2, "high_risk": 1, "last_forecast": datetime.now()}
        mock_conn, mock_cursor = _mock_db_connection(fetchone_val=row)
        mock_get_conn.return_value = mock_conn

        result = get_forecast_stats_by_user("uuid-6")
        assert result["total"] == 8
        assert result["active"] == 2
        assert result["highRisk"] == 1


class TestGetUserActivity:
    @patch.object(_real_db, "get_db_connection")
    def test_returns_mixed_activity(self, mock_get_conn):
        diag_rows = [
            {"type": "diagnosis", "id": "d1", "result": "Parasitized", "confidence": 0.9, "createdAt": datetime.now()},
        ]
        forecast_rows = [
            {"type": "forecast", "id": "f1", "result": None, "confidence": None, "createdAt": datetime.now()},
        ]
        mock_conn, mock_cursor = _mock_db_connection()
        # get_user_activity runs two fetchall() calls: diagnoses then forecasts
        mock_cursor.fetchall.side_effect = [diag_rows, forecast_rows]
        mock_get_conn.return_value = mock_conn

        result = get_user_activity("uuid-7", limit=5)
        assert len(result) == 2
        assert result[0]["type"] in ("diagnosis", "forecast")
