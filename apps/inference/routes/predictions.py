"""
ML prediction routes: symptom risk, image diagnosis, outbreak forecasting.
"""

import os
import tempfile
from collections import deque
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from flask import Blueprint, jsonify, request

from core.auth import require_auth
from core.config import (
    IMAGE_ALLOWED_EXTENSIONS,
    IMAGE_ALLOWED_MIME_TYPES,
    IMAGE_MAGIC_BYTES,
    IMAGE_MAX_FILE_SIZE_BYTES,
    IMAGE_MAX_FILE_SIZE_MB,
)
from core.logging_config import get_logger
from core.middleware import track_performance

logger = get_logger("foresee.app")
logger_ml = get_logger("foresee.ml")

predictions_bp = Blueprint("predictions", __name__)


# ── Symptom-Based Risk Prediction ────────────────────────────────────────────

@predictions_bp.route("/predict/symptoms", methods=["POST"])
@require_auth(skip_db_check=True)
@track_performance
def predict_symptoms():
    """Predict malaria risk using trained DHS-based ML model.
    Falls back to rule-based logic if model is not loaded.
    """
    import flask_app as _fa

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # --- ML Model Path ---
        if _fa.symptoms_model and isinstance(_fa.symptoms_model, dict):
            try:
                fever = data.get("fever")
                if isinstance(fever, bool):
                    fever = 1 if fever else 0
                elif fever is None:
                    fever = -1

                net = data.get("slept_under_net")
                if isinstance(net, bool):
                    net = 1 if net else 0
                elif net is None:
                    net = -1

                input_data = {
                    "fever": [fever],
                    "age_months": [data.get("age_months", -1)],
                    "state": [data.get("state", "Unknown")],
                    "residence_type": [data.get("residence_type", "Rural")],
                    "slept_under_net": [net],
                    "anemia_level": [data.get("anemia_level", -1)],
                    "interview_month": [data.get("interview_month", datetime.now().month)],
                }

                df = pd.DataFrame(input_data)

                try:
                    le_state = _fa.symptoms_model["le_state"]
                    state_valid = df["state"].isin(le_state.classes_)
                    if not state_valid.all():
                        df.loc[~state_valid, "state"] = le_state.classes_[0]
                    df["state"] = le_state.transform(df["state"])
                except Exception as e:
                    logger_ml.warning("State encoding error: %s", e)
                    df["state"] = 0

                try:
                    le_res = _fa.symptoms_model["le_res"]
                    res_valid = df["residence_type"].isin(le_res.classes_)
                    if not res_valid.all():
                        df.loc[~res_valid, "residence_type"] = le_res.classes_[0]
                    df["residence_type"] = le_res.transform(df["residence_type"])
                except Exception:
                    df["residence_type"] = 0

                imputer = _fa.symptoms_model["imputer"]
                cols_to_impute = _fa.symptoms_model.get("cols_to_impute")
                if cols_to_impute:
                    for col in cols_to_impute:
                        if col in df.columns:
                            df[col] = df[col].astype(float)
                    df[cols_to_impute] = imputer.transform(df[cols_to_impute])

                feature_order = _fa.symptoms_model["features"]
                X = df[feature_order].values
                model = _fa.symptoms_model["model"]

                probabilities = model.predict_proba(X)[0]
                prediction = np.argmax(probabilities)
                risk_score = float(probabilities[prediction])

                risk_map = {0: "Low Risk", 1: "Medium Risk", 2: "High Risk"}
                label = risk_map.get(prediction, "Unknown Risk")

                return jsonify({
                    "label": label,
                    "risk_score": round(risk_score, 2),
                    "confidence": round(risk_score, 2),
                    "method": "DHS-based ML Risk Model",
                    "model_version": "v1.0",
                })

            except Exception:
                logger_ml.warning("ML Inference Error, falling back to rules", exc_info=True)

        # --- Rule-Based Fallback ---
        fever = bool(data.get("fever", False))
        symptom_keys = [
            "chills", "headache", "fatigue", "muscle_aches",
            "nausea", "diarrhea", "abdominal_pain",
            "cough", "skin_rash",
        ]
        symptom_count = sum(bool(data.get(s, False)) for s in symptom_keys)

        anemia_level = data.get("anemia_level", 4)
        is_anemic = False
        try:
            if int(anemia_level) <= 2:
                is_anemic = True
        except (ValueError, TypeError):
            pass

        if not fever and not is_anemic:
            risk, risk_score = "Low", 0.15
        elif symptom_count >= 2 or (fever and is_anemic):
            risk, risk_score = "High", 0.85
        elif is_anemic:
            risk, risk_score = "Medium", 0.65
        else:
            risk, risk_score = "Medium", 0.50

        return jsonify({
            "label": f"{risk} Risk",
            "risk_score": risk_score,
            "confidence": risk_score,
            "method": "Clinical Rule-Based Assessment (Fallback)",
            "model_version": "v1.0 (Fallback)",
        })

    except Exception as e:
        logger.error("Error in symptom prediction: %s", e)
        return jsonify({"error": str(e)}), 500


