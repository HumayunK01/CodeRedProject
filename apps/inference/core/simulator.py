"""
Intervention Simulator
Projects counterfactual outbreak trajectories under different
intervention scenarios (vector control, net coverage, reporting delay).

Uses the ensemble forecaster + transparent effect multipliers
to generate "what-if" comparisons with uncertainty bands.
"""

import logging
import numpy as np
from core.adaptive_config import (
    INTERVENTION_DEFAULTS, INTERVENTION_EFFECTS, DEFAULT_HORIZON,
)

logger = logging.getLogger("foresee.simulator")


def simulate_intervention(baseline_predictions, intervention_params=None):
    """
    Apply intervention effects to baseline forecast trajectory.
    
    Args:
        baseline_predictions: list of dicts with keys 
            {week, point, p10, p50, p90}
        intervention_params: dict of intervention deltas, e.g.
            {"vector_control_delta": 0.3, "net_coverage_delta": 0.2}
    
    Returns:
        scenario_predictions: modified trajectory with uncertainty
        effect_summary: dict describing applied effects
    """
    if not intervention_params:
        intervention_params = {}

    # Merge with defaults
    params = {**INTERVENTION_DEFAULTS, **intervention_params}

    # Calculate cumulative effect multiplier
    total_effect = 0.0
    applied_effects = []

    for param_name, delta in params.items():
        if param_name in INTERVENTION_EFFECTS and delta != 0.0:
            # Clamp delta to [-1, 1]
            delta = max(-1.0, min(1.0, delta))
            effect = delta * INTERVENTION_EFFECTS[param_name]
            total_effect += effect
            applied_effects.append({
                "intervention": param_name,
                "delta": round(delta, 2),
                "case_effect_pct": round(effect * 100, 1),
            })

    # Convert cumulative effect to multiplier
    # total_effect is a fractional change (e.g. -0.05 = 5% reduction)
    multiplier = max(0.1, 1.0 + total_effect)

    # Apply multiplier progressively (effects compound over time)
    scenario = []
    for i, pred in enumerate(baseline_predictions):
        # Effects ramp up over weeks (realistic: interventions take time)
        week_factor = min(1.0, (i + 1) / max(len(baseline_predictions) / 2, 1))
        week_multiplier = 1.0 + (multiplier - 1.0) * week_factor

        # Apply to all quantiles
        s_point = max(0, round(pred["point"] * week_multiplier))
        s_p10 = max(0, round(pred["p10"] * week_multiplier))
        s_p50 = max(0, round(pred["p50"] * week_multiplier))
        s_p90 = max(0, round(pred["p90"] * week_multiplier))

        # Ensure monotonicity
        s_p10 = min(s_p10, s_p50)
        s_p90 = max(s_p50, s_p90)

        scenario.append({
            "week": pred["week"],
            "point": s_point,
            "p10": s_p10,
            "p50": s_p50,
            "p90": s_p90,
            "multiplier_applied": round(week_multiplier, 3),
        })

    total_baseline = sum(p["point"] for p in baseline_predictions)
    total_scenario = sum(p["point"] for p in scenario)
    cases_averted = total_baseline - total_scenario

    effect_summary = {
        "interventions_applied": applied_effects,
        "overall_multiplier": round(multiplier, 3),
        "total_baseline_cases": total_baseline,
        "total_scenario_cases": total_scenario,
        "cases_averted": cases_averted,
        "pct_change": round((total_scenario - total_baseline) / max(total_baseline, 1) * 100, 1),
    }

    return scenario, effect_summary


def compute_risk_fusion_score(forecast_data, weather_data, news_data, symptom_risk=None):
    """
    Compute a fused risk score from multiple signals:
    1. Forecast trend (is incidence rising or falling?)
    2. Weather suitability (vector-breeding conditions)
    3. News outbreak pressure (media alarm level)
    4. Symptom risk distribution (from DHS model, optional)
    
    Returns 0.0-1.0 score with component breakdown.
    """
    components = {}

    # 1. Forecast trend score (0-1)
    predictions = forecast_data.get("predictions", [])
    if len(predictions) >= 2:
        first_half = [p["point"] for p in predictions[:len(predictions)//2]]
        second_half = [p["point"] for p in predictions[len(predictions)//2:]]
        trend = (np.mean(second_half) - np.mean(first_half)) / max(np.mean(first_half), 1)
        trend_score = min(1.0, max(0.0, 0.5 + trend * 2))  # normalized
    else:
        trend_score = 0.5
    components["forecast_trend"] = round(trend_score, 3)

    # 2. Weather suitability score (0-1)
    if weather_data:
        temp = weather_data.get("temperature", 28.0)
        humidity = weather_data.get("humidity", 65.0)
        precip = weather_data.get("precipitation", 0.0)

        # Optimal vector breeding: 25-32C, humidity >70%, recent rain
        temp_score = max(0, 1.0 - abs(temp - 28.5) / 10.0)
        humid_score = min(1.0, max(0.0, (humidity - 50) / 40))
        precip_score = min(1.0, precip / 10.0)

        weather_score = (temp_score * 0.4 + humid_score * 0.35 + precip_score * 0.25)
    else:
        weather_score = 0.5
    components["weather_suitability"] = round(weather_score, 3)

    # 3. News pressure score (0-1)
    if news_data:
        article_count = news_data.get("article_count", 0)
        news_score = min(1.0, article_count / 20.0)
    else:
        news_score = 0.0
    components["news_pressure"] = round(news_score, 3)

    # 4. Symptom risk (0-1, optional)
    if symptom_risk is not None:
        components["symptom_risk"] = round(float(symptom_risk), 3)
    else:
        symptom_risk = 0.5  # neutral default
        components["symptom_risk"] = 0.5

    # Weighted fusion
    weights = {
        "forecast_trend": 0.35,
        "weather_suitability": 0.25,
        "news_pressure": 0.20,
        "symptom_risk": 0.20,
    }

    fused = (
        trend_score * weights["forecast_trend"]
        + weather_score * weights["weather_suitability"]
        + news_score * weights["news_pressure"]
        + float(symptom_risk) * weights["symptom_risk"]
    )
    fused = min(1.0, max(0.0, fused))

    # Risk level
    if fused >= 0.7:
        risk_level = "Critical"
    elif fused >= 0.5:
        risk_level = "High"
    elif fused >= 0.3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "fused_risk_score": round(fused, 3),
        "risk_level": risk_level,
        "components": components,
        "weights": weights,
    }
