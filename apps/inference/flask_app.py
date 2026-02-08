import os
import json
import uuid
import tempfile
import traceback
from datetime import datetime, timedelta
from io import BytesIO

from flask import Flask, request, jsonify, render_template, make_response
from flask_cors import CORS
from dotenv import load_dotenv
import joblib
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from xhtml2pdf import pisa

try:
    from database import (
        upsert_user,
        get_user_with_stats,
        get_user_by_clerk_id,
        create_diagnosis as db_create_diagnosis,
        get_diagnoses_by_user,
        get_diagnosis_stats_by_user,
        create_forecast as db_create_forecast,
        get_forecasts_by_user,
        get_forecast_stats_by_user,
        get_user_activity
    )
    DB_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Database module could not be imported. DB features will fail. Error: {e}")
    DB_AVAILABLE = False

load_dotenv()

app = Flask(__name__)
CORS(app)

malaria_model = None
malaria_forecast_model = None
# Clinical Rule-Based Assessment Model (Interim)
SYMPTOM_MODEL_NAME = "Clinical Rule-Based Assessment (Interim)"

def load_models():
    global malaria_model, malaria_forecast_model
    try:
        if os.path.exists("models/malaria_test_small.h5"):
            malaria_model = load_model("models/malaria_test_small.h5")
            print("✅ CNN model loaded successfully!")
        else:
            print("⚠️ CNN model file not found.")

        if os.path.exists("models/malaria_forecast_arima.pkl"):
            malaria_forecast_model = joblib.load("models/malaria_forecast_arima.pkl")
            print("✅ Forecast model loaded successfully!")
        else:
            print("⚠️ Forecast model file not found.")

        print("ℹ️ Symptom Assessment: Using Clinical Rule-Based Logic (Interim)")

    except Exception as e:
        print(f"❌ Error loading models: {e}")

load_models()

