import os
import io
import json
import joblib
import traceback
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image

# NOTE: This is a FastAPI implementation of the Foresee Inference API.
# The currently active deployment uses Flask (flask_app.py).
# This file is maintained for potential future migration or reference.

app = FastAPI(
    title="Foresee ML Inference API",
    description="AI-powered malaria diagnosis and outbreak forecasting",
    version="1.0.0"
)

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Model Variables ---
# Global variables to store loaded models
faq_vectorizer = None
faq_matrix = None
faq_answers = None

malaria_model = None
malaria_forecast_model = None
tabular_model = None
symptoms_feature_info = None

# --- Startup Event: Load Models ---
@app.on_event("startup")
async def load_models():
    """Load machine learning models on application startup."""
    global faq_vectorizer, faq_matrix, faq_answers
    global malaria_model, malaria_forecast_model
    global tabular_model, symptoms_feature_info
    
    try:
        print("Starting Foresee API model loading process...")
        
        # 1. Load FAQ models
        try:
            faq_vectorizer = joblib.load("models/tfidf_vectorizer.joblib")
            faq_matrix = joblib.load("models/tfidf_matrix.joblib")
            faq_answers = joblib.load("models/answers.joblib")
            print("✅ FAQ models loaded")
        except FileNotFoundError:
            print("⚠️ FAQ models not found")

        # 2. Load CNN model (Image Classification)
        if os.path.exists("models/malaria_test_small.h5"):
            malaria_model = load_model("models/malaria_test_small.h5")
            print("✅ CNN model loaded")
        else:
            print("⚠️ CNN model file not found")
        
        # 3. Load ARIMA model (Forecasting)
        if os.path.exists("models/malaria_forecast_arima.pkl"):
            malaria_forecast_model = joblib.load("models/malaria_forecast_arima.pkl")
            print("✅ Forecast model loaded")
        else:
            print("⚠️ Forecast model file not found")
        
        # 4. Load Tabular Model (Symptoms)
        # Try loading the newer symptoms model first, fallback to legacy
        if os.path.exists("models/malaria_symptoms_model.joblib"):
            tabular_model = joblib.load("models/malaria_symptoms_model.joblib")
            if os.path.exists("models/symptoms_feature_info.joblib"):
                symptoms_feature_info = joblib.load("models/symptoms_feature_info.joblib")
            print("✅ distinct symptoms model loaded")
        elif os.path.exists("models/malaria_model.joblib"):
            tabular_model = joblib.load("models/malaria_model.joblib")
            print("✅ Legacy tabular model loaded")
        else:
            print("⚠️ No tabular model found")
            
        print("Model loading complete.")
        
    except Exception as e:
        print(f"❌ Critical error loading models: {e}")
        traceback.print_exc()

