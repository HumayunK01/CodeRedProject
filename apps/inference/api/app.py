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

# --- Load models safely ---
@app.on_event("startup")
def load_models():
    global faq_vectorizer, faq_matrix, faq_answers, malaria_model, malaria_forecast_model, tabular_model
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
        tabular_model = joblib.load("models/malaria_model.joblib")
        
        print("✅ All models loaded successfully!")
        print(f"   - FAQ Vectorizer: {faq_vectorizer is not None}")
        print(f"   - CNN Model: {malaria_model is not None}")
        print(f"   - ARIMA Model: {malaria_forecast_model is not None}")
        print(f"   - Tabular Model: {tabular_model is not None}")
    except Exception as e:
        print("❌ Error loading models:", e)
        traceback.print_exc()


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
async def ask_question(question: str = Form(...)):
    try:
        if not faq_vectorizer or not faq_matrix or not faq_answers:
            return JSONResponse(status_code=500, content={"error": "FAQ models not loaded properly."})

        from sklearn.metrics.pairwise import cosine_similarity
        q_vector = faq_vectorizer.transform([question])
        similarities = cosine_similarity(q_vector, faq_matrix)
        idx = np.argmax(similarities)
        answer = faq_answers[idx]
        return {"answer": answer}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# --- Malaria Prediction (Image Upload) ---
@app.post("/predict/image")
async def predict_image(file: UploadFile = File(...)):
    """Predict malaria from blood smear image using CNN model"""
    try:
        if malaria_model is None:
            raise HTTPException(status_code=500, detail="CNN model not loaded")
        
        # Save temporary file
        contents = await file.read()
        img_path = f"temp_{file.filename}"
        with open(img_path, "wb") as f:
            f.write(contents)

        # Load image at correct size (128x128)
        img = image.load_img(img_path, target_size=(128, 128))
        img_array = image.img_to_array(img)
        img_array = img_array / 255.0  # normalize exactly as in training
        img_array = np.expand_dims(img_array, axis=0)

        # Predict using the loaded model
        prediction = malaria_model.predict(img_array)
        score = float(prediction[0][0])
        result = "Parasitized" if score > 0.5 else "Uninfected"
        
        # Clean up temporary file
        if os.path.exists(img_path):
            os.remove(img_path)

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
        return {"error": str(e)}

# --- Symptoms Analysis ---
@app.post("/predict/symptoms")
async def predict_symptoms(symptoms_data: dict):
    """Analyze symptoms using tabular model"""
    try:
        if tabular_model is None:
            raise HTTPException(status_code=500, detail="Tabular model not loaded")
        
        # Extract symptoms from the request
        fever = symptoms_data.get('fever', False)
        chills = symptoms_data.get('chills', False)
        headache = symptoms_data.get('headache', False)
        fatigue = symptoms_data.get('fatigue', False)
        muscle_aches = symptoms_data.get('muscle_aches', False)
        nausea = symptoms_data.get('nausea', False)
        diarrhea = symptoms_data.get('diarrhea', False)
        abdominal_pain = symptoms_data.get('abdominal_pain', False)
        cough = symptoms_data.get('cough', False)
        skin_rash = symptoms_data.get('skin_rash', False)
        age = symptoms_data.get('age', 30)
        region = symptoms_data.get('region', 'unknown')
        
        # Create feature vector for the model
        # Note: This is a simplified approach - you may need to adjust based on your actual model features
        features = np.array([[age, int(fever), int(chills), int(headache), int(fatigue)]])
        
        # Make prediction
        prediction = tabular_model.predict(features)
        probability = tabular_model.predict_proba(features)[0]
        
        # Determine risk level based on probability
        max_prob = np.max(probability)
        if max_prob > 0.7:
            label = "High Risk"
        elif max_prob > 0.4:
            label = "Medium Risk"
        else:
            label = "Low Risk"
        
        return {
            "label": label,
            "confidence": round(max_prob, 3),
            "probability": round(max_prob, 3),
            "threshold": 0.5
        }
        
    except Exception as e:
        return {"error": str(e)}

# --- Outbreak Forecasting ---
@app.post("/forecast/region")
async def forecast_region(forecast_data: dict):
    """Forecast malaria outbreaks for a specific region"""
    try:
        if malaria_forecast_model is None:
            raise HTTPException(status_code=500, detail="Forecast model not loaded")
        
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
        return {"error": str(e)}
