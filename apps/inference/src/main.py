"""
OutbreakLens ML Inference API

Flask backend service for malaria diagnosis and outbreak forecasting.
Provides endpoints for image analysis, symptom assessment, and epidemiological predictions.
"""

import os
import sys
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import joblib
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import io
from PIL import Image
import traceback
import numpy as np
import os
import pandas as pd
from datetime import datetime, timedelta
import json

app = FastAPI(title="OutbreakLens ML Inference API", version="1.0.0")

# --- Allow frontend access ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Variables ---
faq_vectorizer = None
faq_matrix = None
faq_answers = None
malaria_model = None
malaria_forecast_model = None
tabular_model = None
symptoms_feature_info = None

# --- Load models safely ---
def load_models():
    global faq_vectorizer, faq_matrix, faq_answers, malaria_model, malaria_forecast_model, tabular_model, symptoms_feature_info
    try:
        # Load FAQ models for chatbot
        faq_vectorizer = joblib.load("models/tfidf_vectorizer.joblib")
        faq_matrix = joblib.load("models/tfidf_matrix.joblib")
        faq_answers = joblib.load("models/answers.joblib")
        
        # Load CNN model for image classification
        malaria_model = load_model("models/malaria_test_small.h5")
        
        # Load ARIMA model for forecasting
        malaria_forecast_model = joblib.load("models/malaria_forecast_arima.pkl")
        
        # Load tabular model for symptom analysis
        if os.path.exists("models/malaria_symptoms_model.joblib"):
            tabular_model = joblib.load("models/malaria_symptoms_model.joblib")
            symptoms_feature_info = joblib.load("models/symptoms_feature_info.joblib")
        else:
            # Fallback to original model if new one doesn't exist
            tabular_model = joblib.load("models/malaria_model.joblib")
        
        print("All models loaded successfully!")
        print(f"   - FAQ Vectorizer: {faq_vectorizer is not None}")
        print(f"   - CNN Model: {malaria_model is not None}")
        print(f"   - ARIMA Model: {malaria_forecast_model is not None}")
        print(f"   - Tabular Model: {tabular_model is not None}")
        if symptoms_feature_info:
            print(f"   - Symptoms Feature Info: {symptoms_feature_info is not None}")
    except Exception as e:
        print("Error loading models:", e)
        traceback.print_exc()

# Load models on startup
load_models()

