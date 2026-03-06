"""
Shared pytest fixtures for the Foresee inference test suite.

All tests mock heavy dependencies (TensorFlow, DB, Clerk, ML models) so they
run in seconds on any CI runner without GPU, database, or network.
"""

import json
import os
import sys
from unittest.mock import MagicMock, patch

import pytest

# ---------------------------------------------------------------------------
# Ensure the inference package root is importable
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.dirname(__file__))


# ---------------------------------------------------------------------------
# Environment variables (set before any app import)
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def _test_env(monkeypatch):
    """Provide safe env vars so app startup doesn't hit real services."""
    monkeypatch.setenv("DATABASE_URL", "postgresql://test:test@localhost:5432/testdb")
    monkeypatch.setenv("CLERK_SECRET_KEY", "sk_test_fake_key")
    monkeypatch.setenv("CLERK_PUBLISHABLE_KEY", "pk_test_fake_key")
    monkeypatch.setenv("FLASK_SECRET_KEY", "test-secret-key-for-ci")
    monkeypatch.setenv("REDIS_URL", "")  # Force in-memory limiter
    monkeypatch.setenv("TF_CPP_MIN_LOG_LEVEL", "3")


# ---------------------------------------------------------------------------
# Patch heavy imports BEFORE the flask app is ever imported
# ---------------------------------------------------------------------------
_tf_mock = MagicMock()
_cv2_mock = MagicMock()

# Mock tensorflow.keras so flask_app.py can be imported without GPU/TF
sys.modules.setdefault("tensorflow", _tf_mock)
sys.modules.setdefault("tensorflow.keras", _tf_mock.keras)
sys.modules.setdefault("tensorflow.keras.models", _tf_mock.keras.models)
sys.modules.setdefault("tensorflow.keras.preprocessing", _tf_mock.keras.preprocessing)
sys.modules.setdefault("tensorflow.keras.preprocessing.image", _tf_mock.keras.preprocessing.image)

# Mock cv2
sys.modules.setdefault("cv2", _cv2_mock)

# Mock xhtml2pdf
_pisa_mock = MagicMock()
sys.modules.setdefault("xhtml2pdf", _pisa_mock)
sys.modules.setdefault("xhtml2pdf.pisa", _pisa_mock)


# ---------------------------------------------------------------------------
# Patch database module to prevent real DB connections
# ---------------------------------------------------------------------------
_db_mock = MagicMock()
sys.modules["db"] = _db_mock
sys.modules["db.database"] = _db_mock


# ---------------------------------------------------------------------------
# Flask test client
# ---------------------------------------------------------------------------
@pytest.fixture()
def app():
    """Create the Flask app with testing config.
    
    We re-apply module-level patches for db imports so flask_app sees our mocks.
    """
    # Patch DB functions that flask_app imports at top-level
    with patch.dict("sys.modules", {
        "db": _db_mock,
        "db.database": _db_mock,
    }):
        # Force re-import to pick up mocks
        import importlib
        # If flask_app was already imported, reload it
        if "flask_app" in sys.modules:
            mod = importlib.reload(sys.modules["flask_app"])
        else:
            import flask_app as mod

        mod.app.config["TESTING"] = True
        mod.DB_AVAILABLE = True
        # Ensure models are set to None so routes fall through gracefully
        mod.malaria_model = None
        mod.malaria_forecast_model = None
        mod.symptoms_model = None
        mod.gatekeeper_model = None
        mod.adaptive_ensemble = None
        mod.ensemble_metadata = None

        yield mod.app


@pytest.fixture()
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture()
def auth_headers():
    """Create a fake JWT-like Authorization header for protected routes.
    
    We'll patch the auth decorator to accept this.
    """
    # Build a fake JWT payload (base64 encoded)
    import base64
    header = base64.urlsafe_b64encode(json.dumps({"alg": "RS256", "kid": "test"}).encode()).decode().rstrip("=")
    payload = base64.urlsafe_b64encode(json.dumps({
        "sub": "user_test123",
        "exp": 9999999999,
        "iat": 1000000000,
    }).encode()).decode().rstrip("=")
    signature = base64.urlsafe_b64encode(b"fakesignature").decode().rstrip("=")
    token = f"{header}.{payload}.{signature}"
    return {"Authorization": f"Bearer {token}"}
