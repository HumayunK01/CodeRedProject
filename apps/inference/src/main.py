"""
OutbreakLens ML Inference API

Flask backend service for malaria diagnosis and outbreak forecasting.
Provides endpoints for image analysis, symptom assessment, and epidemiological predictions.
"""

from flask import Flask, jsonify
from datetime import datetime

# Create Flask app
app = Flask(__name__)

# Data models (using dict-based approach for Flask)
class SymptomsInput:
    def __init__(self, fever, chills, headache, fatigue, muscle_aches, nausea, diarrhea, abdominal_pain, cough, skin_rash, age, region, followUpAnswers=None):
        self.fever = fever
        self.chills = chills
        self.headache = headache
        self.fatigue = fatigue
        self.muscle_aches = muscle_aches
        self.nausea = nausea
        self.diarrhea = diarrhea
        self.abdominal_pain = abdominal_pain
        self.cough = cough
        self.skin_rash = skin_rash
        self.age = age
        self.region = region
        self.followUpAnswers = followUpAnswers or {}

class DiagnosisResult:
    def __init__(self, label, confidence, probability=None, threshold=None, explanations=None):
        self.label = label
        self.confidence = confidence
        self.probability = probability
        self.threshold = threshold
        self.explanations = explanations

class ForecastInput:
    def __init__(self, region, horizon_weeks):
        self.region = region
        self.horizon_weeks = horizon_weeks

class Prediction:
    def __init__(self, week, cases):
        self.week = week
        self.cases = cases

class ForecastResult:
    def __init__(self, region, predictions, hotspot_score=None, hotspots=None):
        self.region = region
        self.predictions = predictions
        self.hotspot_score = hotspot_score
        self.hotspots = hotspots

class HealthStatus:
    def __init__(self, status, message, timestamp):
        self.status = status
        self.message = message
        self.timestamp = timestamp

# Mock ML functions (replace with actual models)
def mock_image_analysis(filename: str) -> DiagnosisResult:
    """Mock image analysis - replace with actual CNN model"""
    # Simulate processing time
    time.sleep(2)

    # Mock results based on file name or random
    confidence = 0.87 + (0.1 * (hash(filename) % 10) / 10)
    is_positive = confidence > 0.6

    return DiagnosisResult(
        label="Positive" if is_positive else "Negative",
        confidence=confidence,
        probability=confidence if is_positive else 1 - confidence,
        threshold=0.6,
        explanations={
            "gradcam": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        }
    )

def mock_symptom_analysis(symptoms_data: dict) -> DiagnosisResult:
    """Mock symptom analysis - replace with actual ML model"""
    symptoms = SymptomsInput(**symptoms_data)

    # Calculate risk score based on symptoms
    risk_factors = [
        symptoms.fever, symptoms.chills, symptoms.headache,
        symptoms.fatigue, symptoms.muscle_aches, symptoms.nausea,
        symptoms.diarrhea, symptoms.abdominal_pain, symptoms.cough,
        symptoms.skin_rash
    ].count(True)

    # Enhanced risk calculation using follow-up answers
    follow_up_multiplier = 1.0
    if symptoms.followUpAnswers:
        # Fever pattern analysis
        if symptoms.followUpAnswers.get('fever_hasFever') == 'intermittent':
            follow_up_multiplier *= 1.3  # Classic malaria pattern
        # Severity analysis
        if symptoms.followUpAnswers.get('fever_severity') == 'severe':
            follow_up_multiplier *= 1.2
        # Chills pattern
        if symptoms.followUpAnswers.get('chills_pattern') == 'before-fever':
            follow_up_multiplier *= 1.25
        # Duration factor
        if symptoms.followUpAnswers.get('fever_duration') in ['4-7days', 'week-plus']:
            follow_up_multiplier *= 1.15

    # Age factor (older = higher risk)
    age_factor = 1.0 if symptoms.age < 60 else 1.2

    # Calculate probability
    base_probability = min(0.2 + (risk_factors * 0.15), 0.95)
    probability = base_probability * age_factor * follow_up_multiplier

    return DiagnosisResult(
        label="High Risk" if probability > 0.5 else "Low Risk",
        confidence=0.82,
        probability=probability,
        threshold=0.5
    )

def mock_forecast(region: str, horizon_weeks: int) -> ForecastResult:
    """Mock outbreak forecasting - replace with actual time-series model"""
    predictions = []

    for i in range(horizon_weeks):
        week_num = i + 1
        # Generate realistic case numbers with some seasonality
        base_cases = 100 + 50 * (1 + 0.3 * (week_num % 4))
        noise = (hash(f"{region}_{week_num}") % 60) - 30
        cases = max(0, int(base_cases + noise))

        predictions.append(Prediction(
            week=f"2024-W{week_num:02d}",
            cases=cases
        ))

    # Mock hotspots for major cities
    hotspots = [
        {"lat": 19.0760, "lng": 72.8777, "intensity": 0.8},  # Mumbai
        {"lat": 28.6139, "lng": 77.2090, "intensity": 0.6},  # Delhi
        {"lat": 13.0827, "lng": 80.2707, "intensity": 0.7},  # Chennai
    ]

    return ForecastResult(
        region=region,
        predictions=predictions,
        hotspot_score=0.72,
        hotspots=hotspots
    )

# API Routes

@app.route("/health")
def health_check():
    """Health check endpoint"""
    try:
        print("Health check called")
        response = jsonify({
            "status": "ok",
            "message": "OutbreakLens ML Inference API is operational",
            "timestamp": "2024-01-01T00:00:00Z"
        })
        print("Response created successfully")
        return response
    except Exception as e:
        print(f"Error in health_check: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

@app.route("/")
def root():
    """Root endpoint with API information"""
    return jsonify({
        "name": "OutbreakLens ML Inference API",
        "version": "1.0.0",
        "description": "AI-powered malaria diagnosis and outbreak forecasting",
        "status": "running"
    })

if __name__ == "__main__":
    # Get port from environment variable or default to 8000
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    print(f"Starting OutbreakLens ML Inference API on {host}:{port}")
    app.run(host=host, port=port, debug=True)
