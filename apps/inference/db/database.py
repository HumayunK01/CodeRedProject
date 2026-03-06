import json
import os
import uuid
from datetime import datetime, timedelta
from typing import Any

import psycopg
from dotenv import load_dotenv
from psycopg.rows import dict_row

load_dotenv()

def get_db_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise Exception("DATABASE_URL not configured")
    return psycopg.connect(db_url, row_factory=dict_row, autocommit=True)

def upsert_user(clerk_id: str, email: str, first_name: str | None = None, last_name: str | None = None, image_url: str | None = None) -> dict[str, Any]:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM "User" WHERE "clerkId" = %s', (clerk_id,))
            existing_user = cur.fetchone()

            now = datetime.now()

            if existing_user:
                cur.execute(
                    '''
                    UPDATE "User"
                    SET email = %s, "firstName" = %s, "lastName" = %s, "imageUrl" = %s, "updatedAt" = %s
                    WHERE "clerkId" = %s
                    RETURNING *
                    ''',
                    (email, first_name, last_name, image_url, now, clerk_id)
                )
            else:
                user_id = str(uuid.uuid4())
                cur.execute(
                    '''
                    INSERT INTO "User" (id, "clerkId", email, "firstName", "lastName", "imageUrl", "createdAt", "updatedAt")
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    RETURNING *
                    ''',
                    (user_id, clerk_id, email, first_name, last_name, image_url, now, now)
                )

            return dict(cur.fetchone())

def get_user_by_clerk_id(clerk_id: str) -> dict[str, Any] | None:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('SELECT * FROM "User" WHERE "clerkId" = %s', (clerk_id,))
            user = cur.fetchone()
            return dict(user) if user else None

def get_user_with_stats(clerk_id: str) -> dict[str, Any] | None:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT
                    u.*,
                    (SELECT COUNT(*) FROM "Diagnosis" WHERE "userId" = u.id) as diagnosis_count,
                    (SELECT COUNT(*) FROM "Forecast" WHERE "userId" = u.id) as forecast_count,
                    (SELECT COUNT(*) FROM "Report" WHERE "userId" = u.id) as report_count
                FROM "User" u
                WHERE u."clerkId" = %s
                ''',
                (clerk_id,)
            )
            user = cur.fetchone()
            if user:
                user_dict = dict(user)
                user_dict['_count'] = {
                    'diagnoses': user_dict.pop('diagnosis_count', 0),
                    'forecasts': user_dict.pop('forecast_count', 0),
                    'reports': user_dict.pop('report_count', 0),
                }
                return user_dict
            return None

def create_diagnosis(
    user_id: str,
    result: str,
    confidence: float,
    image_url: str | None = None,
    species: str | None = None,
    parasite_count: int | None = None,
    patient_age: int | None = None,
    patient_sex: str | None = None,
    location: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    symptoms: dict | None = None,
    processing_time: float | None = None,
    model_version: str | None = None
) -> dict[str, Any]:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            diagnosis_id = str(uuid.uuid4())
            now = datetime.now()
            symptoms_json = json.dumps(symptoms) if symptoms else None

            cur.execute(
                '''
                INSERT INTO "Diagnosis" (
                    id, "userId", result, confidence, "imageUrl", species,
                    "parasiteCount", "patientAge", "patientSex", location,
                    latitude, longitude, symptoms, "processingTime", "modelVersion",
                    "createdAt", "updatedAt"
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                ''',
                (
                    diagnosis_id, user_id, result, confidence, image_url, species,
                    parasite_count, patient_age, patient_sex, location,
                    latitude, longitude, symptoms_json, processing_time, model_version,
                    now, now
                )
            )
            return dict(cur.fetchone())

def get_diagnoses_by_user(user_id: str, limit: int = 20) -> list[dict[str, Any]]:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT * FROM "Diagnosis"
                WHERE "userId" = %s
                ORDER BY "createdAt" DESC
                LIMIT %s
                ''',
                (user_id, limit)
            )
            return [dict(row) for row in cur.fetchall()]

