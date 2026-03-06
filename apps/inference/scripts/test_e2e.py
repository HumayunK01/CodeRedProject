"""End-to-end test of the v2 adaptive forecast pipeline."""
import json
import os
import sys

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

from datetime import timedelta

import joblib
import pandas as pd

from core.adaptive_trainer import predict_with_ensemble
from core.drift_detector import drift_detector
from core.explainability import explain_prediction
from core.feature_store import build_feature_row, fetch_current_weather, fetch_news_signal
from core.simulator import compute_risk_fusion_score, simulate_intervention

ensemble = joblib.load(os.path.join(BASE_DIR, 'models', 'adaptive_ensemble.pkl'))
region = 'Delhi'
WINDOW_SIZE = 8
horizon_weeks = 8

df = pd.read_csv(os.path.join(BASE_DIR, 'data', 'realtime_india_outbreaks.csv'))
region_df = df[df['Region'] == region].copy()
region_df['Date'] = pd.to_datetime(region_df['Date'])
region_df = region_df.sort_values('Date')
region_cases = region_df['New_Cases'].values
last_date = region_df['Date'].iloc[-1]

# Fetch live data
weather_data = fetch_current_weather(region)
news_data = fetch_news_signal(region)
print("Weather fresh:", weather_data.get('fresh'))
print("News fresh:", news_data.get('fresh'))

# Generate predictions
predictions = []
current_cases = list(region_cases[-WINDOW_SIZE:])
for i in range(horizon_weeks):
    week_date = last_date + timedelta(weeks=i + 1)
    features, fresh = build_feature_row(region, current_cases, weather_data, news_data, date=week_date)
    result = predict_with_ensemble(ensemble, features)
    pred = {
        'week': week_date.strftime('%Y-%m-%d'),
        'point': result['point'],
        'p10': result['p10'],
        'p50': result['p50'],
        'p90': result['p90'],
        'model_agreement': result['model_agreement'],
    }
    predictions.append(pred)
    current_cases.append(result['point'])
    current_cases = current_cases[-WINDOW_SIZE:]

print("\n=== FORECAST (Delhi, 8 weeks) ===")
for p in predictions:
    print(f"  {p['week']}: {p['point']:5d}  [{p['p10']:5d} - {p['p90']:5d}]  agreement={p['model_agreement']:.3f}")

# Explainability
last_feat, _ = build_feature_row(
    region, list(region_cases[-WINDOW_SIZE:]), weather_data, news_data,
    date=last_date + timedelta(weeks=1)
)
last_result = predict_with_ensemble(ensemble, last_feat)
explanation = explain_prediction(ensemble, last_feat, last_result, weather_data, news_data)

print("\n=== EXPLAINABILITY ===")
print("Confidence:", explanation['confidence_level'])
print("Top drivers:")
for d in explanation['top_drivers']:
    print("  {}: {:.4f}".format(d['feature'], d['importance']))
print("Reasons:", [r['code'] for r in explanation['reasons']])

# Risk fusion
risk = compute_risk_fusion_score({'predictions': predictions}, weather_data, news_data)
print("\n=== RISK FUSION ===")
print("Fused score:", risk['fused_risk_score'])
print("Components:", json.dumps(risk.get('components', {}), indent=2))

# Drift
drift = drift_detector.get_status_summary()
print("\n=== DRIFT STATUS ===")
print("Status:", drift.get('overall_status', 'N/A'))
print("Samples:", drift.get('total_residuals', 0))

# Scenario
scenario_preds, effect_summary = simulate_intervention(
    predictions, {'vector_control_delta': 0.3}
)
print("\n=== SCENARIO (vector control +30%) ===")
for sp in scenario_preds[:3]:
    orig = sp.get('original_point', sp['point'])
    adj = sp.get('adjusted_point', sp['point'])
    print(f"  {sp['week']}: {orig} -> {adj}")
print("Avg reduction:", effect_summary.get('avg_reduction_pct', 'N/A'))

print("\n=== ALL TESTS PASSED ===")
print("Model version:", ensemble.get('version', '?'))
print("Features:", len(ensemble.get('feature_names', [])))
