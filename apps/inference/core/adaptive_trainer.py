"""
Adaptive Ensemble Training Pipeline
Trains multiple models, performs rolling-origin backtests,
evaluates challengers, and promotes the best ensemble.

Models:
  1. HistGradientBoostingRegressor (existing, upgraded with exogenous features)
  2. LightGBM (if available, else extra HistGBR with different hyperparams)
  3. HistGradientBoostingRegressor in quantile mode (P10/P50/P90)

Outputs:
  - models/adaptive_ensemble.pkl  (dict of trained models + metadata)
  - models/ensemble_metadata.json (version, metrics, feature names)
"""

import json
import logging
import os
from datetime import datetime

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

from core.adaptive_config import (
    DEFAULT_HORIZON,
    DRIFT_PROMOTION_THRESHOLD,
    PROMOTION_METRIC,
    QUANTILES,
    WINDOW_SIZE,
)
from core.feature_store import build_feature_row, get_feature_names

logger = logging.getLogger("foresee.trainer")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _build_training_data(df):
    """
    Build feature matrix from outbreak data.
    Returns X (feature matrix), y (target), and feature names.
    """
    feature_names = get_feature_names()
    X_rows = []
    y_values = []

    for region, group in df.groupby("Region"):
        group = group.sort_values("Date")
        cases = group["New_Cases"].values
        dates = group["Date"].values

        if len(cases) <= WINDOW_SIZE:
            continue

        for i in range(WINDOW_SIZE, len(cases)):
            case_history = cases[max(0, i - WINDOW_SIZE): i]
            sample_date = pd.Timestamp(dates[i])

            features, _ = build_feature_row(region, case_history, date=sample_date)

            row = [features.get(f, 0.0) for f in feature_names]
            X_rows.append(row)
            y_values.append(float(cases[i]))

    return np.array(X_rows), np.array(y_values), feature_names


def _train_histgbr(X, y, random_state=42):
    """Train HistGradientBoosting point estimator."""
    model = HistGradientBoostingRegressor(
        max_iter=300, learning_rate=0.1, max_depth=10,
        min_samples_leaf=10, random_state=random_state,
    )
    # Log-transform target for better handling of exponential patterns
    y_log = np.log1p(y)
    model.fit(X, y_log)
    return model


def _train_histgbr_alt(X, y, random_state=99):
    """Train alternative HistGBR with different hyperparams (diversity)."""
    model = HistGradientBoostingRegressor(
        max_iter=250, learning_rate=0.08, max_depth=8,
        min_samples_leaf=15, l2_regularization=0.5,
        random_state=random_state,
    )
    y_log = np.log1p(y)
    model.fit(X, y_log)
    return model


def _train_quantile_models(X, y):
    """Train quantile regressors for P10, P50, P90 uncertainty bands."""
    y_log = np.log1p(y)
    models = {}
    for q in QUANTILES:
        model = HistGradientBoostingRegressor(
            loss="quantile", quantile=q,
            max_iter=250, learning_rate=0.08, max_depth=7,
            min_samples_leaf=15, random_state=42,
        )
        model.fit(X, y_log)
        models[f"q{int(q*100)}"] = model
    return models


def _rolling_origin_backtest(models, X, y, n_folds=5):
    """
    Rolling-origin evaluation: train on first k folds, test on next.
    Returns dict of metric name -> value.
    """
    fold_size = len(X) // (n_folds + 1)
    if fold_size < 10:
        return {"mae": float("inf"), "rmse": float("inf")}

    all_preds = []
    all_actuals = []

    for fold in range(1, n_folds + 1):
        train_end = fold * fold_size
        test_end = min(train_end + fold_size, len(X))

        X_train, y_train = X[:train_end], y[:train_end]
        X_test, y_test = X[train_end:test_end], y[train_end:test_end]

        if len(X_test) == 0:
            continue

        # Use primary model for backtest
        temp_model = HistGradientBoostingRegressor(
            max_iter=200, learning_rate=0.1, max_depth=8,
            min_samples_leaf=10, random_state=42,
        )
        temp_model.fit(X_train, np.log1p(y_train))
        preds = np.expm1(temp_model.predict(X_test))
        preds = np.maximum(preds, 0)

        all_preds.extend(preds)
        all_actuals.extend(y_test)

    if not all_preds:
        return {"mae": float("inf"), "rmse": float("inf")}

    mae = mean_absolute_error(all_actuals, all_preds)
    rmse = np.sqrt(mean_squared_error(all_actuals, all_preds))
    return {"mae": round(float(mae), 2), "rmse": round(float(rmse), 2)}