def get_diagnosis_stats_by_user(user_id: str) -> dict[str, Any]:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN result ILIKE '%%parasitized%%' OR result ILIKE '%%high%%' THEN 1 END) as positive,
                    COUNT(CASE WHEN result ILIKE '%%uninfected%%' OR result ILIKE '%%low%%' THEN 1 END) as negative,
                    MAX("createdAt") as last_diagnosis
                FROM "Diagnosis"
                WHERE "userId" = %s
                ''',
                (user_id,)
            )
            result = cur.fetchone()
            return {
                'total': result['total'] or 0,
                'positive': result['positive'] or 0,
                'negative': result['negative'] or 0,
                'lastDiagnosis': result['last_diagnosis'].isoformat() if result['last_diagnosis'] else None
            }

def create_forecast(
    user_id: str,
    region: str,
    horizon_weeks: int,
    predictions: list[dict],
    hotspot_score: float | None = None,
    risk_level: str | None = None,
    confidence: float | None = None,
    model_version: str | None = None,
    latitude: float | None = None,
    longitude: float | None = None,
    country: str | None = None,
    temperature: float | None = None,
    rainfall: float | None = None,
    humidity: float | None = None,
    risk_fusion_score: float | None = None,
    risk_fusion_level: str | None = None,
    drift_detected: bool | None = None,
    confidence_level: str | None = None,
    explanation_reasons: list[str] | None = None
) -> dict[str, Any]:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            forecast_id = str(uuid.uuid4())
            now = datetime.now()
            if risk_level and isinstance(risk_level, str):
                risk_level = risk_level.lower()

            end_date = now + timedelta(weeks=horizon_weeks)

            cases = [p.get('point') or p.get('cases', 0) for p in predictions]
            cases_low = min(cases) if cases else None
            cases_high = max(cases) if cases else None
            cases_mean = sum(cases) / len(cases) if cases else None

            import json as _json
            predictions_json = _json.dumps(predictions) if predictions else None
            reasons_json = _json.dumps(explanation_reasons) if explanation_reasons else None

            cur.execute(
                '''
                INSERT INTO "Forecast" (
                    id, "userId", region, location, "startDate", "endDate",
                    "riskLevel", "casesLow", "casesHigh", "casesMean",
                    confidence, "modelVersion", latitude, longitude, country,
                    temperature, rainfall, humidity,
                    "hotspotScore", "riskFusionScore", "riskFusionLevel",
                    "driftDetected", "confidenceLevel", "explanationReasons",
                    predictions, "createdAt", "updatedAt"
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING *
                ''',
                (
                    forecast_id, user_id, region, region, now, end_date,
                    risk_level, cases_low, cases_high, cases_mean,
                    confidence, model_version, latitude, longitude, country,
                    temperature, rainfall, humidity,
                    hotspot_score, risk_fusion_score, risk_fusion_level,
                    drift_detected, confidence_level, reasons_json,
                    predictions_json, now, now
                )
            )
            return dict(cur.fetchone())

def get_forecasts_by_user(user_id: str, limit: int = 20) -> list[dict[str, Any]]:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT * FROM "Forecast"
                WHERE "userId" = %s
                ORDER BY "createdAt" DESC
                LIMIT %s
                ''',
                (user_id, limit)
            )
            return [dict(row) for row in cur.fetchall()]

def get_forecast_stats_by_user(user_id: str) -> dict[str, Any]:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            now = datetime.now()
            cur.execute(
                '''
                SELECT
                    COUNT(*) as total,
                    COUNT(CASE WHEN "endDate" > %s THEN 1 END) as active,
                    COUNT(CASE WHEN LOWER("riskLevel"::text) IN ('high', 'critical') THEN 1 END) as high_risk,
                    MAX("createdAt") as last_forecast
                FROM "Forecast"
                WHERE "userId" = %s
                ''',
                (now, user_id)
            )
            result = cur.fetchone()
            return {
                'total': result['total'] or 0,
                'active': result['active'] or 0,
                'highRisk': result['high_risk'] or 0,
                'lastForecast': result['last_forecast'].isoformat() if result['last_forecast'] else None
            }

def get_user_activity(user_id: str, limit: int = 5) -> list[dict[str, Any]]:
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                '''
                SELECT 'diagnosis' as type, id, result, confidence, "createdAt"
                FROM "Diagnosis"
                WHERE "userId" = %s
                ORDER BY "createdAt" DESC
                LIMIT %s
                ''',
                (user_id, limit)
            )
            diagnoses = [dict(row) for row in cur.fetchall()]

            cur.execute(
                '''
                SELECT 'forecast' as type, id, region, "riskLevel", "createdAt"
                FROM "Forecast"
                WHERE "userId" = %s
                ORDER BY "createdAt" DESC
                LIMIT %s
                ''',
                (user_id, limit)
            )
            forecasts = [dict(row) for row in cur.fetchall()]

            activities = diagnoses + forecasts
            activities.sort(key=lambda x: x['createdAt'], reverse=True)



            return activities[:limit]
