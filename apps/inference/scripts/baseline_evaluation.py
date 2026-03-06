"""
Baseline Evaluation Script (v1_baseline)
Freezes current forecaster metrics so every upgrade is measurable.
Run once before any model changes.
"""

import json
import os
from collections import deque

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WINDOW_SIZE = 8
TEST_REGIONS = ["Maharashtra", "Delhi", "Kerala", "Karnataka", "Tamil Nadu", "Uttar Pradesh"]
HORIZON = 8


def evaluate_baseline():
    model_path = os.path.join(BASE_DIR, "models", "outbreak_forecaster.pkl")
    data_path = os.path.join(BASE_DIR, "data", "realtime_india_outbreaks.csv")

    model = joblib.load(model_path)
    df = pd.read_csv(data_path)
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(["Region", "Date"])

    results = {}
    all_actuals = []
    all_preds = []

    for region in TEST_REGIONS:
        rdf = df[df["Region"] == region].copy()
        cases = rdf["New_Cases"].values

        if len(cases) < WINDOW_SIZE + HORIZON:
            print(f"  Skipping {region}: not enough data")
            continue

        # Use last HORIZON weeks as test set
        train_cases = cases[: -HORIZON]
        test_cases = cases[-HORIZON:]

        # Predict HORIZON steps from end of training data
        current_window = deque(train_cases[-WINDOW_SIZE:], maxlen=WINDOW_SIZE)
        preds = []
        for _ in range(HORIZON):
            inp = np.log1p(np.array([current_window]))
            p = np.expm1(model.predict(inp)[0])
            p = max(0, int(p))
            preds.append(p)
            current_window.append(p)

        mae = mean_absolute_error(test_cases, preds)
        rmse = np.sqrt(mean_squared_error(test_cases, preds))
        mape = np.mean(np.abs((test_cases - preds) / np.maximum(test_cases, 1))) * 100

        results[region] = {
            "mae": round(float(mae), 2),
            "rmse": round(float(rmse), 2),
            "mape": round(float(mape), 2),
            "actuals": [int(x) for x in test_cases],
            "predictions": preds,
        }
        all_actuals.extend(test_cases)
        all_preds.extend(preds)
        print(f"  {region}: MAE={mae:.1f}  RMSE={rmse:.1f}  MAPE={mape:.1f}%")

    overall_mae = mean_absolute_error(all_actuals, all_preds)
    overall_rmse = np.sqrt(mean_squared_error(all_actuals, all_preds))

    baseline = {
        "model_version": "v1_baseline",
        "window_size": WINDOW_SIZE,
        "horizon": HORIZON,
        "regions": results,
        "overall_mae": round(float(overall_mae), 2),
        "overall_rmse": round(float(overall_rmse), 2),
    }

    out_path = os.path.join(BASE_DIR, "models", "v1_baseline_metrics.json")
    with open(out_path, "w") as f:
        json.dump(baseline, f, indent=2)
    print(f"\nBaseline metrics saved to {out_path}")
    print(f"Overall MAE: {overall_mae:.2f}  RMSE: {overall_rmse:.2f}")
    return baseline


if __name__ == "__main__":
    evaluate_baseline()
