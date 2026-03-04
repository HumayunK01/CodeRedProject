"""
Shared utility helpers: validation, serialisation, formatting.

No Flask or ML dependencies — only stdlib.
"""

from datetime import datetime


class ValidationError(Exception):
    """Raised by ``validate_fields`` on the first failing field."""

    def __init__(self, field: str, message: str):
        self.field = field
        self.message = message
        super().__init__(f"{field}: {message}")


def validate_fields(data: dict, schema: dict) -> None:
    """Validate a request-body dict against *schema*.

    Schema format per field::

        {
          "required": bool,
          "type":       type | tuple[type, ...],
          "max_length": int,          # strings only
          "min_val":    number,       # numbers only
          "max_val":    number,
          "allowed":    list,         # enum check
        }

    Raises :class:`ValidationError` on the first failing field.
    """
    for field, rules in schema.items():
        value = data.get(field)
        if value is None:
            if rules.get("required", False):
                raise ValidationError(field, "This field is required")
            continue
        expected_type = rules.get("type")
        if expected_type and not isinstance(value, expected_type):
            raise ValidationError(
                field, f"Expected {expected_type}, got {type(value).__name__}"
            )
        if isinstance(value, str):
            max_len = rules.get("max_length")
            if max_len and len(value) > max_len:
                raise ValidationError(
                    field, f"Exceeds maximum length of {max_len} characters"
                )
            if not value.strip() and rules.get("required"):
                raise ValidationError(field, "Cannot be blank")
        if isinstance(value, (int, float)):
            min_val = rules.get("min_val")
            max_val = rules.get("max_val")
            if min_val is not None and value < min_val:
                raise ValidationError(field, f"Must be >= {min_val}")
            if max_val is not None and value > max_val:
                raise ValidationError(field, f"Must be <= {max_val}")
        allowed = rules.get("allowed")
        if allowed is not None and value not in allowed:
            raise ValidationError(field, f"Must be one of: {allowed}")


def serialize_datetime(obj):
    """Recursively convert ``datetime`` objects to ISO strings in dicts/lists."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, datetime):
                obj[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                serialize_datetime(v)
    elif isinstance(obj, list):
        for item in obj:
            serialize_datetime(item)
    return obj


def format_time_ago(created_at) -> str:
    """Format a datetime (or ISO string) as a human-readable relative time."""
    if not created_at:
        return "Recently"
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return "Recently"
    if not isinstance(created_at, datetime):
        return "Recently"
    try:
        diff = datetime.now(created_at.tzinfo) - created_at
        seconds = diff.total_seconds()
        if seconds < 60:
            return "Just now"
        if seconds < 3600:
            return f"{int(seconds / 60)} minute(s) ago"
        if seconds < 86400:
            return f"{int(seconds / 3600)} hour(s) ago"
        return f"{int(seconds / 86400)} day(s) ago"
    except Exception:
        return "Recently"


def safe_float(value, default=0, decimals=1):
    """Safely convert a value (e.g. ``Decimal``) to a rounded float."""
    try:
        return round(float(value), decimals) if value is not None else default
    except (TypeError, ValueError):
        return default
