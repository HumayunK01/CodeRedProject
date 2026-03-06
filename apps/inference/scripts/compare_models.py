"""
Compare v1_baseline vs v2_adaptive on identical test data.
Generates a comparison table for panel presentation.
"""

import json
import os
import sys
from collections import deque

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from core.adaptive_trainer import predict_with_ensemble
from core.feature_store import build_feature_row

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WINDOW_SIZE = 8
HORIZON = 8
TEST_REGIONS = ["Maharashtra", "Delhi", "Kerala", "Karnataka", "Tamil Nadu", "Uttar Pradesh"]


def compare_models():
    # Load models
    v1_model = joblib.load(os.path.join(BASE_DIR, "models", "outbreak_forecaster.pkl"))
    v2_ensemble = joblib.load(os.path.join(BASE_DIR, "models", "adaptive_ensemble.pkl"))

    # Load data
    df = pd.read_csv(os.path.join(BASE_DIR, "data", "realtime_india_outbreaks.csv"))
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(["Region", "Date"])

    results = {}

    for region in TEST_REGIONS:
        rdf = df[df["Region"] == region].copy()
        rdf = rdf.sort_values("Date")
        cases = rdf["New_Cases"].values
        dates = rdf["Date"].values

        if len(cases) < WINDOW_SIZE + HORIZON:
            continue

        train_cases = cases[:-HORIZON]
        test_cases = cases[-HORIZON:]
        last_train_date = pd.Timestamp(dates[-(HORIZON + 1)])

        # v1 baseline prediction
        window_v1 = deque(train_cases[-WINDOW_SIZE:], maxlen=WINDOW_SIZE)
        v1_preds = []
        for _ in range(HORIZON):
            inp = np.log1p(np.array([window_v1]))
            p = np.expm1(v1_model.predict(inp)[0])
            p = max(0, int(p))
            v1_preds.append(p)
            window_v1.append(p)

        # v2 adaptive prediction
        v2_preds = []
        v2_p10s = []
        v2_p90s = []
        current = list(train_cases[-WINDOW_SIZE:])
        step_date = last_train_date
        for _ in range(HORIZON):
            step_date += pd.Timedelta(weeks=1)
            features, _ = build_feature_row(region, current, date=step_date)
            result = predict_with_ensemble(v2_ensemble, features)
            v2_preds.append(result["point"])
            v2_p10s.append(result["p10"])
            v2_p90s.append(result["p90"])
            current.append(result["point"])
            current = current[-WINDOW_SIZE:]

        # Metrics
        v1_mae = mean_absolute_error(test_cases, v1_preds)
        v1_rmse = np.sqrt(mean_squared_error(test_cases, v1_preds))
        v2_mae = mean_absolute_error(test_cases, v2_preds)
        v2_rmse = np.sqrt(mean_squared_error(test_cases, v2_preds))

        # Interval coverage (how many actuals fall within P10-P90)
        coverage = sum(1 for a, lo, hi in zip(test_cases, v2_p10s, v2_p90s, strict=False) if lo <= a <= hi)
        coverage_pct = coverage / HORIZON * 100

        improvement = (v1_mae - v2_mae) / max(v1_mae, 1) * 100

        results[region] = {
            "v1_mae": round(v1_mae, 1),
            "v1_rmse": round(v1_rmse, 1),
            "v2_mae": round(v2_mae, 1),
            "v2_rmse": round(v2_rmse, 1),
            "improvement_pct": round(improvement, 1),
            "interval_coverage": round(coverage_pct, 1),
        }

        marker = "BETTER" if improvement > 0 else "WORSE"
        print(f"  {region:20s} | v1 MAE={v1_mae:8.1f} | v2 MAE={v2_mae:8.1f} | {marker} by {abs(improvement):.1f}% | Coverage={coverage_pct:.0f}%")

    # Summary
    v1_total_mae = np.mean([r["v1_mae"] for r in results.values()])
    v2_total_mae = np.mean([r["v2_mae"] for r in results.values()])
    avg_coverage = np.mean([r["interval_coverage"] for r in results.values()])
    improvements = sum(1 for r in results.values() if r["improvement_pct"] > 0)

    print(f"\n  SUMMARY: v1 avg MAE={v1_total_mae:.1f} | v2 avg MAE={v2_total_mae:.1f}")
    print(f"  v2 better in {improvements}/{len(results)} regions")
    print(f"  Avg interval coverage: {avg_coverage:.1f}%")

    comparison = {
        "regions": results,
        "v1_avg_mae": round(v1_total_mae, 1),
        "v2_avg_mae": round(v2_total_mae, 1),
        "regions_improved": improvements,
        "total_regions": len(results),
        "avg_interval_coverage": round(avg_coverage, 1),
    }

    out_path = os.path.join(BASE_DIR, "models", "model_comparison.json")
    with open(out_path, "w") as f:
        json.dump(comparison, f, indent=2)
    print(f"\n  Comparison saved to {out_path}")
    return comparison


if __name__ == "__main__":
    compare_models()