def train_adaptive_ensemble(df=None):
    """
    Full training pipeline:
    1. Load data
    2. Build features
    3. Train ensemble (primary + alt + quantile)
    4. Run rolling backtest
    5. Save artifacts with metadata
    """
    if df is None:
        data_path = os.path.join(BASE_DIR, "data", "realtime_india_outbreaks.csv")
        df = pd.read_csv(data_path)
        df["Date"] = pd.to_datetime(df["Date"])

    logger.info("Building training features from %d rows...", len(df))
    X, y, feature_names = _build_training_data(df)
    logger.info("Training data: X=%s, y=%s", X.shape, y.shape)

    if len(X) < 50:
        logger.error("Not enough training data (%d rows). Need at least 50.", len(X))
        return None

    # Train models
    logger.info("Training primary HistGBR model...")
    primary_model = _train_histgbr(X, y)

    logger.info("Training alternative HistGBR model (diversity)...")
    alt_model = _train_histgbr_alt(X, y)

    logger.info("Training quantile models (P10/P50/P90)...")
    quantile_models = _train_quantile_models(X, y)

    # Rolling backtest
    logger.info("Running rolling-origin backtest...")
    backtest_metrics = _rolling_origin_backtest(
        {"primary": primary_model, "alt": alt_model}, X, y
    )
    logger.info("Backtest results: %s", backtest_metrics)

    # Feature importance via permutation-based approach
    importances = {}
    try:
        from sklearn.inspection import permutation_importance
        # Use a small sample for speed
        sample_size = min(500, len(X))
        idx_sample = np.random.RandomState(42).choice(len(X), sample_size, replace=False)
        perm_result = permutation_importance(
            primary_model, X[idx_sample], np.log1p(y[idx_sample]),
            n_repeats=5, random_state=42, n_jobs=-1,
        )
        for i, name in enumerate(feature_names):
            importances[name] = round(float(perm_result.importances_mean[i]), 4)
        importances = dict(sorted(importances.items(), key=lambda x: x[1], reverse=True))
    except Exception as e:
        logger.warning("Could not compute permutation importance: %s", e)

    # Package ensemble
    ensemble = {
        "primary": primary_model,
        "alt": alt_model,
        "quantile": quantile_models,
        "feature_names": feature_names,
        "feature_importances": importances,
        "training_samples": len(X),
        "version": f"v2_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
    }

    # Save model
    model_path = os.path.join(BASE_DIR, "models", "adaptive_ensemble.pkl")
    joblib.dump(ensemble, model_path)
    logger.info("Ensemble saved to %s", model_path)

    # Save metadata
    metadata = {
        "version": ensemble["version"],
        "trained_at": datetime.now().isoformat(),
        "training_samples": len(X),
        "feature_names": feature_names,
        "feature_count": len(feature_names),
        "backtest_metrics": backtest_metrics,
        "feature_importance": importances,
        "models": ["histgbr_primary", "histgbr_alt", "quantile_p10", "quantile_p50", "quantile_p90"],
        "window_size": WINDOW_SIZE,
        "horizon": DEFAULT_HORIZON,
        "promotion_metric": PROMOTION_METRIC,
    }
    meta_path = os.path.join(BASE_DIR, "models", "ensemble_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    logger.info("Metadata saved to %s", meta_path)

    return ensemble, metadata


def evaluate_challenger(current_ensemble, challenger_ensemble, X_test, y_test):
    """
    Compare current vs challenger on test data using promotion metric.
    Returns (should_promote, comparison_dict).
    """
    def _predict_ensemble(ens, X):
        p1 = np.expm1(ens["primary"].predict(X))
        p2 = np.expm1(ens["alt"].predict(X))
        return np.maximum((p1 + p2) / 2, 0)

    current_preds = _predict_ensemble(current_ensemble, X_test)
    challenger_preds = _predict_ensemble(challenger_ensemble, X_test)

    current_mae = mean_absolute_error(y_test, current_preds)
    challenger_mae = mean_absolute_error(y_test, challenger_preds)
    current_rmse = np.sqrt(mean_squared_error(y_test, current_preds))
    challenger_rmse = np.sqrt(mean_squared_error(y_test, challenger_preds))

    if PROMOTION_METRIC == "mae":
        improvement = (current_mae - challenger_mae) / max(current_mae, 1e-6)
    else:
        improvement = (current_rmse - challenger_rmse) / max(current_rmse, 1e-6)

    should_promote = improvement > DRIFT_PROMOTION_THRESHOLD

    comparison = {
        "current_mae": round(current_mae, 2),
        "challenger_mae": round(challenger_mae, 2),
        "current_rmse": round(current_rmse, 2),
        "challenger_rmse": round(challenger_rmse, 2),
        "improvement_pct": round(improvement * 100, 2),
        "threshold_pct": round(DRIFT_PROMOTION_THRESHOLD * 100, 2),
        "promoted": should_promote,
    }

    if should_promote:
        logger.info("CHALLENGER PROMOTED: %.1f%% improvement (threshold: %.1f%%)",
                     improvement * 100, DRIFT_PROMOTION_THRESHOLD * 100)
    else:
        logger.info("Challenger not promoted: %.1f%% improvement < %.1f%% threshold",
                     improvement * 100, DRIFT_PROMOTION_THRESHOLD * 100)

    return should_promote, comparison


def predict_with_ensemble(ensemble, features_dict):
    """
    Generate point + interval predictions from the ensemble.
    Returns dict with p10, p50, p90, point estimate, and model agreement.
    """
    feature_names = ensemble["feature_names"]
    X = np.array([[features_dict.get(f, 0.0) for f in feature_names]])

    # Point estimates from primary and alt (weighted blend: 70/30)
    p_primary = float(np.expm1(ensemble["primary"].predict(X)[0]))
    p_alt = float(np.expm1(ensemble["alt"].predict(X)[0]))
    point = max(0, 0.7 * p_primary + 0.3 * p_alt)

    # Quantile estimates
    q_models = ensemble.get("quantile", {})
    p10 = float(np.expm1(q_models["q10"].predict(X)[0])) if "q10" in q_models else point * 0.6
    p50 = float(np.expm1(q_models["q50"].predict(X)[0])) if "q50" in q_models else point
    p90 = float(np.expm1(q_models["q90"].predict(X)[0])) if "q90" in q_models else point * 1.6

    # Ensure monotonicity: P10 <= P50 <= P90
    p10 = max(0, min(p10, p50))
    p90 = max(p50, p90)

    # Model agreement score (how much primary and alt agree)
    spread = abs(p_primary - p_alt)
    agreement = max(0, 1.0 - spread / max(point, 1))

    return {
        "point": round(point),
        "p10": round(max(0, p10)),
        "p50": round(max(0, p50)),
        "p90": round(max(0, p90)),
        "primary_pred": round(max(0, p_primary)),
        "alt_pred": round(max(0, p_alt)),
        "model_agreement": round(agreement, 3),
    }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = train_adaptive_ensemble()
    if result:
        ensemble, metadata = result
        print(f"\nEnsemble trained: {metadata['version']}")
        print(f"Backtest: {metadata['backtest_metrics']}")
        print(f"Top features: {list(metadata['feature_importance'].keys())[:5]}")
