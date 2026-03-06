"""
Adaptive Forecasting Configuration
Central constants for the adaptive outbreak intelligence system.
"""

# ── Region Coordinates (canonical mapping) ────────────────────────────────
REGION_COORDS = {
    "Maharashtra": {"lat": 19.7515, "lon": 75.7139, "capital": "Mumbai"},
    "Delhi": {"lat": 28.7041, "lon": 77.1025, "capital": "Delhi"},
    "Kerala": {"lat": 10.8505, "lon": 76.2711, "capital": "Thiruvananthapuram"},
    "Karnataka": {"lat": 15.3173, "lon": 75.7139, "capital": "Bangalore"},
    "Tamil Nadu": {"lat": 11.1271, "lon": 78.6569, "capital": "Chennai"},
    "Uttar Pradesh": {"lat": 26.8467, "lon": 80.9462, "capital": "Lucknow"},
    "Gujarat": {"lat": 22.2587, "lon": 71.1924, "capital": "Gandhinagar"},
    "West Bengal": {"lat": 22.9868, "lon": 87.8550, "capital": "Kolkata"},
    "Rajasthan": {"lat": 27.0238, "lon": 74.2179, "capital": "Jaipur"},
    "Madhya Pradesh": {"lat": 22.9734, "lon": 78.6569, "capital": "Bhopal"},
    "Bihar": {"lat": 25.0961, "lon": 85.3131, "capital": "Patna"},
    "Punjab": {"lat": 31.1471, "lon": 75.3412, "capital": "Chandigarh"},
    "Haryana": {"lat": 29.0588, "lon": 76.0856, "capital": "Chandigarh"},
    "Assam": {"lat": 26.2006, "lon": 92.9376, "capital": "Dispur"},
    "Odisha": {"lat": 20.9517, "lon": 85.0985, "capital": "Bhubaneswar"},
}

CANONICAL_REGIONS = sorted(REGION_COORDS.keys())
REGION_INDEX = {r: i for i, r in enumerate(CANONICAL_REGIONS)}  # ordinal encoding

# ── Model Defaults ────────────────────────────────────────────────────────
WINDOW_SIZE = 8
DEFAULT_HORIZON = 8
MAX_HORIZON = 12

# ── Drift Detection ──────────────────────────────────────────────────────
DRIFT_MODE = "aggressive"           # "conservative" or "aggressive"
DRIFT_ADWIN_DELTA = 0.001           # ADWIN sensitivity (lower = more sensitive)
DRIFT_RESIDUAL_THRESHOLD = 2.0      # z-score threshold for residual drift
DRIFT_FEATURE_THRESHOLD = 2.0       # z-score threshold for feature drift
DRIFT_MIN_SAMPLES = 16              # minimum samples before drift check
DRIFT_PROMOTION_THRESHOLD = 0.05    # challenger must beat current MAE by 5%

# ── Ensemble ─────────────────────────────────────────────────────────────
QUANTILES = [0.10, 0.50, 0.90]      # P10, P50, P90
ENSEMBLE_MODELS = ["histgbr", "lgbm", "quantile_histgbr"]

# ── Feature Store ────────────────────────────────────────────────────────
WEATHER_CACHE_TTL_HOURS = 6
NEWS_CACHE_TTL_HOURS = 3
FEATURE_STORE_PATH = "data/feature_store.csv"
WEATHER_CACHE_PATH = "data/cache/weather_cache.json"
NEWS_CACHE_PATH = "data/cache/news_cache.json"

# ── Intervention Simulation ──────────────────────────────────────────────
INTERVENTION_DEFAULTS = {
    "vector_control_delta": 0.0,     # -1.0 to +1.0 (negative = more control)
    "net_coverage_delta": 0.0,       # -1.0 to +1.0 (positive = more nets)
    "reporting_delay_delta": 0.0,    # -1.0 to +1.0 (negative = faster reporting)
}

# Effect multipliers per unit of intervention delta
INTERVENTION_EFFECTS = {
    "vector_control_delta": -0.15,   # each +0.1 vector control reduces cases by 1.5%
    "net_coverage_delta": -0.12,     # each +0.1 net coverage reduces cases by 1.2%
    "reporting_delay_delta": 0.08,   # each +0.1 delay increase raises apparent cases by 0.8%
}

# ── Promotion Metric ─────────────────────────────────────────────────────
PROMOTION_METRIC = "mae"             # "mae" or "rmse"