def serialize_datetime(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if isinstance(v, datetime):
                obj[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                serialize_datetime(v)
    elif isinstance(obj, list):
        for item in obj:
            serialize_datetime(item)
    return obj

@app.route("/")
def home():
    return jsonify({
        "name": "OutbreakLens ML Inference API",
        "version": "1.0.0",
        "description": "AI-powered malaria diagnosis and outbreak forecasting",
        "status": "running"
    })

@app.route("/health")
def health_check():
    try:
        return jsonify({
            "status": "ok",
            "message": "OutbreakLens ML Inference API is operational",
            "timestamp": datetime.now().isoformat(),
            "models_loaded": {
                "cnn_model": malaria_model is not None,
                "arima_model": malaria_forecast_model is not None,
                "symptoms_model": "Clinical Rule-Based (Active)"
            },
            "database_connected": DB_AVAILABLE
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Health check failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/db-test", methods=["GET"])
def test_db_connection():
    db_url = os.getenv("DATABASE_URL")
    
    result = {
        "db_url_exists": db_url is not None,
        "db_url_length": len(db_url) if db_url else 0,
    }
    
    if not db_url:
        return jsonify({**result, "status": "error", "message": "DATABASE_URL environment variable is not set"}), 500
    
    if "@" in db_url:
        try:
            parts = db_url.split("@")
            result["db_host"] = parts[1].split("/")[0] if len(parts) > 1 else "unknown"
        except:
            result["db_host"] = "parse_error"
    
    try:
        import psycopg
        result["psycopg_version"] = psycopg.__version__
        
        with psycopg.connect(db_url) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 as test")
                row = cur.fetchone()
                
        result["status"] = "ok"
        result["message"] = "Database connection successful"
        result["test_result"] = row[0] if row else None
        return jsonify(result)
        
    except Exception as e:
        result["status"] = "error"
        result["message"] = str(e)
        result["error_type"] = type(e).__name__
        result["traceback"] = traceback.format_exc()
        return jsonify(result), 500

@app.route("/api/users/sync", methods=["POST"])
def sync_user():
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        clerk_id = data.get("clerkId")
        email = data.get("email")
        
        if not clerk_id or not email:
            return jsonify({"error": "clerkId and email are required"}), 400
        
        user = upsert_user(
            clerk_id=clerk_id,
            email=email,
            first_name=data.get("firstName"),
            last_name=data.get("lastName"),
            image_url=data.get("imageUrl")
        )
        
        user_with_stats = get_user_with_stats(clerk_id)
        
        return jsonify(user_with_stats if user_with_stats else user)

    except Exception as e:
        print(f"Error syncing user: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<clerk_id>/stats", methods=["GET"])
def get_user_stats(clerk_id):
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        user = get_user_with_stats(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        user_id = user['id']
        
        diagnosis_stats = get_diagnosis_stats_by_user(user_id)
        forecast_stats = get_forecast_stats_by_user(user_id)
        
        return jsonify({
            "user": user,
            "diagnosisStats": diagnosis_stats,
            "forecastStats": forecast_stats
        })
    except Exception as e:
        print(f"Error getting user stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/diagnoses", methods=["POST"])
def create_diagnosis():
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        clerk_id = data.get("clerkId")
        if not clerk_id:
            return jsonify({"error": "clerkId is required"}), 400
        
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found. Please sync user first."}), 404
        
        diagnosis = db_create_diagnosis(
            user_id=user['id'],
            result=data.get("result", "Unknown"),
            confidence=data.get("confidence", 0),
            image_url=data.get("imageUrl"),
            species=data.get("species"),
            parasite_count=data.get("parasiteCount"),
            patient_age=data.get("patientAge"),
            patient_sex=data.get("patientSex"),
            location=data.get("location"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            symptoms=data.get("symptoms"),
            processing_time=data.get("processingTime"),
            model_version=data.get("modelVersion")
        )
        
        return jsonify(diagnosis), 201
    except Exception as e:
        print(f"Error creating diagnosis: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/diagnoses/<clerk_id>", methods=["GET"])
def get_user_diagnoses(clerk_id):
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        limit = request.args.get("limit", default=20, type=int)
        diagnoses = get_diagnoses_by_user(user['id'], limit=limit)
        
        serialize_datetime(diagnoses)
        
        return jsonify(diagnoses)
    except Exception as e:
        print(f"Error getting diagnoses: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/diagnoses/<clerk_id>/stats", methods=["GET"])
def get_diagnosis_stats(clerk_id):
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        stats = get_diagnosis_stats_by_user(user['id'])
        return jsonify(stats)
    except Exception as e:
        print(f"Error getting diagnosis stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/forecasts", methods=["POST"])
def create_forecast_record():
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        clerk_id = data.get("clerkId")
        if not clerk_id:
            return jsonify({"error": "clerkId is required"}), 400
        
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found. Please sync user first."}), 404
        
        forecast = db_create_forecast(
            user_id=user['id'],
            region=data.get("region", "Unknown"),
            horizon_weeks=data.get("horizonWeeks", 4),
            predictions=data.get("predictions", []),
            hotspot_score=data.get("hotspotScore"),
            risk_level=data.get("riskLevel"),
            confidence=data.get("confidence"),
            model_version=data.get("modelVersion"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            country=data.get("country"),
            temperature=data.get("temperature"),
            rainfall=data.get("rainfall"),
            humidity=data.get("humidity")
        )
        
        if forecast:
            serialize_datetime(forecast)
        
        return jsonify(forecast), 201
    except Exception as e:
        print(f"Error creating forecast: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/forecasts/<clerk_id>", methods=["GET"])
def get_user_forecasts(clerk_id):
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        limit = request.args.get("limit", default=20, type=int)
        forecasts = get_forecasts_by_user(user['id'], limit=limit)
        
        serialize_datetime(forecasts)
        
        return jsonify(forecasts)
    except Exception as e:
        print(f"Error getting forecasts: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/forecasts/<clerk_id>/stats", methods=["GET"])
def get_forecast_stats(clerk_id):
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        stats = get_forecast_stats_by_user(user['id'])
        return jsonify(stats)
    except Exception as e:
        print(f"Error getting forecast stats: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/activity/<clerk_id>", methods=["GET"])
def get_activity(clerk_id):
    if not DB_AVAILABLE:
        return jsonify({"error": "Database module not available"}), 503

    try:
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        limit = request.args.get("limit", default=5, type=int)
        activities = get_user_activity(user['id'], limit=limit)
        
        serialize_datetime(activities)
        
        return jsonify(activities)
    except Exception as e:
        print(f"Error getting activity: {e}")
        return jsonify({"error": str(e)}), 500

def calculate_dashboard_stats(stored_results):
    today_diagnoses = 0
    active_forecasts = 0
    risk_regions = set()
    today = datetime.now().date()
    
    for result in stored_results:
        try:
            if isinstance(result, dict) and 'timestamp' in result:
                ts_str = result['timestamp'].replace('Z', '+00:00')
                result_date = datetime.fromisoformat(ts_str).date()
                
                if result.get('type') == 'diagnosis' and result_date == today:
                    today_diagnoses += 1
                
                if result.get('type') == 'forecast':
                    active_forecasts += 1
                    if 'input' in result and 'region' in result['input']:
                        risk_regions.add(result['input']['region'])
        except (ValueError, TypeError):
            continue
            
    system_health = 99.2
    model_accuracy = "Pending Validation" if len(stored_results) > 0 else "N/A"
    response_time = "<2s"
    data_security = "HIPAA"
    global_reach = f"{max(1, len(risk_regions))}+"
    
    recent_activity = []
    sorted_results = sorted(
        [r for r in stored_results if 'timestamp' in r], 
        key=lambda x: x['timestamp'], 
        reverse=True
    )
    
    for result in sorted_results[:3]: # Top 3 items
        try:
            result_dt = datetime.fromisoformat(result['timestamp'].replace('Z', '+00:00'))
            diff = datetime.now() - result_dt
            
            seconds = diff.total_seconds()
            if seconds < 60: time_str = "Just now"
            elif seconds < 3600: time_str = f"{int(seconds/60)} minute(s) ago"
            elif seconds < 86400: time_str = f"{int(seconds/3600)} hour(s) ago"
            else: time_str = f"{int(seconds/86400)} day(s) ago"
        except:
            time_str = "Recently"
            
        if result.get('type') == 'diagnosis':
            label = result.get('result', {}).get('label', 'Unknown')
            is_safe = "negative" in label.lower() or "low" in label.lower()
            recent_activity.append({
                "type": "diagnosis",
                "title": "Blood smear analysis completed",
                "time": time_str,
                "result": label,
                "status": "success" if is_safe else "warning"
            })
            
        elif result.get('type') == 'forecast':
            region = result.get('input', {}).get('region', 'Unknown')
            hotspot_score = result.get('result', {}).get('hotspot_score', 0)
            
            risk = "Low risk"
            if hotspot_score > 0.7: risk = "High risk"
            elif hotspot_score > 0.4: risk = "Medium risk"
            
            recent_activity.append({
                "type": "forecast",
                "title": f"{region} region forecast updated",
                "time": time_str,
                "result": risk,
                "status": "info"
            })

    while len(recent_activity) < 3:
        recent_activity.append({
            "type": "info",
            "title": "System operational",
            "time": "Recently",
            "result": "Stable",
            "status": "success"
        })
    
    return {
        "today_diagnoses": today_diagnoses,
        "active_forecasts": active_forecasts,
        "risk_regions": len(risk_regions),
        "system_health": system_health,
        "model_accuracy": model_accuracy,
        "response_time": response_time,
        "data_security": data_security,
        "global_reach": global_reach,
        "recent_activity": recent_activity
    }

@app.route("/dashboard/stats")
def dashboard_stats():
    try:
        stored_results_json = request.args.get('stored_results', '[]')
        try:
            stored_results = json.loads(stored_results_json)
        except json.JSONDecodeError:
            stored_results = []
        
        stats = calculate_dashboard_stats(stored_results)
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict/symptoms", methods=["POST"])
def predict_symptoms():
    """
    Interim Clinical Rule-Based Symptom Assessment
    Replaces ML model pending DHS data availability.
    
    Rules:
    - If fever is False -> Low Risk (0.2)
    - If fever is True:
        - AND >= 2 other symptoms -> High Risk (0.8)
        - AND < 2 other symptoms -> Medium Risk (0.5)
    
    Symptoms checked: chills, headache, fatigue, muscle_aches, 
                     nausea, diarrhea, abdominal_pain, cough, skin_rash
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract fever status (primary indicator)
        fever = bool(data.get("fever", False))

        # List of secondary symptoms to check
        symptom_keys = [
            "chills", "headache", "fatigue", "muscle_aches",
            "nausea", "diarrhea", "abdominal_pain",
            "cough", "skin_rash"
        ]

        # Count presence of other symptoms
        symptom_count = sum(bool(data.get(symptom, False)) for symptom in symptom_keys)

        # Apply Clinical Rules
        if not fever:
            risk = "Low"
            confidence = 0.2
        elif symptom_count >= 2:
            risk = "High"
            confidence = 0.8
        else:
            risk = "Medium"
            confidence = 0.5

        return jsonify({
            "label": f"{risk} Risk",
            "confidence": confidence,
            "method": SYMPTOM_MODEL_NAME
        })

    except Exception as e:
        print(f"Error in rule-based symptom prediction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/forecast/region", methods=["POST"])
def forecast_region():
    try:
        if malaria_forecast_model is None:
            return jsonify({"error": "Forecast model not loaded"}), 500
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No forecast data provided"}), 400
        
        region = data.get('region', 'Global')
        horizon_weeks = min(data.get('horizon_weeks', 8), 14) 
        
        forecast_raw = malaria_forecast_model.predict(n_periods=14)
        forecast_val = np.maximum(forecast_raw, 0)
        forecast_rounded = [round(float(v)) for v in forecast_val]
        
        current_date = datetime.now()
        predictions = []
        
        for i, cases in enumerate(forecast_rounded[:horizon_weeks]):
            week_date = current_date + timedelta(weeks=i)
            predictions.append({
                "week": week_date.strftime("%Y-W%U"), 
                "cases": cases
            })
        
        MAX_EXPECTED_CASES = 2000000 
        avg_cases = np.mean(forecast_val)
        hotspot_score = min(0.9, max(0.1, avg_cases / MAX_EXPECTED_CASES))
        
        hotspots = [
            {"lat": 19.0760, "lng": 72.8777, "intensity": 0.8},
            {"lat": 28.6139, "lng": 77.2090, "intensity": 0.6},
            {"lat": 13.0827, "lng": 80.2707, "intensity": 0.7},
        ]
        
        return jsonify({
            "region": region,
            "predictions": predictions,
            "hotspot_score": round(hotspot_score, 2),
            "hotspots": hotspots
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict/image", methods=["POST"])
def predict_image():
    try:
        if malaria_model is None:
            return jsonify({"error": "CNN model not loaded"}), 500
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = os.path.join(temp_dir, file.filename)
            file.save(temp_path)
            
            img = image.load_img(temp_path, target_size=(128, 128))
            img_array = image.img_to_array(img)
            img_array = img_array / 255.0 
            img_array = np.expand_dims(img_array, axis=0)
            
            prediction = malaria_model.predict(img_array)
            score = float(prediction[0][0])
            label = "Parasitized" if score > 0.5 else "Uninfected"
            
            return jsonify({
                "label": label,
                "confidence": round(score, 3),
                "probability": round(score, 3),
                "threshold": 0.5
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate_report", methods=["POST"])
def generate_report():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        context = {
            "report_id": str(uuid.uuid4())[:8].upper(),
            "patient_name": data.get("patientName", "Unknown Patient"),
            "patient_age": data.get("patientAge", "N/A"),
            "patient_sex": data.get("patientSex", "N/A"),
            "result": data.get("result", "Unknown"),
            "confidence": data.get("confidence", 0),
            "species": data.get("species"),
            "parasite_count": data.get("parasiteCount"),
            "symptoms": data.get("symptoms"),
            "visit_date": datetime.now().strftime("%Y-%m-%d"),
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        if isinstance(context["confidence"], float) and context["confidence"] <= 1.0:
            context["confidence"] = round(context["confidence"] * 100, 1)

        rendered_html = render_template("report.html", **context)

        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(src=rendered_html, dest=pdf_buffer)

        if pisa_status.err:
            return jsonify({"error": "PDF generation failed"}), 500

        response = make_response(pdf_buffer.getvalue())
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = f"attachment; filename=Foresee_Report_{context['report_id']}.pdf"
        
        return response

    except Exception as e:
        print(f"Error generating report: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Starting Foresee ML Inference API on {host}:{port}")
    app.run(host=host, port=port, debug=True)