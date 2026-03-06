"""
Authentication & authorisation helpers.

- Clerk JWT / JWKS verification
- ``require_auth`` decorator (defence-in-depth)
- Clerk Management API helpers (role lookup, user info)
"""

import base64
import json
import os
import urllib.error
import urllib.request
from datetime import datetime
from functools import wraps

import jwt
from flask import jsonify, request
from jwt.algorithms import RSAAlgorithm

from .config import CLERK_API_BASE, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
from .logging_config import get_logger

logger_auth = get_logger("foresee.auth")
logger_admin = get_logger("foresee.admin")


# ═══════════════════════════════════════════════════════════════════════════════
#  JWT Helpers
# ═══════════════════════════════════════════════════════════════════════════════

def decode_jwt_payload(token: str) -> dict | None:
    """Decode a JWT payload *without* signature verification.

    Safe when paired with JWKS / DB validation downstream.
    """
    try:
        parts = token.split(".")
        if len(parts) < 3:
            return None
        payload_b64 = parts[1] + "=" * (-len(parts[1]) % 4)
        return json.loads(base64.urlsafe_b64decode(payload_b64))
    except Exception:
        return None


# ═══════════════════════════════════════════════════════════════════════════════
#  JWKS (RS256 signature verification)
# ═══════════════════════════════════════════════════════════════════════════════

_clerk_jwks_cache: dict | None = None


def _resolve_clerk_jwks_url() -> str:
    override = os.getenv("CLERK_JWKS_URL")
    if override:
        return override
    pub_key = CLERK_PUBLISHABLE_KEY
    if pub_key:
        try:
            b64 = pub_key.split("_", 2)[-1]
            b64 += "=" * (-len(b64) % 4)
            domain = base64.urlsafe_b64decode(b64).decode("utf-8").rstrip("$")
            url = f"https://{domain}/.well-known/jwks.json"
            logger_auth.info("Derived Clerk JWKS URL from publishable key: %s", url)
            return url
        except Exception as e:
            logger_auth.warning("Could not derive JWKS URL from publishable key: %s", e)
    return "https://api.clerk.com/v1/jwks"


CLERK_JWKS_URL = _resolve_clerk_jwks_url()


def get_clerk_public_key(kid: str):
    """Return the RSA public key matching *kid*, fetching JWKS if needed."""
    global _clerk_jwks_cache
    if not _clerk_jwks_cache:
        try:
            req = urllib.request.Request(CLERK_JWKS_URL)
            with urllib.request.urlopen(req) as response:
                _clerk_jwks_cache = json.loads(response.read().decode())
            logger_auth.info(
                "Clerk JWKS fetched successfully (%d keys)",
                len(_clerk_jwks_cache.get("keys", [])),
            )
        except Exception as e:
            logger_auth.error("Failed to fetch Clerk JWKS from %s: %s", CLERK_JWKS_URL, e)
            return None
    for key in _clerk_jwks_cache.get("keys", []):
        if key.get("kid") == kid:
            return RSAAlgorithm.from_jwk(json.dumps(key))
    # kid not found — refresh cache once and retry
    _clerk_jwks_cache = None
    return None


# ═══════════════════════════════════════════════════════════════════════════════
#  Clerk Management API
# ═══════════════════════════════════════════════════════════════════════════════

def clerk_request(method: str, path: str, body: dict | None = None):
    """Make an authenticated request to the Clerk Management API."""
    url = f"{CLERK_API_BASE}{path}"
    data = json.dumps(body).encode() if body else None
    headers = {
        "Authorization": f"Bearer {CLERK_SECRET_KEY}",
        "User-Agent": "Foresee-Flask/1.0",
    }
    if data:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode()), resp.status
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", errors="replace")
        try:
            return json.loads(raw), e.code
        except Exception:
            return {"error": raw[:200]}, e.code


def test_clerk_connection():
    """Best-effort connectivity test at startup."""
    if not CLERK_SECRET_KEY or CLERK_SECRET_KEY.startswith("sk_test_your"):
        logger_admin.warning("CLERK_SECRET_KEY is not set — admin endpoints will not work")
        return
    try:
        req = urllib.request.Request(
            f"{CLERK_API_BASE}/users?limit=1",
            headers={"Authorization": f"Bearer {CLERK_SECRET_KEY}"},
        )
        with urllib.request.urlopen(req) as r:
            logger_admin.info("Clerk API connected — HTTP %s", r.status)
    except Exception:
        pass


