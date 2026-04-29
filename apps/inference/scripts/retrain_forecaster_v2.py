"""
Retrain Adaptive Ensemble Forecaster (v2)
------------------------------------------
Retrains the outbreak forecasting ensemble with the new trend-aware feature set:
  + cases_slope_4w   (4-week linear slope, mean-normalized)
  + cases_ratio_4w   (latest-vs-4wk-avg ratio)

These two features fix the "always declining" forecast problem — they give
gradient boosting explicit direction awareness instead of only level info.

Outputs:
  models/adaptive_ensemble.pkl   — overwritten with new ensemble
  models/ensemble_metadata.json  — new version string + metrics
  models/backtest_report_v2.txt  — before/after backtest summary

Run from the inference app root:
  cd apps/inference
  python scripts/retrain_forecaster_v2.py
"""
import json
import logging
import os
import sys
import time
from pathlib import Path

# Ensure we can import from the inference app
BASE_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BASE_DIR))

# Change CWD so relative paths (models/, data/) in the trainer resolve correctly
os.chdir(BASE_DIR)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("retrain_forecaster_v2")


def banner(msg: str) -> None:
    print("\n" + "=" * 64)
    print(msg)
    print("=" * 64)


def main() -> int:
    banner("ADAPTIVE ENSEMBLE RETRAINING — v2 (trend-aware features)")

    # Check data
    data_path = BASE_DIR / "data" / "realtime_india_outbreaks.csv"
    if not data_path.exists():
        print(f"ERROR: Training data not found at {data_path}")
        return 1
    print(f"Dataset: {data_path}  ({data_path.stat().st_size / 1024:.1f} KB)")

    # Snapshot existing model for comparison
    existing_metadata_path = BASE_DIR / "models" / "ensemble_metadata.json"
    previous_metrics = None
    previous_features = None
    if existing_metadata_path.exists():
        try:
            with open(existing_metadata_path) as f:
                prev = json.load(f)
            previous_metrics = prev.get("backtest_metrics", {})
            previous_features = prev.get("feature_names", [])
            print(
                f"Previous model: version={prev.get('version', '?')} "
                f"features={len(previous_features)} "
                f"mae={previous_metrics.get('mae', '?')} "
                f"rmse={previous_metrics.get('rmse', '?')}"
            )
        except Exception as e:
            logger.warning("Could not read existing metadata: %s", e)

    # Run the training
    banner("TRAINING")
    from core.adaptive_trainer import train_adaptive_ensemble
    from core.feature_store import get_feature_names

    new_feature_names = get_feature_names()
    print(f"Feature set (v2, {len(new_feature_names)}): {new_feature_names}")

    start = time.time()
    result = train_adaptive_ensemble()
    elapsed = time.time() - start

    if result is None:
        print("ERROR: Training failed (returned None). See log above.")
        return 1

    # train_adaptive_ensemble returns (ensemble_dict, metadata_dict)
    if isinstance(result, tuple):
        ensemble, new_metadata = result
    else:
        ensemble = result
        new_metadata = {}

    banner("RESULTS")
    print(f"Training time: {elapsed:.1f}s")
    print(f"New version: {ensemble.get('version', '?')}")
    print(f"Training samples: {ensemble.get('training_samples', 0)}")
    print(f"Feature count: {len(ensemble.get('feature_names', []))}")

    # Fall back to reading metadata file if not returned directly
    try:
        if not new_metadata:
            with open(existing_metadata_path) as f:
                new_metadata = json.load(f)
        new_metrics = new_metadata.get("backtest_metrics", {})
        print(f"Backtest MAE: {new_metrics.get('mae', '?')}")
        print(f"Backtest RMSE: {new_metrics.get('rmse', '?')}")

        # Comparison
        if previous_metrics:
            prev_mae = previous_metrics.get("mae")
            new_mae = new_metrics.get("mae")
            if isinstance(prev_mae, (int, float)) and isinstance(new_mae, (int, float)):
                delta = new_mae - prev_mae
                pct = (delta / prev_mae) * 100 if prev_mae else 0.0
                arrow = "(better)" if delta < 0 else "(worse)"
                print(f"MAE delta: {delta:+.2f} ({pct:+.1f}%)  {arrow}")
    except Exception as e:
        logger.warning("Could not read new metadata: %s", e)
        new_metrics = {}

    # Top feature importances
    importances = ensemble.get("feature_importances", {})
    if importances:
        print("\nTop 8 feature importances:")
        for i, (name, score) in enumerate(list(importances.items())[:8]):
            print(f"  {i+1:2d}. {name:20s}  {score:.4f}")

    # Save a before/after report
    report_path = BASE_DIR / "models" / "backtest_report_v2.txt"
    try:
        with open(report_path, "w") as f:
            f.write("Adaptive Ensemble Retraining — v2 Report\n")
            f.write("=" * 48 + "\n")
            f.write(f"Version: {ensemble.get('version', '?')}\n")
            f.write(f"Training samples: {ensemble.get('training_samples', 0)}\n")
            f.write(f"Features: {len(new_feature_names)}\n")
            f.write(f"Training time: {elapsed:.1f}s\n\n")
            f.write("Previous metrics:\n")
            f.write(f"  {previous_metrics}\n\n")
            f.write("New metrics:\n")
            f.write(f"  {new_metrics}\n\n")
            f.write("Top features:\n")
            for name, score in list(importances.items())[:10]:
                f.write(f"  {name:20s}  {score:.4f}\n")
        print(f"\nReport saved: {report_path}")
    except Exception as e:
        logger.warning("Could not save report: %s", e)

    banner("DONE — restart the Flask app to pick up the new ensemble")
    return 0


if __name__ == "__main__":
    sys.exit(main())
