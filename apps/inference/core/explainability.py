"""
Explainability Layer
Generates human-readable reason codes and feature attribution
for each adaptive forecast prediction.
"""

import logging

import numpy as np

logger = logging.getLogger("foresee.explain")


def explain_prediction(ensemble, features_dict, prediction_result, weather_data=None, news_data=None):
    """
    Generate explainability metadata for a forecast:
    1. Top contributing features (from model importance)
    2. Human-readable reason codes
    3. Confidence assessment

    Returns dict with drivers, reasons, and confidence info.
    """
    # Get feature importances from ensemble (pre-computed during training)
    importances = ensemble.get("feature_importances", {})

    # Sort by importance
    sorted_features = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    top_drivers = [{"feature": name, "importance": round(imp, 4)}
                   for name, imp in sorted_features[:5]]

    # Generate reason codes
    reasons = []

    # Case trend reasons (derived from lag features)
    lag1 = features_dict.get("cases_lag_1", 0)
    lag4 = features_dict.get("cases_lag_4", 0)
    features_dict.get("cases_lag_8", 0)
    # lags are in log1p scale, so difference approximates log-ratio
    trend = lag1 - lag4  # positive = recent cases higher than 4 weeks ago
    if trend > 0.5:
        reasons.append({"code": "RISING_TREND", "severity": "high",
                        "text": "Cases trending upward over recent 4 weeks"})
    elif trend < -0.5:
        reasons.append({"code": "FALLING_TREND", "severity": "low",
                        "text": "Cases trending downward over recent 4 weeks"})

    # Volatility from spread of log-lag values
    lags = [features_dict.get(f"cases_lag_{i+1}", 0) for i in range(8)]
    volatility = float(np.std(lags)) if any(val > 0 for val in lags) else 0
    if volatility > 1.0:
        reasons.append({"code": "HIGH_VOLATILITY", "severity": "medium",
                        "text": "High case count volatility — uncertainty is elevated"})

    # Weather reasons
    if weather_data:
        temp = weather_data.get("temperature", 28)
        humidity = weather_data.get("humidity", 65)
        if 25 <= temp <= 32 and humidity > 70:
            reasons.append({"code": "VECTOR_FAVORABLE", "severity": "high",
                            "text": f"Weather favors vector breeding (temp={temp}°C, humidity={humidity}%)"})
        elif temp < 20:
            reasons.append({"code": "COLD_SUPPRESSION", "severity": "low",
                            "text": f"Low temperature ({temp}°C) may suppress vector activity"})

    # News reasons
    if news_data:
        article_count = news_data.get("article_count", 0)
        if article_count > 10:
            reasons.append({"code": "HIGH_MEDIA_ALARM", "severity": "high",
                            "text": f"{article_count} outbreak-related news articles detected"})
        elif article_count > 3:
            reasons.append({"code": "MODERATE_MEDIA", "severity": "medium",
                            "text": f"{article_count} outbreak-related news articles detected"})

    # Model agreement assessment
    agreement = prediction_result.get("model_agreement", 1.0)
    if agreement < 0.5:
        reasons.append({"code": "LOW_MODEL_AGREEMENT", "severity": "medium",
                        "text": "Ensemble models disagree — prediction confidence is lower"})

    # Confidence level
    interval_width = prediction_result.get("p90", 0) - prediction_result.get("p10", 0)
    point = max(prediction_result.get("point", 1), 1)
    relative_width = interval_width / point

    if relative_width < 0.5:
        confidence = "high"
    elif relative_width < 1.0:
        confidence = "moderate"
    else:
        confidence = "low"

    return {
        "top_drivers": top_drivers,
        "reasons": reasons,
        "confidence_level": confidence,
        "interval_relative_width": round(relative_width, 3),
        "model_agreement": round(agreement, 3),
    }