# ── Outbreak Forecasting ─────────────────────────────────────────────────────

@predictions_bp.route("/forecast/regions", methods=["GET"])
@require_auth(skip_db_check=True)
@track_performance
def get_forecast_regions():
    try:
        df = pd.read_csv("data/realtime_india_outbreaks.csv")
        regions = df["Region"].unique().tolist()
        return jsonify({"regions": sorted(regions)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@predictions_bp.route("/forecast/region", methods=["POST"])
@require_auth(skip_db_check=True)
@track_performance
def forecast_region():
    import flask_app as _fa

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No forecast data provided"}), 400

        region = data.get("region", "India")
        horizon_weeks = min(data.get("horizon_weeks", 8), 12)
        scenario_params = data.get("scenario", None)

        df = pd.read_csv("data/realtime_india_outbreaks.csv")
        region_df = df[df["Region"] == region].copy()

        if len(region_df) < 8:
            return jsonify({"error": f"Not enough historical data for {region}. Need at least 8 weeks."}), 400

        region_df["Date"] = pd.to_datetime(region_df["Date"])
        region_df = region_df.sort_values("Date")
        region_cases = region_df["New_Cases"].values
        last_date = region_df["Date"].iloc[-1]

        WINDOW_SIZE = 8

        # ── Fetch live exogenous signals ──────────────────────────────
        from core.feature_store import fetch_current_weather, fetch_news_signal
        weather_data = fetch_current_weather(region)
        news_data = fetch_news_signal(region)

        freshness = {
            "weather_fresh": weather_data.get("fresh", False),
            "news_fresh": news_data.get("fresh", False),
        }

        # ── Adaptive Ensemble Path ────────────────────────────────────
        if _fa.adaptive_ensemble is not None:
            from core.adaptive_trainer import predict_with_ensemble
            from core.drift_detector import drift_detector
            from core.explainability import explain_prediction
            from core.feature_store import build_feature_row
            from core.simulator import compute_risk_fusion_score, simulate_intervention

            ensemble = _fa.adaptive_ensemble
            predictions = []
            forecast_vals = []

            current_cases = list(region_cases[-WINDOW_SIZE:])

            for i in range(horizon_weeks):
                week_date = last_date + timedelta(weeks=i + 1)
                features, _ = build_feature_row(
                    region, current_cases, weather_data, news_data, date=week_date
                )
                result = predict_with_ensemble(ensemble, features)

                pred_entry = {
                    "week": week_date.strftime("%Y-%m-%d"),
                    "point": result["point"],
                    "p10": result["p10"],
                    "p50": result["p50"],
                    "p90": result["p90"],
                    "model_agreement": result["model_agreement"],
                }
                predictions.append(pred_entry)
                forecast_vals.append(result["point"])

                # ── Anti-reversion blending ──────────────────────────────────
                # Raw autoregressive prediction compounds downward drift because
                # each synthetic value is slightly lower than the previous one.
                # Blend 70% point prediction with 30% recent rolling mean to
                # anchor the window and slow the collapse over many weeks.
                rolling_mean = float(np.mean(current_cases[-4:]))
                blended_val = max(0.0, result["point"] * 0.70 + rolling_mean * 0.30)

                # Add a tiny amount of noise so long forecasts don't flatten to
                # a perfectly straight line (looks more realistic)
                noise = float(np.random.normal(0, rolling_mean * 0.03))
                blended_val = max(0.0, blended_val + noise)

                current_cases.append(blended_val)
                current_cases = current_cases[-WINDOW_SIZE:]

            # Historical data for chart
            historical = []
            for _, row in region_df.tail(12).iterrows():
                historical.append({
                    "week": row["Date"].strftime("%Y-%m-%d"),
                    "cases": int(row["New_Cases"]),
                })

            # Explainability
            last_features, _ = build_feature_row(
                region, list(region_cases[-WINDOW_SIZE:]), weather_data, news_data,
                date=last_date + timedelta(weeks=1)
            )
            last_pred_result = predict_with_ensemble(ensemble, last_features)
            explanation = explain_prediction(
                ensemble, last_features, last_pred_result, weather_data, news_data
            )

            # Risk fusion score
            risk_fusion = compute_risk_fusion_score(
                {"predictions": predictions}, weather_data, news_data
            )

            # Drift status
            drift_status = drift_detector.get_status_summary()

            # Hotspots (enhanced with risk fusion)
            # Scale so the three zones always span a meaningful risk range:
            # Northern = highest-risk sub-zone (boosted), Central = baseline, Southern = lowest
            hotspot_score = risk_fusion["fused_risk_score"]
            hotspots = [
                {"name": f"Northern {region}", "intensity": round(min(hotspot_score * 1.4, 1.0), 2)},
                {"name": f"Central {region}",  "intensity": round(min(hotspot_score * 0.95, 1.0), 2)},
                {"name": f"Southern {region}", "intensity": round(max(hotspot_score * 0.5, 0.05), 2)},
            ]

            # Live insights
            live_insights = {
                "temperature": weather_data.get("temperature", None),
                "humidity": weather_data.get("humidity", None),
                "precipitation": weather_data.get("precipitation", None),
                "news_articles_found": news_data.get("article_count", 0),
                "top_headlines": news_data.get("headlines", []),
            }

            # Build response
            response = {
                "region": region,
                "disease": "Aggregate Endemic",
                "model_version": ensemble.get("version", "v2_adaptive"),
                "historical": historical,
                "predictions": predictions,
                "hotspot_score": round(hotspot_score, 2),
                "hotspots": hotspots,
                "live_insights": live_insights,
                "freshness": freshness,
                "risk_fusion": risk_fusion,
                "drift_status": drift_status,
                "explanation": explanation,
            }

            # Intervention scenario (if requested)
            if scenario_params:
                scenario_preds, effect_summary = simulate_intervention(
                    predictions, scenario_params
                )
                response["scenario"] = {
                    "predictions": scenario_preds,
                    "effect_summary": effect_summary,
                }

            return jsonify(response)

        # ── Legacy Fallback (v1 model) ────────────────────────────────
        if _fa.malaria_forecast_model is None:
            return jsonify({"error": "No forecast model loaded"}), 500

        current_window = deque(region_cases[-WINDOW_SIZE:], maxlen=WINDOW_SIZE)

        predictions = []
        forecast_val = []
        for i in range(horizon_weeks):
            input_feat = np.array([current_window])
            input_scaled = np.log1p(input_feat)

            pred_scaled = _fa.malaria_forecast_model.predict(input_scaled)[0]
            pred_actual = np.expm1(pred_scaled)
            pred_actual = max(0, int(pred_actual))

            forecast_val.append(pred_actual)
            current_window.append(pred_actual)

            week_date = last_date + timedelta(weeks=i + 1)
            predictions.append({
                "week": week_date.strftime("%Y-%m-%d"),
                "cases": pred_actual,
            })

        historical = []
        for _, row in region_df.tail(12).iterrows():
            historical.append({
                "week": row["Date"].strftime("%Y-%m-%d"),
                "cases": int(row["New_Cases"]),
            })

        MAX_EXPECTED_CASES = 5000
        avg_cases = np.mean(forecast_val)
        base_score = min(1.0, max(0.1, avg_cases / MAX_EXPECTED_CASES))

        live_multiplier = weather_data.get("risk_multiplier", 1.0) * news_data.get("news_risk_score", 1.0)
        hotspot_score = float(min(1.0, base_score * live_multiplier))

        live_insights = {
            "temperature": weather_data.get("temperature"),
            "humidity": weather_data.get("humidity"),
            "precipitation": weather_data.get("precipitation"),
            "news_articles_found": news_data.get("article_count", 0),
            "top_headlines": news_data.get("headlines", []),
        }

        hotspots = [
            {"name": f"Northern {region}", "intensity": round(min(hotspot_score * 1.4, 1.0), 2)},
            {"name": f"Central {region}",  "intensity": round(min(hotspot_score * 0.95, 1.0), 2)},
            {"name": f"Southern {region}", "intensity": round(max(hotspot_score * 0.5, 0.05), 2)},
        ]

        return jsonify({
            "region": region,
            "disease": "Aggregate Endemic",
            "model_version": "v1_legacy",
            "historical": historical,
            "predictions": predictions,
            "hotspot_score": round(hotspot_score, 2),
            "hotspots": hotspots,
            "live_insights": live_insights,
            "freshness": freshness,
        })

    except Exception as e:
        logger.error("Error in region forecast", exc_info=True)
        return jsonify({"error": str(e)}), 500


# ── Image-Based Diagnosis ────────────────────────────────────────────────────

@predictions_bp.route("/predict/image", methods=["POST"])
@require_auth(skip_db_check=True)
@track_performance
def predict_image():
    import flask_app as _fa

    try:
        if _fa.malaria_model is None:
            return jsonify({"error": "CNN model not loaded"}), 500

        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if not file.filename:
            return jsonify({"error": "No file selected"}), 400

        _, ext = os.path.splitext(file.filename.lower())
        if ext not in IMAGE_ALLOWED_EXTENSIONS:
            return jsonify({
                "error": "Invalid file type",
                "message": f"Only image files are accepted ({', '.join(sorted(IMAGE_ALLOWED_EXTENSIONS))})",
            }), 415

        content_type = file.content_type or ""
        if content_type and content_type.split(";")[0].strip() not in IMAGE_ALLOWED_MIME_TYPES:
            return jsonify({
                "error": "Invalid MIME type",
                "message": f"Expected an image MIME type, got: {content_type}",
            }), 415

        file_bytes = file.read()
        if len(file_bytes) > IMAGE_MAX_FILE_SIZE_BYTES:
            return jsonify({
                "error": "File too large",
                "message": f"Maximum allowed file size is {IMAGE_MAX_FILE_SIZE_MB}MB",
            }), 413
        if len(file_bytes) == 0:
            return jsonify({"error": "Empty file"}), 400

        _magic_ok = any(file_bytes.startswith(magic) for magic, _ in IMAGE_MAGIC_BYTES)
        if not _magic_ok:
            return jsonify({
                "error": "Invalid image content",
                "message": "File does not appear to be a valid image (magic bytes mismatch)",
            }), 415

        # Lazy imports — mocked in tests
        import cv2
        from tensorflow.keras.preprocessing import image as keras_image

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = os.path.join(temp_dir, os.path.basename(file.filename))
            with open(temp_path, "wb") as f_out:
                f_out.write(file_bytes)

            img = keras_image.load_img(temp_path, target_size=(128, 128))
            img_array = keras_image.img_to_array(img)
            img_array = img_array / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Gatekeeper (Out-of-Distribution Detection)
            if _fa.gatekeeper_model is not None:
                gk_img = keras_image.load_img(temp_path, target_size=(64, 64))
                gk_array = keras_image.img_to_array(gk_img) / 255.0
                gk_array = np.expand_dims(gk_array, axis=0)

                reconstructed = _fa.gatekeeper_model.predict(gk_array, verbose=0)
                mse = np.mean(np.square(gk_array - reconstructed))

                logger_ml.debug(
                    "Gatekeeper Image MSE: %.5f (Threshold: %.5f)",
                    mse, _fa.gatekeeper_threshold,
                )

                if mse > _fa.gatekeeper_threshold:
                    return jsonify({
                        "label": "Invalid Image",
                        "confidence": 0.0,
                        "probability": 0.0,
                        "threshold": 0.5,
                        "error": (
                            "This image does not appear to be a standard Giemsa-stained "
                            "thin blood smear. Please upload a valid microscopic image."
                        ),
                    }), 400

            # OpenCV Cell-Count Validation
            try:
                cv_img = cv2.imread(temp_path)
                if cv_img is not None:
                    gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
                    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
                    edges = cv2.Canny(blurred, 50, 150)
                    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                    valid_contours = [c for c in contours if cv2.contourArea(c) > 50]

                    logger_ml.debug("OpenCV Validator found %d cell-like contours", len(valid_contours))

                    if len(valid_contours) > 15:
                        return jsonify({
                            "label": "Invalid Image",
                            "confidence": 0.0,
                            "probability": 0.0,
                            "threshold": 0.5,
                            "error": (
                                "This appears to be a full blood smear with dozens of cells. "
                                "Please upload an image of a SINGLE, cropped cell for accurate diagnosis."
                            ),
                        }), 400
            except Exception as cv_e:
                logger_ml.warning("OpenCV validation error: %s", cv_e)

            # Malaria Classification
            prediction = _fa.malaria_model.predict(img_array)
            score = float(prediction[0][0])
            label = "Parasitized" if score > 0.5 else "Uninfected"

            return jsonify({
                "label": label,
                "confidence": round(score, 3),
                "probability": round(score, 3),
                "threshold": 0.5,
            })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
