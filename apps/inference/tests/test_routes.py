"""
Tests for Flask API routes in flask_app.py.

All external dependencies (DB, models, Clerk, network) are mocked.
"""

import io
import json
import base64
from datetime import datetime
from unittest.mock import patch, MagicMock
import pytest


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_token(sub="user_test123", exp=9999999999):
    """Build a fake 3-part JWT token for Authorization header."""
    header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "kid": "test"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps({"sub": sub, "exp": exp}).encode()).decode().rstrip("=")
    sig = base64.urlsafe_b64encode(b"fakesig").decode().rstrip("=")
    return f"{header}.{payload}.{sig}"


# ---------------------------------------------------------------------------
# PUBLIC ROUTES (no auth)
# ---------------------------------------------------------------------------


class TestPublicRoutes:
    def test_home(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "name" in data
        assert data["status"] == "running"

    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["status"] == "ok"
        assert "models_loaded" in data
        assert "timestamp" in data

    def test_dashboard_stats_unauthenticated(self, client):
        """Dashboard fallback path with empty stored results."""
        resp = client.get("/dashboard/stats")
        assert resp.status_code == 200
        data = resp.get_json()
        assert "today_diagnoses" in data
        assert "system_health" in data

    def test_dashboard_stats_with_stored_results(self, client):
        now = datetime.now().isoformat() + "Z"
        stored = json.dumps([
            {"type": "diagnosis", "timestamp": now, "result": {"label": "Uninfected"}},
        ])
        resp = client.get(f"/dashboard/stats?stored_results={stored}")
        assert resp.status_code == 200
        data = resp.get_json()
        assert data["today_diagnoses"] >= 0


# ---------------------------------------------------------------------------
# AUTH-PROTECTED ROUTES (needs JWT bypass)
# ---------------------------------------------------------------------------


class TestAuthMiddleware:
    """Test that auth decorator rejects bad tokens."""

    def test_missing_token(self, client):
        resp = client.post("/api/users/sync", json={"clerkId": "test"})
        assert resp.status_code == 401

    def test_malformed_token(self, client):
        resp = client.post(
            "/api/users/sync",
            headers={"Authorization": "Bearer not-a-jwt"},
            json={"clerkId": "test"},
        )
        assert resp.status_code == 401

    def test_expired_token(self, client):
        token = _make_token(exp=1)  # expired in 1970
        resp = client.post(
            "/api/users/sync",
            headers={"Authorization": f"Bearer {token}"},
            json={"clerkId": "user_test123"},
        )
        assert resp.status_code == 401


class TestSyncUser:
    """POST /api/users/sync"""

    @patch("flask_app.get_user_with_stats")
    @patch("flask_app.upsert_user")
    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_sync_success(self, _pk, mock_get_user, mock_upsert, mock_stats, client):
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}
        mock_upsert.return_value = {"id": "u1", "clerkId": "user_test123", "email": "a@b.com"}
        mock_stats.return_value = {
            "id": "u1",
            "clerkId": "user_test123",
            "email": "a@b.com",
            "_count": {"diagnoses": 0, "forecasts": 0, "reports": 0},
        }

        token = _make_token()
        resp = client.post(
            "/api/users/sync",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "clerkId": "user_test123",
                "email": "a@b.com",
                "firstName": "Test",
                "lastName": "User",
            },
        )
        assert resp.status_code == 200

    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_sync_mismatched_clerk_id(self, _pk, mock_get_user, client):
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}

        token = _make_token(sub="user_test123")
        resp = client.post(
            "/api/users/sync",
            headers={"Authorization": f"Bearer {token}"},
            json={"clerkId": "user_OTHER", "email": "a@b.com"},
        )
        assert resp.status_code == 403

    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_sync_no_body(self, _pk, mock_get_user, client):
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}
        token = _make_token()
        resp = client.post(
            "/api/users/sync",
            headers={"Authorization": f"Bearer {token}"},
            content_type="application/json",
            data="",
        )
        # Empty body → Flask raises 400 which is caught by generic except → 500
        assert resp.status_code in (400, 500)


class TestDiagnosisRoutes:
    """POST /api/diagnoses and GET /api/diagnoses/<clerk_id>"""

    @patch("flask_app.db_create_diagnosis")
    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_create_diagnosis(self, _pk, mock_get_user, mock_create, client):
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}
        mock_create.return_value = {
            "id": "diag-1",
            "userId": "u1",
            "result": "Parasitized",
            "confidence": 0.95,
        }

        token = _make_token()
        resp = client.post(
            "/api/diagnoses",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "clerkId": "user_test123",
                "result": "Parasitized",
                "confidence": 0.95,
            },
        )
        assert resp.status_code == 201
        data = resp.get_json()
        assert data["result"] == "Parasitized"

    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_create_diagnosis_validation_error(self, _pk, mock_get_user, client):
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}

        token = _make_token()
        resp = client.post(
            "/api/diagnoses",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "clerkId": "user_test123",
                "result": "X" * 200,  # exceeds max_length=100
                "confidence": 0.5,
            },
        )
        assert resp.status_code == 422

    @patch("flask_app.get_diagnoses_by_user")
    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_get_diagnoses(self, _pk, mock_get_user, mock_get_diags, client):
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}
        mock_get_diags.return_value = [
            {"id": "d1", "result": "Uninfected", "createdAt": datetime.now()},
        ]

        token = _make_token()
        resp = client.get(
            "/api/diagnoses/user_test123",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        assert isinstance(resp.get_json(), list)


class TestForecastRoutes:
    """POST /api/forecasts and GET /api/forecasts/<clerk_id>"""

    @patch("flask_app.db_create_forecast")
    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_create_forecast(self, _pk, mock_get_user, mock_create, client):
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}
        mock_create.return_value = {
            "id": "fc-1",
            "userId": "u1",
            "region": "Kerala",
            "riskLevel": "high",
            "createdAt": datetime.now(),
        }

        token = _make_token()
        resp = client.post(
            "/api/forecasts",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "clerkId": "user_test123",
                "region": "Kerala",
                "horizonWeeks": 4,
                "riskLevel": "High",
            },
        )
        assert resp.status_code == 201

    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_create_forecast_validation_error(self, _pk, mock_get_user, client):
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}

        token = _make_token()
        resp = client.post(
            "/api/forecasts",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "clerkId": "user_test123",
                "region": "Kerala",
                "horizonWeeks": 100,  # exceeds max_val=52
            },
        )
        assert resp.status_code == 422


