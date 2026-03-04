"""
Structured logging configuration for the Foresee Inference API.

Usage:
    from logging_config import get_logger
    logger = get_logger(__name__)
    logger.info("Model loaded", extra={"model": "cnn", "accuracy": 0.95})

In production (LOG_FORMAT=json) every log line is a single JSON object, making
it trivial to ingest into CloudWatch, Datadog, Loki, etc.

In development the default "text" format uses a human-readable layout.
"""

import logging
import json
import os
import sys
from datetime import datetime, timezone


# ---------------------------------------------------------------------------
# JSON Formatter
# ---------------------------------------------------------------------------

class JSONFormatter(logging.Formatter):
    """Emit each log record as a single-line JSON object."""

    def format(self, record: logging.LogRecord) -> str:
        log_entry: dict = {
            "timestamp": datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Merge any extra fields passed via `extra={...}`
        # Skip internal LogRecord attributes
        _skip = {
            "name", "msg", "args", "created", "relativeCreated", "exc_info",
            "exc_text", "stack_info", "lineno", "funcName", "pathname",
            "filename", "module", "thread", "threadName", "processName",
            "process", "message", "levelname", "levelno", "msecs",
            "taskName",
        }
        for key, value in record.__dict__.items():
            if key not in _skip and not key.startswith("_"):
                log_entry[key] = value

        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry, default=str)


# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

def setup_logging() -> None:
    """Configure the root logger based on environment variables.

    Env vars
    --------
    LOG_LEVEL   : DEBUG | INFO | WARNING | ERROR | CRITICAL  (default: INFO)
    LOG_FORMAT  : json | text                                (default: text)
    """
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    log_format = os.getenv("LOG_FORMAT", "text").lower()

    root = logging.getLogger()

    # Prevent duplicate handlers on repeated calls (e.g. test reloads)
    if root.handlers:
        return

    root.setLevel(getattr(logging, log_level, logging.INFO))

    handler = logging.StreamHandler(sys.stdout)

    if log_format == "json":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(
            logging.Formatter(
                fmt="%(asctime)s  %(levelname)-8s  [%(name)s]  %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )

    root.addHandler(handler)

    # Silence noisy third-party loggers
    logging.getLogger("werkzeug").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("tensorflow").setLevel(logging.ERROR)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger, ensuring setup_logging() has run once."""
    setup_logging()
    return logging.getLogger(name)