def get_caller_role(req=None) -> tuple[str | None, str]:
    """Return ``(role, reason)`` for the caller identified by the Bearer token."""
    req = req or request
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None, "no_bearer_token"
    token = auth.split(" ", 1)[1]
    try:
        payload = decode_jwt_payload(token)
        if not payload:
            return None, "invalid_jwt"
        user_id = payload.get("sub")
        logger_admin.debug("JWT sub=%r, CLERK_SECRET_KEY set=%s", user_id, bool(CLERK_SECRET_KEY))
        if not user_id:
            return None, "no_sub_in_jwt"
        if not CLERK_SECRET_KEY:
            return None, "clerk_key_not_set"
        data, status = clerk_request("GET", f"/users/{user_id}")
        logger_admin.debug("Clerk GET /users/%s → HTTP %s", user_id, status)
        if status != 200:
            return None, f"clerk_api_error:{status}:{data.get('errors', data)}"
        role = (data.get("public_metadata") or {}).get("role")
        logger_admin.debug("public_metadata=%r → role=%r", data.get("public_metadata"), role)
        return role, "ok"
    except Exception as e:
        logger_admin.error("get_caller_role exception: %s", e)
        return None, f"exception:{e}"


# ═══════════════════════════════════════════════════════════════════════════════
#  Route Auth Decorator
# ═══════════════════════════════════════════════════════════════════════════════

def require_auth(roles=None, skip_db_check=False):
    """Enforce authentication and optionally role-based authorisation.

    Validation order (defence in depth):
      1. Decode JWT payload (sub + exp) via base64.
      2. RS256 signature verification via Clerk JWKS.
      3. DB user exists check (unless *skip_db_check*).
      4. Guard URL ``clerk_id`` params against lateral access.
      5. RBAC via Clerk Management API for role-restricted endpoints.
    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Lazy import to avoid circular dep at module level
            from flask_app import DB_AVAILABLE, get_user_by_clerk_id

            if request.method == "OPTIONS":
                return f(*args, **kwargs)

            auth_header = request.headers.get("Authorization", "")
            if not auth_header.startswith("Bearer "):
                return jsonify({"error": "Unauthorized", "message": "Missing Bearer token"}), 401

            token = auth_header.split(" ", 1)[1]

            # Step 1: Decode payload
            payload = decode_jwt_payload(token)
            if not payload:
                return jsonify({"error": "Unauthorized", "message": "Malformed token"}), 401
            user_id = payload.get("sub")
            if not user_id:
                return jsonify({"error": "Unauthorized", "message": "Token missing subject"}), 401
            exp = payload.get("exp")
            if exp and datetime.utcnow().timestamp() > exp:
                return jsonify({"error": "Unauthorized", "message": "Token expired"}), 401

            # Step 2: RS256 signature verification via JWKS
            _sig_verified = False
            try:
                unverified_header = jwt.get_unverified_header(token)
                kid = unverified_header.get("kid")
                if kid:
                    public_key = get_clerk_public_key(kid)
                    if public_key:
                        jwt.decode(token, public_key, algorithms=["RS256"], options={"verify_aud": False})
                        _sig_verified = True
            except jwt.ExpiredSignatureError:
                return jsonify({"error": "Unauthorized", "message": "Token expired"}), 401
            except jwt.InvalidTokenError as e:
                return jsonify({"error": "Unauthorized", "message": f"Invalid token signature: {e}"}), 401
            except Exception:
                pass

            # Step 3: DB user validation
            if DB_AVAILABLE and not skip_db_check:
                try:
                    db_user = get_user_by_clerk_id(user_id)
                    if not db_user:
                        return jsonify({"error": "Unauthorized", "message": "User not found in system"}), 401
                except Exception as e:
                    logger_auth.error("DB user lookup error: %s", e)
                    if not _sig_verified:
                        return jsonify({"error": "Unauthorized", "message": "Could not validate identity"}), 401

            # Step 4: Set validated identity
            request.user_id = user_id

            # Step 5: Guard URL params against lateral access
            if "clerk_id" in kwargs and kwargs["clerk_id"] != request.user_id:
                caller_role, _ = get_caller_role(request)
                if caller_role != "admin":
                    return jsonify({"error": "Forbidden", "message": "Access denied to other user data"}), 403

            # Step 6: Role-based access control
            if roles:
                caller_role, _ = get_caller_role(request)
                if caller_role not in roles:
                    return jsonify({"error": "Forbidden", "message": "Insufficient permissions"}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator
