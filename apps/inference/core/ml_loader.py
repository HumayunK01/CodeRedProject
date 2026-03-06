"""
ML model loading & global model references.

All model-related globals live here so any route can do::

    from ml_loader import malaria_model, malaria_forecast_model, …
"""

import json
import logging
import os

import joblib

logger = logging.getLogger("foresee.models")


# ── Global Model References ──────────────────────────────────────────────────

malaria_model = None
malaria_forecast_model = None
symptoms_model = None
gatekeeper_model = None
gatekeeper_threshold: float = 0.05
SYMPTOM_MODEL_NAME: str = "Malaria Risk Screening (DHS-Based)"
MODEL_TEST_ACCURACY: str = "Pending"

# ── Adaptive Ensemble References ─────────────────────────────────────────────
adaptive_ensemble = None
ensemble_metadata = None


def load_models():
    """Load ML models from disk into the module-level globals."""
    global malaria_model, malaria_forecast_model, symptoms_model
    global SYMPTOM_MODEL_NAME, MODEL_TEST_ACCURACY
    global gatekeeper_model, gatekeeper_threshold
    global adaptive_ensemble, ensemble_metadata

    # These imports are deferred so this module can be imported without TF
    try:
        from tensorflow.keras.models import load_model as keras_load_model
    except Exception:
        logger.warning("TensorFlow not available — Keras models will not load")
        keras_load_model = None  # type: ignore[assignment]

    try:
        # ── Metadata ─────────────────────────────────────────────────────
        metadata: dict = {}
        metadata_path = "models/metadata.json"
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path) as f:
                    metadata = json.load(f)
                logger.info("Model metadata loaded successfully")
            except Exception as e:
                logger.warning("Error loading metadata.json: %s", e)

        # ── Gatekeeper Autoencoder ───────────────────────────────────────
        gatekeeper_path = "models/gatekeeper_autoencoder.h5"
        if keras_load_model and os.path.exists(gatekeeper_path):
            try:
                gatekeeper_model = keras_load_model(gatekeeper_path, compile=False)
                gk_meta = metadata.get("gatekeeper_model", {})
                gatekeeper_threshold = gk_meta.get("mse_threshold", 0.05)
                logger.info("Gatekeeper Autoencoder loaded (Threshold: %.4f)", gatekeeper_threshold)
            except Exception as e:
                logger.warning("Error loading gatekeeper: %s", e)

        # ── Outbreak Forecasting Model ───────────────────────────────────
        forecaster_path = "models/outbreak_forecaster.pkl"
        if os.path.exists(forecaster_path):
            try:
                malaria_forecast_model = joblib.load(forecaster_path)
                logger.info("Generalized Outbreak Forecasting Model loaded successfully")
            except Exception as e:
                logger.error("Error loading forecasting model", exc_info=e)
        else:
            logger.warning("Forecasting model file not found at %s", forecaster_path)

        # ── CNN Model (Production — Full Dataset) ────────────────────────
        cnn_model_path = "models/malaria_cnn_full.h5"
        if keras_load_model and os.path.exists(cnn_model_path):
            malaria_model = keras_load_model(cnn_model_path)
            cnn_acc = metadata.get("cnn_model", {}).get("accuracy", "94.8%")
            MODEL_TEST_ACCURACY = cnn_acc
            logger.info(
                "CNN model loaded (Production) — path=%s accuracy=%s precision=%s recall=%s f1=%s",
                cnn_model_path, cnn_acc,
                metadata.get("cnn_model", {}).get("precision", "N/A"),
                metadata.get("cnn_model", {}).get("recall", "N/A"),
                metadata.get("cnn_model", {}).get("f1_score", "N/A"),
            )
        elif keras_load_model and os.path.exists("models/malaria_test_small.h5"):
            malaria_model = keras_load_model("models/malaria_test_small.h5")
            MODEL_TEST_ACCURACY = "94.2% (Legacy)"
            logger.warning("Using legacy CNN model (quick-fit)")
        else:
            logger.warning("No CNN model file found")

        # ── DHS Risk Index Model ─────────────────────────────────────────
        if os.path.exists("models/malaria_symptoms_dhs.pkl"):
            try:
                symptoms_model = joblib.load("models/malaria_symptoms_dhs.pkl")
                model_type = metadata.get("symptoms_model", {}).get("model_type", "Risk Calculator")
                SYMPTOM_MODEL_NAME = f"DHS-based {model_type}"
                model_meta = metadata.get("symptoms_model", {})
                accuracy = model_meta.get("accuracy", "100.0%")
                cv_accuracy = model_meta.get("cv_accuracy", "N/A")
                note = model_meta.get("note", "")
                logger.info(
                    "DHS Risk Index Model loaded — type=%s accuracy=%s cv_accuracy=%s%s",
                    model_type, accuracy, cv_accuracy,
                    f" note={note}" if note else "",
                )
            except Exception as e:
                logger.error("Error loading DHS Risk Index model", exc_info=e)
        else:
            logger.warning("DHS Risk Index model file not found")

        # ── Adaptive Ensemble ────────────────────────────────────────────
        ensemble_path = "models/adaptive_ensemble.pkl"
        if os.path.exists(ensemble_path):
            try:
                adaptive_ensemble = joblib.load(ensemble_path)
                ens_meta_path = "models/ensemble_metadata.json"
                if os.path.exists(ens_meta_path):
                    with open(ens_meta_path) as f:
                        ensemble_metadata = json.load(f)
                logger.info(
                    "Adaptive Ensemble loaded — version=%s models=%d features=%d",
                    adaptive_ensemble.get("version", "unknown"),
                    len(adaptive_ensemble.get("quantile", {})) + 2,
                    len(adaptive_ensemble.get("feature_names", [])),
                )
            except Exception as e:
                logger.warning("Error loading adaptive ensemble: %s", e)
        else:
            logger.info("Adaptive ensemble not yet trained — will use legacy forecaster")

    except Exception as e:
        logger.error("Error loading models", exc_info=e)
        MODEL_TEST_ACCURACY = "Error"