# --- Health Check ---
@app.get("/")
def home():
    return {
        "name": "OutbreakLens ML Inference API",
        "version": "1.0.0",
        "description": "AI-powered malaria diagnosis and outbreak forecasting",
        "status": "running"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    try:
        return {
            "status": "ok",
            "message": "OutbreakLens ML Inference API is operational",
            "timestamp": datetime.now().isoformat(),
            "models_loaded": {
                "faq_vectorizer": faq_vectorizer is not None,
                "cnn_model": malaria_model is not None,
                "arima_model": malaria_forecast_model is not None,
                "tabular_model": tabular_model is not None
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Health check failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

# --- FAQ-based Question Answering ---
@app.post("/ask")
def ask_question(question: str = Form(...)):
    try:
        if not faq_vectorizer or not faq_matrix or not faq_answers:
            return JSONResponse({"error": "FAQ models not loaded properly."}, status_code=500)

        if not question:
            return JSONResponse({"error": "Question is required"}), 400

        from sklearn.metrics.pairwise import cosine_similarity
        q_vector = faq_vectorizer.transform([question])
        similarities = cosine_similarity(q_vector, faq_matrix)
        idx = np.argmax(similarities)
        answer = faq_answers[idx]
        return {"answer": answer}
    except Exception as e:
        return JSONResponse({"error": str(e)}), 500

# --- Malaria Prediction (Image Upload) ---
@app.post("/predict/image")
def predict_image(file: UploadFile = File(...)):
    """Predict malaria from blood smear image using CNN model"""
    try:
        if malaria_model is None:
            return JSONResponse({"error": "CNN model not loaded"}), 500
        
        if not file:
            return JSONResponse({"error": "No file provided"}), 400
        
        # Load image at correct size (128x128)
        img = Image.open(io.BytesIO(file.file.read())).resize((128, 128))
        img_array = np.array(img)
        img_array = img_array / 255.0  # normalize exactly as in training
        img_array = np.expand_dims(img_array, axis=0)

        # Predict using the loaded model
        prediction = malaria_model.predict(img_array)
        score = float(prediction[0][0])
        result = "Parasitized" if score > 0.5 else "Uninfected"

        return {
            "label": result,
            "confidence": round(score, 3),
            "probability": round(score, 3),
            "threshold": 0.5,
            "explanations": {
                "gradcam": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
            }
        }

    except Exception as e:
        return JSONResponse({"error": str(e)}), 500

# --- Symptoms Analysis ---
@app.post("/predict/symptoms")
def predict_symptoms(symptoms_data: dict):
    """Analyze symptoms using tabular model"""
    try:
        if tabular_model is None:
            return JSONResponse({"error": "Tabular model not loaded"}), 500
        
        if not symptoms_data:
            return JSONResponse({"error": "No symptoms data provided"}), 400
        
        # Use the new symptom-based model (no fallback)
        feature_columns = symptoms_feature_info['feature_columns']
        
        # Extract features in the correct order
        features = []
        for col in feature_columns:
            if col == 'age':
                # Require age to be provided - no default value
                if 'age' not in symptoms_data:
                    return JSONResponse({"error": "Age is required"}), 400
                features.append(symptoms_data['age'])
            else:
                # All other features are symptoms (boolean values)
                features.append(1 if symptoms_data.get(col, False) else 0)
        
        # Convert to numpy array and reshape for prediction
        X = np.array(features).reshape(1, -1)
        
        # Get prediction and probability
        prediction = tabular_model.predict(X)[0]
        probabilities = tabular_model.predict_proba(X)[0]
        
        # Get the probability of the predicted class
        classes = tabular_model.classes_
        pred_index = np.where(classes == prediction)[0][0]
        probability = probabilities[pred_index]
        
        return {
            "label": f"{prediction} Risk",
            "confidence": round(probability, 3),
            "probability": round(probability, 3),
            "threshold": 0.5
        }
        
    except Exception as e:
        return JSONResponse({"error": str(e)}), 500

# --- Outbreak Forecasting ---
@app.post("/forecast/region")
def forecast_region(forecast_data: dict):
    """Forecast malaria outbreaks for a specific region"""
    try:
        if malaria_forecast_model is None:
            return JSONResponse({"error": "Forecast model not loaded"}), 500
        
        if not forecast_data:
            return JSONResponse({"error": "No forecast data provided"}), 400
        
        region = forecast_data.get('region', 'Global')
        horizon_weeks = min(forecast_data.get('horizon_weeks', 8), 14)  # Cap at 14 weeks
        
        # Predict next N time periods
        forecast = malaria_forecast_model.predict(n_periods=horizon_weeks)
        forecast = np.maximum(forecast, 0)  # avoid negative values
        
        # Round values and make them user-friendly
        forecast = [round(float(v)) for v in forecast]
        
        # Prepare labeled response with proper week formatting
        current_date = datetime.now()
        predictions = []
        for i, cases in enumerate(forecast):
            # Calculate the date for each week
            week_date = current_date + timedelta(weeks=i)
            week_str = week_date.strftime("%Y-W%U")  # Format as YYYY-Www
            predictions.append({
                "week": week_str, 
                "cases": cases
            })
        
        # Calculate hotspot score and generate mock hotspots
        hotspot_score = min(0.9, max(0.1, np.mean(forecast) / 100))
        
        # Mock hotspots around major cities (you can make this dynamic based on region)
        hotspots = [
            {"lat": 19.0760, "lng": 72.8777, "intensity": 0.8},  # Mumbai
            {"lat": 28.6139, "lng": 77.2090, "intensity": 0.6},  # Delhi
            {"lat": 13.0827, "lng": 80.2707, "intensity": 0.7},  # Chennai
        ]
        
        return {
            "region": region,
            "predictions": predictions,
            "hotspot_score": round(hotspot_score, 2),
            "hotspots": hotspots
        }
        
    except Exception as e:
        return JSONResponse({"error": str(e)}), 500

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Starting OutbreakLens ML Inference API on {host}:{port}")
    app.run(host=host, port=port, debug=True)