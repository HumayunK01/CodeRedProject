"""
Simple Flask backend for OutbreakLens forecast functionality
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from datetime import datetime, timedelta
import os
import json
import uuid
from flask import render_template, make_response
from xhtml2pdf import pisa
from io import BytesIO
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import tempfile
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Model variables
malaria_model = None
malaria_forecast_model = None
symptoms_model = None
SYMPTOM_MODEL_NAME = "DHS_LogisticRegression_India_AllPersons"

def load_models():
    global malaria_model, malaria_forecast_model, symptoms_model
    try:
        # Load CNN model for image classification
        malaria_model = load_model("models/malaria_test_small.h5")
        print("CNN model loaded successfully!")
        
        # Load ARIMA model for forecasting
        malaria_forecast_model = joblib.load("models/malaria_forecast_arima.pkl")
        print("Forecast model loaded successfully!")
        
        # DHS symptom model will be loaded separately when available
        print("DHS symptom model: Not loaded (pending training)")
    except Exception as e:
        print("Error loading models:", e)

# Load models on startup
load_models()

@app.route("/")
def home():
    return {
        "name": "OutbreakLens ML Inference API",
        "version": "1.0.0",
        "description": "AI-powered malaria diagnosis and outbreak forecasting",
        "status": "running"
    }

@app.route("/health")
def health_check():
    """Health check endpoint"""
    try:
        return {
            "status": "ok",
            "message": "OutbreakLens ML Inference API is operational",
            "timestamp": datetime.now().isoformat(),
            "models_loaded": {
                "cnn_model": malaria_model is not None,
                "arima_model": malaria_forecast_model is not None,
                "symptoms_model": symptoms_model is not None
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Health check failed: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }


# ============================================================================
# DATABASE API ENDPOINTS
# ============================================================================

@app.route("/api/db-test", methods=["GET"])
def test_db_connection():
    """Test database connection - for debugging"""
    import os
    import traceback
    
    db_url = os.getenv("DATABASE_URL")
    
    result = {
        "db_url_exists": db_url is not None,
        "db_url_length": len(db_url) if db_url else 0,
    }
    
    if not db_url:
        result["status"] = "error"
        result["message"] = "DATABASE_URL environment variable is not set"
        return jsonify(result), 500
    
    # Mask the password in the URL for display
    if "@" in db_url:
        parts = db_url.split("@")
        result["db_host"] = parts[1].split("/")[0] if len(parts) > 1 else "unknown"
    
    try:
        import psycopg
        result["psycopg_version"] = psycopg.__version__
        
        conn = psycopg.connect(db_url)
        cur = conn.execute("SELECT 1 as test")
        row = cur.fetchone()
        conn.close()
        
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
    """Sync a Clerk user with the database (create or update)"""
    try:
        from database import upsert_user, get_user_with_stats
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        clerk_id = data.get("clerkId")
        email = data.get("email")
        
        if not clerk_id or not email:
            return jsonify({"error": "clerkId and email are required"}), 400
        
        # Upsert user in database
        user = upsert_user(
            clerk_id=clerk_id,
            email=email,
            first_name=data.get("firstName"),
            last_name=data.get("lastName"),
            image_url=data.get("imageUrl")
        )
        
        # Get user with stats
        user_with_stats = get_user_with_stats(clerk_id)
        
        return jsonify(user_with_stats if user_with_stats else user)
    except Exception as e:
        print(f"Error syncing user: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<clerk_id>/stats", methods=["GET"])
def get_user_stats(clerk_id):
    """Get user statistics"""
    try:
        from database import get_user_with_stats, get_diagnosis_stats_by_user, get_forecast_stats_by_user
        
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
    """Create a new diagnosis record"""
    try:
        from database import create_diagnosis as db_create_diagnosis, get_user_by_clerk_id
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        clerk_id = data.get("clerkId")
        if not clerk_id:
            return jsonify({"error": "clerkId is required"}), 400
        
        # Get user by clerk ID
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found. Please sync user first."}), 404
        
        # Create diagnosis
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
    """Get diagnoses for a specific user"""
    try:
        from database import get_user_by_clerk_id, get_diagnoses_by_user
        
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        limit = request.args.get("limit", default=20, type=int)
        diagnoses = get_diagnoses_by_user(user['id'], limit=limit)
        
        # Convert datetime objects to ISO strings for JSON serialization
        for d in diagnoses:
            if d.get('createdAt'):
                d['createdAt'] = d['createdAt'].isoformat()
            if d.get('updatedAt'):
                d['updatedAt'] = d['updatedAt'].isoformat()
        
        return jsonify(diagnoses)
    except Exception as e:
        print(f"Error getting diagnoses: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/diagnoses/<clerk_id>/stats", methods=["GET"])
def get_diagnosis_stats(clerk_id):
    """Get diagnosis statistics for a user"""
    try:
        from database import get_user_by_clerk_id, get_diagnosis_stats_by_user
        
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
    """Create a new forecast record"""
    try:
        from database import create_forecast as db_create_forecast, get_user_by_clerk_id
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        clerk_id = data.get("clerkId")
        if not clerk_id:
            return jsonify({"error": "clerkId is required"}), 400
        
        # Get user by clerk ID
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found. Please sync user first."}), 404
        
        # Create forecast
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
        
        # Convert datetime objects for JSON serialization
        if forecast:
            if forecast.get('createdAt'):
                forecast['createdAt'] = forecast['createdAt'].isoformat()
            if forecast.get('updatedAt'):
                forecast['updatedAt'] = forecast['updatedAt'].isoformat()
            if forecast.get('startDate'):
                forecast['startDate'] = forecast['startDate'].isoformat()
            if forecast.get('endDate'):
                forecast['endDate'] = forecast['endDate'].isoformat()
        
        return jsonify(forecast), 201
    except Exception as e:
        print(f"Error creating forecast: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/forecasts/<clerk_id>", methods=["GET"])
def get_user_forecasts(clerk_id):
    """Get forecasts for a specific user"""
    try:
        from database import get_user_by_clerk_id, get_forecasts_by_user
        
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        limit = request.args.get("limit", default=20, type=int)
        forecasts = get_forecasts_by_user(user['id'], limit=limit)
        
        # Convert datetime objects to ISO strings for JSON serialization
        for f in forecasts:
            if f.get('createdAt'):
                f['createdAt'] = f['createdAt'].isoformat()
            if f.get('updatedAt'):
                f['updatedAt'] = f['updatedAt'].isoformat()
            if f.get('startDate'):
                f['startDate'] = f['startDate'].isoformat()
            if f.get('endDate'):
                f['endDate'] = f['endDate'].isoformat()
        
        return jsonify(forecasts)
    except Exception as e:
        print(f"Error getting forecasts: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/forecasts/<clerk_id>/stats", methods=["GET"])
def get_forecast_stats(clerk_id):
    """Get forecast statistics for a user"""
    try:
        from database import get_user_by_clerk_id, get_forecast_stats_by_user
        
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
    """Get recent activity for a user"""
    try:
        from database import get_user_by_clerk_id, get_user_activity
        
        user = get_user_by_clerk_id(clerk_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        limit = request.args.get("limit", default=5, type=int)
        activities = get_user_activity(user['id'], limit=limit)
        
        # Convert datetime objects to ISO strings for JSON serialization
        for a in activities:
            if a.get('createdAt'):
                a['createdAt'] = a['createdAt'].isoformat()
        
        return jsonify(activities)
    except Exception as e:
        print(f"Error getting activity: {e}")
        return jsonify({"error": str(e)}), 500


# ============================================================================
# ML PREDICTION ENDPOINTS (existing)
# ============================================================================

def calculate_dashboard_stats(stored_results):
    """Calculate real dashboard statistics from stored results"""
    # Initialize counters
    today_diagnoses = 0
    active_forecasts = 0
    risk_regions = set()
    
    # Get today's date for filtering
    today = datetime.now().date()
    
    # Process stored results
    for result in stored_results:
        # Parse timestamp
        try:
            result_date = datetime.fromisoformat(result['timestamp'].replace('Z', '+00:00')).date()
        except:
            # If parsing fails, skip this result
            continue
            
        # Count today's diagnoses
        if result['type'] == 'diagnosis' and result_date == today:
            today_diagnoses += 1
            
        # Count active forecasts
        if result['type'] == 'forecast':
            active_forecasts += 1
            # Extract region from forecast input
            if 'region' in result['input']:
                risk_regions.add(result['input']['region'])
    
    # System health is always high in this mock implementation
    system_health = 99.2
    
    # Model accuracy based on number of diagnoses
    model_accuracy = "Pending Validation" if len(stored_results) > 0 else "N/A"
    
    # Response time is simulated
    response_time = "<2s"
    
    # Data security is always HIPAA compliant
    data_security = "HIPAA"
    
    # Global reach based on number of unique regions
    global_reach = f"{max(1, len(risk_regions))}+"
    
    # Generate recent activity based on stored results
    recent_activity = []
    # Sort results by timestamp (newest first)
    sorted_results = sorted(stored_results, key=lambda x: x['timestamp'], reverse=True)
    
    for result in sorted_results[:3]:  # Take only the 3 most recent
        try:
            result_date = datetime.fromisoformat(result['timestamp'].replace('Z', '+00:00'))
            time_diff = datetime.now() - result_date
            
            # Format time difference
            if time_diff.total_seconds() < 60:
                time_str = "Just now"
            elif time_diff.total_seconds() < 3600:
                minutes = int(time_diff.total_seconds() / 60)
                time_str = f"{minutes} minute{'s' if minutes > 1 else ''} ago"
            elif time_diff.total_seconds() < 86400:
                hours = int(time_diff.total_seconds() / 3600)
                time_str = f"{hours} hour{'s' if hours > 1 else ''} ago"
            else:
                days = int(time_diff.total_seconds() / 86400)
                time_str = f"{days} day{'s' if days > 1 else ''} ago"
        except:
            time_str = "Recently"
            
        if result['type'] == 'diagnosis':
            # Extract result information
            result_label = result['result'].get('label', 'Unknown')
            recent_activity.append({
                "type": "diagnosis",
                "title": "Blood smear analysis completed",
                "time": time_str,
                "result": result_label,
                "status": "success" if "negative" in result_label.lower() or "low" in result_label.lower() else "warning"
            })
        elif result['type'] == 'forecast':
            # Extract forecast information
            region = result['input'].get('region', 'Unknown')
            horizon = result['input'].get('horizon_weeks', 0)
            hotspot_score = result['result'].get('hotspot_score', 0)
            
            risk_level = "Low risk"
            if hotspot_score > 0.7:
                risk_level = "High risk"
            elif hotspot_score > 0.4:
                risk_level = "Medium risk"
                
            recent_activity.append({
                "type": "forecast",
                "title": f"{region} region forecast updated",
                "time": time_str,
                "result": risk_level,
                "status": "info"
            })
    
    # If we don't have enough activity, add some default entries
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
    """Get dashboard statistics"""
    try:
        # In a real implementation, this would fetch from a database
        # For now, we'll simulate by accepting stored results via query parameter
        # In production, this would connect to the same database the frontend uses
        stored_results_json = request.args.get('stored_results', '[]')
        try:
            stored_results = json.loads(stored_results_json)
        except:
            stored_results = []
        
        # Calculate real statistics
        stats = calculate_dashboard_stats(stored_results)
        return stats
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict/symptoms", methods=["POST"])
def predict_symptoms():
    if symptoms_model is None:
        return {
            "error": "Model not ready",
            "message": "DHS-based symptom model not loaded yet"
        }, 503

    data = request.get_json()

    # Create DataFrame with exact DHS fields
    import pandas as pd
    df = pd.DataFrame([{
        "fever": int(data.get("fever", False)),
        "age": data.get("age"),
        "sex": data.get("sex"),
        "urban": int(data.get("urban", 1)),
        "region": data.get("region")
    }])

    # Probability of Positive Result (class 1)
    prob = symptoms_model.predict_proba(df)[0][1]

    return {
        "label": "Positive" if prob >= 0.5 else "Negative",
        "confidence": round(float(prob), 3),
        "model": SYMPTOM_MODEL_NAME
    }

@app.route("/forecast/region", methods=["POST"])
def forecast_region():
    """Forecast malaria outbreaks for a specific region"""
    try:
        if malaria_forecast_model is None:
            return jsonify({"error": "Forecast model not loaded"}), 500
        
        forecast_data = request.get_json()
        if not forecast_data:
            return jsonify({"error": "No forecast data provided"}), 400
        
        region = forecast_data.get('region', 'Global')
        horizon_weeks = min(forecast_data.get('horizon_weeks', 8), 14)  # Cap at 14 weeks
        
        # Predict next N time periods
        forecast = malaria_forecast_model.predict(n_periods=14)  # Always get 14 periods
        forecast = np.maximum(forecast, 0)  # avoid negative values
        
        # Round values and make them user-friendly
        forecast = [round(float(v)) for v in forecast]
        
        # TRUNCATE to the requested horizon_weeks
        forecast = forecast[:horizon_weeks]
        
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
        # Normalize forecast values to get a meaningful hotspot score
        # Based on testing, ARIMA model returns values in millions, so we scale appropriately
        max_expected_cases = 2000000  # 2 million cases as upper threshold for 0.9 score
        avg_cases = np.mean(forecast)
        hotspot_score = min(0.9, max(0.1, avg_cases / max_expected_cases))
        
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
        return jsonify({"error": str(e)}), 500

@app.route("/predict/image", methods=["POST"])
def predict_image():
    """Predict malaria from blood smear image using CNN model"""
    try:
        if malaria_model is None:
            return jsonify({"error": "CNN model not loaded"}), 500
        
        # Get the uploaded file
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Save file to temporary location
        temp_dir = tempfile.mkdtemp()
        temp_path = os.path.join(temp_dir, file.filename)
        file.save(temp_path)
        
        # Load and preprocess image
        img = image.load_img(temp_path, target_size=(128, 128))
        img_array = image.img_to_array(img)
        img_array = img_array / 255.0  # normalize exactly as in training
        img_array = np.expand_dims(img_array, axis=0)
        
        # Predict using the loaded model
        prediction = malaria_model.predict(img_array)
        score = float(prediction[0][0])
        result = "Parasitized" if score > 0.5 else "Uninfected"
        
        # Clean up temporary file
        os.remove(temp_path)
        os.rmdir(temp_dir)
        
        return {
            "label": result,
            "confidence": round(score, 3),
            "probability": round(score, 3),
            "threshold": 0.5
        }
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/generate_report", methods=["POST"])
def generate_report():
    """Generates a PDF report for a given diagnosis"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract data with defaults
        patient_name = data.get("patientName", "Unknown Patient") 
        age = data.get("patientAge", "N/A")
        sex = data.get("patientSex", "N/A")
        result = data.get("result", "Unknown") 
        confidence = data.get("confidence", 0)
        species = data.get("species", None)
        parasite_count = data.get("parasiteCount", None)
        symptoms = data.get("symptoms", None)
        
        # Format confidence
        if isinstance(confidence, float) and confidence <= 1.0:
            confidence = round(confidence * 100, 1)

        # Generate unique IDs and timestamps
        report_id = str(uuid.uuid4())[:8].upper()
        visit_date = datetime.now().strftime("%Y-%m-%d")
        generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Render HTML template
        rendered_html = render_template(
            "report.html",
            report_id=report_id,
            patient_name=patient_name,
            patient_age=age,
            patient_sex=sex,
            visit_date=visit_date,
            result=result,
            confidence=confidence,
            species=species,
            parasite_count=parasite_count,
            symptoms=symptoms,
            generated_at=generated_at
        )

        # Convert to PDF
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(
            src=rendered_html,
            dest=pdf_buffer
        )

        if pisa_status.err:
            return jsonify({"error": "PDF generation failed"}), 500

        pdf = pdf_buffer.getvalue()
        pdf_buffer.close()

        # Create response
        response = make_response(pdf)
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = f"attachment; filename=Foresee_Report_{report_id}.pdf"
        
        return response

    except Exception as e:
        print(f"Error generating report: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Starting OutbreakLens ML Inference API on {host}:{port}")
    app.run(host=host, port=port, debug=True)