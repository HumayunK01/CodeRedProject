"""
Drift Detection Module
Monitors prediction residuals and feature distributions 
to detect concept drift and trigger model retraining.

Implements:
- Residual drift: z-score on recent prediction errors
- Feature drift: distribution shift in exogenous features
- ADWIN-inspired windowed change detection
"""

import logging
import json
import os
import time
from collections import deque

import numpy as np

from core.adaptive_config import (
    DRIFT_MODE, DRIFT_RESIDUAL_THRESHOLD, DRIFT_FEATURE_THRESHOLD,
    DRIFT_MIN_SAMPLES, DRIFT_ADWIN_DELTA,
)

logger = logging.getLogger("foresee.drift")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRIFT_STATE_PATH = os.path.join(BASE_DIR, "models", "drift_state.json")


class DriftDetector:
    """
    Adaptive drift detector that monitors:
    1. Prediction residuals (actual - predicted)
    2. Feature distribution shifts
    
    Uses sliding-window z-score approach with ADWIN-inspired
    adaptive windowing for aggressive mode.
    """

    def __init__(self, max_window=100):
        self.residuals = deque(maxlen=max_window)
        self.feature_history = {}  # feature_name -> deque of values
        self.max_window = max_window
        self.drift_events = []
        self.last_drift_time = 0
        self._load_state()

    def _load_state(self):
        if os.path.exists(DRIFT_STATE_PATH):
            try:
                with open(DRIFT_STATE_PATH, "r") as f:
                    state = json.load(f)
                self.residuals = deque(state.get("residuals", []), maxlen=self.max_window)
                self.drift_events = state.get("drift_events", [])
                self.last_drift_time = state.get("last_drift_time", 0)
                for k, v in state.get("feature_history", {}).items():
                    self.feature_history[k] = deque(v, maxlen=self.max_window)
                logger.info("Drift state loaded: %d residuals, %d events",
                            len(self.residuals), len(self.drift_events))
            except Exception as e:
                logger.warning("Could not load drift state: %s", e)

    def save_state(self):
        state = {
            "residuals": list(self.residuals),
            "feature_history": {k: list(v) for k, v in self.feature_history.items()},
            "drift_events": self.drift_events[-50:],  # keep last 50 events
            "last_drift_time": self.last_drift_time,
        }
        try:
            with open(DRIFT_STATE_PATH, "w") as f:
                json.dump(state, f)
        except Exception as e:
            logger.warning("Could not save drift state: %s", e)

    def record_residual(self, actual, predicted):
        """Record a new prediction residual."""
        residual = actual - predicted
        self.residuals.append(residual)

    def record_features(self, features_dict):
        """Record feature values for distribution monitoring."""
        for key, val in features_dict.items():
            if isinstance(val, (int, float)) and not np.isnan(val):
                if key not in self.feature_history:
                    self.feature_history[key] = deque(maxlen=self.max_window)
                self.feature_history[key].append(float(val))

    def check_drift(self):
        """
        Check for concept drift in residuals and features.
        Returns dict with drift status and details.
        """
        result = {
            "drift_detected": False,
            "residual_drift": False,
            "feature_drift": False,
            "drift_score": 0.0,
            "details": [],
            "samples_observed": len(self.residuals),
        }

        if len(self.residuals) < DRIFT_MIN_SAMPLES:
            result["status"] = "warming_up"
            return result

        # ── Residual Drift (z-score method) ───────────────────────────
        residuals = np.array(self.residuals)
        n = len(residuals)
        split = n // 2

        old_mean = np.mean(residuals[:split])
        old_std = max(np.std(residuals[:split]), 1e-6)
        new_mean = np.mean(residuals[split:])

        z_residual = abs(new_mean - old_mean) / old_std

        threshold = DRIFT_RESIDUAL_THRESHOLD
        if DRIFT_MODE == "aggressive":
            threshold *= 0.7  # lower threshold for faster detection

        if z_residual > threshold:
            result["residual_drift"] = True
            result["details"].append(
                f"Residual drift: z={z_residual:.2f} > {threshold:.2f} "
                f"(old_mean={old_mean:.1f}, new_mean={new_mean:.1f})"
            )

        # ── Feature Drift (distribution shift) ───────────────────────
        drift_features = []
        for feat_name, values in self.feature_history.items():
            if len(values) < DRIFT_MIN_SAMPLES:
                continue
            vals = np.array(values)
            split_f = len(vals) // 2
            old_f_mean = np.mean(vals[:split_f])
            old_f_std = max(np.std(vals[:split_f]), 1e-6)
            new_f_mean = np.mean(vals[split_f:])

            z_feat = abs(new_f_mean - old_f_mean) / old_f_std

            feat_threshold = DRIFT_FEATURE_THRESHOLD
            if DRIFT_MODE == "aggressive":
                feat_threshold *= 0.7

            if z_feat > feat_threshold:
                drift_features.append(feat_name)
                result["details"].append(
                    f"Feature drift [{feat_name}]: z={z_feat:.2f} > {feat_threshold:.2f}"
                )

        if len(drift_features) >= 2:
            result["feature_drift"] = True

        # ── ADWIN-inspired adaptive check ─────────────────────────────
        adwin_drift = self._adwin_check(residuals)
        if adwin_drift:
            result["details"].append("ADWIN window split detected significant change")

        # ── Combined Decision ─────────────────────────────────────────
        drift_score = 0.0
        if result["residual_drift"]:
            drift_score += 0.5
        if result["feature_drift"]:
            drift_score += 0.3
        if adwin_drift:
            drift_score += 0.2

        result["drift_score"] = round(drift_score, 2)
        result["drift_detected"] = drift_score >= 0.5

        if result["drift_detected"]:
            result["status"] = "drift_detected"
            event = {
                "time": time.time(),
                "drift_score": result["drift_score"],
                "details": result["details"],
            }
            self.drift_events.append(event)
            self.last_drift_time = time.time()
            logger.warning("DRIFT DETECTED (score=%.2f): %s",
                           result["drift_score"], "; ".join(result["details"]))
        else:
            result["status"] = "stable"

        self.save_state()
        return result

    def _adwin_check(self, data):
        """
        Simplified ADWIN: find the split point that maximizes
        the difference between two sub-windows.
        """
        n = len(data)
        if n < DRIFT_MIN_SAMPLES:
            return False

        max_diff = 0
        threshold = DRIFT_ADWIN_DELTA

        if DRIFT_MODE == "aggressive":
            threshold *= 0.5

        for cut in range(DRIFT_MIN_SAMPLES // 2, n - DRIFT_MIN_SAMPLES // 2):
            left = data[:cut]
            right = data[cut:]
            m = abs(np.mean(left) - np.mean(right))
            eps = np.sqrt(1.0 / (2.0 * cut) + 1.0 / (2.0 * (n - cut))) * np.log(2.0 / threshold)
            if m > eps and m > max_diff:
                max_diff = m

        return max_diff > 0

    def get_status_summary(self):
        """Return a concise status dict for API responses."""
        n = len(self.residuals)
        recent_drift = len([e for e in self.drift_events
                            if time.time() - e["time"] < 86400])
        return {
            "drift_detected": recent_drift > 0,
            "mode": DRIFT_MODE,
            "samples_observed": n,
            "recent_drift_events_24h": recent_drift,
            "last_drift_time": self.last_drift_time if self.last_drift_time > 0 else None,
            "status": "warming_up" if n < DRIFT_MIN_SAMPLES else "monitoring",
        }


# Module-level singleton
drift_detector = DriftDetector()