# --- Health Check ---
@app.get("/", tags=["Health"])
async def home():
    return {
        "name": "Foresee ML Inference API",
        "version": "1.0.0",
        "status": "running",
        "backend": "FastAPI (Experimental)"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Comprehensive health check endpoint."""
    return {
        "status": "ok",
        "message": "Foresee ML Inference API is operational",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": {
            "faq_system": faq_vectorizer is not None,
            "cnn_model": malaria_model is not None,
            "arima_model": malaria_forecast_model is not None,
            "tabular_model": tabular_model is not None
        }
    }

# --- FAQ Endpoint ---
@app.post("/ask", tags=["Chatbot"])
async def ask_question(question: str = Form(...)):
    """Answer user questions using TF-IDF similarity."""
    try:
        if not faq_vectorizer or not faq_matrix or not faq_answers:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="FAQ system not initialized"
            )

        from sklearn.metrics.pairwise import cosine_similarity
        
        q_vector = faq_vectorizer.transform([question])
        similarities = cosine_similarity(q_vector, faq_matrix)
        
        # Get best match
        idx = np.argmax(similarities)
        confidence = float(similarities[0][idx])
        
        # Optional: Add confidence threshold
        if confidence < 0.1:
            return {"answer": "I'm not sure about that. Could you rephrase your question?"}
            
        answer = faq_answers[idx]
        return {"answer": answer}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Image Prediction Endpoint ---
@app.post("/predict/image", tags=["Diagnosis"])
async def predict_image(file: UploadFile = File(...)):
    """Predict malaria from blood smear image using CNN model."""
    temp_file_path = None
    try:
        if malaria_model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="CNN model not loaded"
            )
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")

        # Save temporary file safely
        # Using current directory for temp file to avoid permission issues, 
        # but in production use tempfile module
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Preprocess image
        try:
            img = image.load_img(temp_file_path, target_size=(128, 128))
            img_array = image.img_to_array(img)
            img_array = img_array / 255.0
            img_array = np.expand_dims(img_array, axis=0)
        except Exception as img_error:
            raise HTTPException(status_code=400, detail=f"Invalid image file: {img_error}")

        # Prediction
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

    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # cleanup
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass

# --- Symptoms Prediction Endpoint ---
@app.post("/predict/symptoms", tags=["Diagnosis"])
async def predict_symptoms(symptoms_data: Dict[str, Any]):
    """Analyze symptoms using tabular model."""
    try:
        if tabular_model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Tabular model not loaded"
            )
            
        # Determine which model logic to use based on loaded metadata
        if symptoms_feature_info:
            # Use dynamic feature extraction (matches Flask app logic)
            feature_columns = symptoms_feature_info.get('feature_columns', [])
            features = []
            
            for col in feature_columns:
                if col == 'age':
                    age = symptoms_data.get('age')
                    if age is None:
                        raise HTTPException(status_code=400, detail="Age is required")
                    features.append(float(age))
                else:
                    # Boolean features
                    val = 1 if symptoms_data.get(col, False) else 0
                    features.append(val)
            
            X = np.array(features).reshape(1, -1)
            
            prediction = tabular_model.predict(X)[0]
            probabilities = tabular_model.predict_proba(X)[0]
            
            # Get probability of the predicted class
            classes = tabular_model.classes_
            pred_index = np.where(classes == prediction)[0][0]
            probability = float(probabilities[pred_index])
            
            label = f"{prediction} Risk" if isinstance(prediction, str) else str(prediction)
            
        else:
            # Fallback for legacy model (simple fixed columns)
            # This matches the legacy logic often found in these models
            age = float(symptoms_data.get('age', 30))
            fever = int(symptoms_data.get('fever', False))
            chills = int(symptoms_data.get('chills', False))
            headache = int(symptoms_data.get('headache', False))
            fatigue = int(symptoms_data.get('fatigue', False))
            
            features = np.array([[age, fever, chills, headache, fatigue]])
            
            prediction = tabular_model.predict(features)
            probability_arr = tabular_model.predict_proba(features)[0]
            
            # Ensure proper float conversion
            max_prob = float(np.max(probability_arr))
            
            if max_prob > 0.7:
                label = "High Risk"
            elif max_prob > 0.4:
                label = "Medium Risk"
            else:
                label = "Low Risk"
                
            probability = max_prob

        return {
            "label": label,
            "confidence": round(probability, 3),
            "probability": round(probability, 3),
            "threshold": 0.5
        }
        
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# --- Forecasting Endpoint ---
@app.post("/forecast/region", tags=["Forecast"])
async def forecast_region(forecast_data: Dict[str, Any]):
    """Forecast malaria outbreaks for a specific region."""
    try:
        if malaria_forecast_model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Forecast model not loaded"
            )
        
        region = forecast_data.get('region', 'Global')
        horizon_weeks = min(int(forecast_data.get('horizon_weeks', 8)), 14)
        
        # Predict
        forecast = malaria_forecast_model.predict(n_periods=horizon_weeks)
        forecast = np.maximum(forecast, 0)
        forecast = [round(float(v)) for v in forecast]
        
        # Generate timeline
        current_date = datetime.now()
        predictions = []
        for i, cases in enumerate(forecast):
            week_date = current_date + timedelta(weeks=i)
            week_str = week_date.strftime("%Y-W%U")
            predictions.append({
                "week": week_str, 
                "cases": cases
            })
        
        # Calculate scores
        avg_forecast = np.mean(forecast) if forecast else 0
        hotspot_score = min(0.9, max(0.1, avg_forecast / 100))
        
        # Mock hotspots
        hotspots = [
            {"lat": 19.0760, "lng": 72.8777, "intensity": 0.8},
            {"lat": 28.6139, "lng": 77.2090, "intensity": 0.6},
            {"lat": 13.0827, "lng": 80.2707, "intensity": 0.7},
        ]
        
        return {
            "region": region,
            "predictions": predictions,
            "hotspot_score": round(hotspot_score, 2),
            "hotspots": hotspots
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