class TestPredictSymptoms:
    """POST /predict/symptoms — rule-based fallback (model not loaded)."""

    def test_no_auth_returns_401(self, client):
        resp = client.post("/predict/symptoms", json={"fever": False})
        assert resp.status_code == 401

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_no_data(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/predict/symptoms",
            headers={"Authorization": f"Bearer {token}"},
            content_type="application/json",
            data="",
        )
        # Empty body → Flask raises inside generic except → 500
        assert resp.status_code in (400, 500)

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_rule_based_low_risk(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/predict/symptoms",
            headers={"Authorization": f"Bearer {token}"},
            json={"fever": False},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "Low" in data["label"]

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_rule_based_high_risk(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/predict/symptoms",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "fever": True,
                "chills": True,
                "headache": True,
                "fatigue": True,
                "anemia_level": 1,
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "High" in data["label"]

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_rule_based_medium_risk(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/predict/symptoms",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "fever": True,
                "anemia_level": 4,
            },
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "Medium" in data["label"]


class TestPredictImage:
    """POST /predict/image — model is None so should return 500."""

    def test_no_auth_returns_401(self, client):
        resp = client.post(
            "/predict/image",
            data={"file": (io.BytesIO(b"fakeimg"), "cell.png")},
            content_type="multipart/form-data",
        )
        assert resp.status_code == 401

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_no_model_loaded(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/predict/image",
            headers={"Authorization": f"Bearer {token}"},
            data={"file": (io.BytesIO(b"fakeimg"), "cell.png")},
            content_type="multipart/form-data",
        )
        assert resp.status_code == 500

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_no_file_provided(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/predict/image",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 500  # model is None → first check


class TestForecastRegion:
    """POST /forecast/region — model is None."""

    def test_no_auth_returns_401(self, client):
        resp = client.post("/forecast/region", json={"region": "Kerala"})
        assert resp.status_code == 401

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_no_model_loaded(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/forecast/region",
            headers={"Authorization": f"Bearer {token}"},
            json={"region": "Kerala"},
        )
        assert resp.status_code == 500

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_no_data(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/forecast/region",
            headers={"Authorization": f"Bearer {token}"},
            content_type="application/json",
            data="",
        )
        assert resp.status_code == 500


class TestForecastRegionsGet:
    """GET /forecast/regions — reads CSV."""

    def test_no_auth_returns_401(self, client):
        resp = client.get("/forecast/regions")
        assert resp.status_code == 401

    @patch("routes.predictions.pd.read_csv")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_returns_regions(self, _pk, mock_csv, client):
        import pandas as pd
        mock_csv.return_value = pd.DataFrame({"Region": ["Kerala", "Goa", "Kerala"]})
        token = _make_token()
        resp = client.get(
            "/forecast/regions",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 200
        data = resp.get_json()
        assert "regions" in data
        assert "Kerala" in data["regions"]

    @patch("routes.predictions.pd.read_csv", side_effect=FileNotFoundError("CSV not found"))
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_csv_missing(self, _pk, mock_csv, client):
        token = _make_token()
        resp = client.get(
            "/forecast/regions",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert resp.status_code == 500


class TestGenerateReport:
    """POST /api/generate_report"""

    def test_no_auth_returns_401(self, client):
        resp = client.post("/api/generate_report", json={"patientName": "X"})
        assert resp.status_code == 401

    @patch("routes.reports.pisa")
    @patch("routes.reports.render_template")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_generates_pdf(self, _pk, mock_render, mock_pisa, client):
        mock_render.return_value = "<html><body>Report</body></html>"
        mock_pisa_status = MagicMock()
        mock_pisa_status.err = 0
        mock_pisa.CreatePDF.return_value = mock_pisa_status

        token = _make_token()
        resp = client.post(
            "/api/generate_report",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "patientName": "Test Patient",
                "patientAge": 30,
                "result": "Uninfected",
                "confidence": 0.92,
            },
        )
        assert resp.status_code == 200
        assert resp.content_type == "application/pdf"

    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_no_data(self, _pk, client):
        token = _make_token()
        resp = client.post(
            "/api/generate_report",
            headers={"Authorization": f"Bearer {token}"},
            content_type="application/json",
            data="",
        )
        # Empty body → Flask raises inside generic except → 500
        assert resp.status_code in (400, 500)


class TestAdminRoutes:
    """Admin endpoints require role=admin."""

    @patch("flask_app.get_user_by_clerk_id")
    @patch("core.auth.get_clerk_public_key", return_value=None)
    def test_admin_users_forbidden_for_patient(self, _pk, mock_get_user, client):
        """A regular user can't access admin routes."""
        mock_get_user.return_value = {"id": "u1", "clerkId": "user_test123"}

        token = _make_token()
        # get_caller_role will try to call Clerk API — mock it
        with patch("core.auth.get_caller_role", return_value=("patient", "ok")):
            resp = client.get(
                "/admin/users",
                headers={"Authorization": f"Bearer {token}"},
            )
        assert resp.status_code == 403
