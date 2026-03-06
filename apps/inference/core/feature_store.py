"""
Feature Store: ingests, caches, and serves exogenous features (weather + news)
for the adaptive forecasting system.

Keyed by (region, week_start). Provides fallback to cached last-good values
when live APIs are unavailable.
"""

import json
import logging
import os
import time
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import requests

from core.adaptive_config import (
    NEWS_CACHE_PATH,
    NEWS_CACHE_TTL_HOURS,
    REGION_COORDS,
    WEATHER_CACHE_PATH,
    WEATHER_CACHE_TTL_HOURS,
)

logger = logging.getLogger("foresee.feature_store")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ── Cache Helpers ─────────────────────────────────────────────────────────

def _ensure_cache_dir():
    cache_dir = os.path.join(BASE_DIR, "data", "cache")
    os.makedirs(cache_dir, exist_ok=True)


def _load_cache(cache_path):
    full_path = os.path.join(BASE_DIR, cache_path)
    if os.path.exists(full_path):
        try:
            with open(full_path) as f:
                return json.load(f)
        except Exception:
            pass
    return {}


def _save_cache(cache_path, data):
    _ensure_cache_dir()
    full_path = os.path.join(BASE_DIR, cache_path)
    with open(full_path, "w") as f:
        json.dump(data, f, indent=2)


def _is_cache_fresh(cache_entry, ttl_hours):
    ts = cache_entry.get("timestamp", 0)
    return (time.time() - ts) < (ttl_hours * 3600)


# ── Weather Ingestion ─────────────────────────────────────────────────────

def fetch_weather_for_region(region, start_date=None, end_date=None):
    """
    Fetch weather data from Open-Meteo Archive API for a region.
    Returns weekly aggregated weather features.
    Falls back to cached data if API fails.
    """
    if region not in REGION_COORDS:
        return _weather_fallback(region)

    coords = REGION_COORDS[region]
    lat, lon = coords["lat"], coords["lon"]

    if end_date is None:
        end_date = datetime.now().strftime("%Y-%m-%d")
    if start_date is None:
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

    url = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={lat}&longitude={lon}"
        f"&start_date={start_date}&end_date={end_date}"
        f"&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum"
        f"&timezone=auto"
    )

    cache = _load_cache(WEATHER_CACHE_PATH)
    cache_key = f"{region}_{start_date}_{end_date}"

    if cache_key in cache and _is_cache_fresh(cache[cache_key], WEATHER_CACHE_TTL_HOURS):
        logger.debug("Weather cache hit for %s", region)
        return cache[cache_key]["data"], True

    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            daily = data.get("daily", {})
            dates = daily.get("time", [])
            temps = daily.get("temperature_2m_mean", [])
            humids = daily.get("relative_humidity_2m_mean", [])
            precips = daily.get("precipitation_sum", [])

            df = pd.DataFrame({
                "date": pd.to_datetime(dates),
                "temp_c": temps,
                "humidity": humids,
                "precip_mm": precips,
            })
            df["region"] = region
            df["week_start"] = df["date"].dt.to_period("W").dt.start_time

            weekly = df.groupby(["region", "week_start"]).agg(
                temp_c_mean=("temp_c", "mean"),
                humidity_mean=("humidity", "mean"),
                precip_mm_sum=("precip_mm", "sum"),
            ).reset_index()

            result = weekly.to_dict(orient="records")
            for r in result:
                r["week_start"] = r["week_start"].isoformat()

            cache[cache_key] = {"data": result, "timestamp": time.time()}
            _save_cache(WEATHER_CACHE_PATH, cache)
            logger.info("Weather fetched for %s: %d weeks", region, len(result))
            return result, True
    except Exception as e:
        logger.warning("Weather API failed for %s: %s", region, e)

    # Fallback to cached data
    if cache_key in cache:
        logger.info("Using stale weather cache for %s", region)
        return cache[cache_key]["data"], False

    return _weather_fallback(region), False


def _weather_fallback(region):
    """Return neutral weather defaults when no data available."""
    return [{"region": region, "week_start": datetime.now().strftime("%Y-%m-%d"),
             "temp_c_mean": 28.0, "humidity_mean": 65.0, "precip_mm_sum": 0.0}]


def fetch_current_weather(region):
    """Fetch current weather for real-time risk scoring (nowcast)."""
    if region not in REGION_COORDS:
        return {"temperature": 28.0, "humidity": 65.0, "precipitation": 0.0,
                "risk_multiplier": 1.0, "fresh": False}

    coords = REGION_COORDS[region]
    lat, lon = coords["lat"], coords["lon"]
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lon}"
        f"&current=temperature_2m,relative_humidity_2m,precipitation"
        f"&timezone=auto"
    )

    cache = _load_cache(WEATHER_CACHE_PATH)
    nowcast_key = f"nowcast_{region}"

    if nowcast_key in cache and _is_cache_fresh(cache[nowcast_key], WEATHER_CACHE_TTL_HOURS):
        return {**cache[nowcast_key]["data"], "fresh": True}

    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            current = resp.json().get("current", {})
            temp = current.get("temperature_2m", 28.0)
            humidity = current.get("relative_humidity_2m", 65.0)
            precip = current.get("precipitation", 0.0)

            risk = 1.0
            if 25 <= temp <= 32:
                risk += 0.2
            if humidity > 70:
                risk += 0.2
            if precip > 0:
                risk += 0.3

            result = {"temperature": float(temp), "humidity": float(humidity),
                      "precipitation": float(precip), "risk_multiplier": float(risk)}

            cache[nowcast_key] = {"data": result, "timestamp": time.time()}
            _save_cache(WEATHER_CACHE_PATH, cache)
            return {**result, "fresh": True}
    except Exception as e:
        logger.warning("Current weather API failed for %s: %s", region, e)

    if nowcast_key in cache:
        return {**cache[nowcast_key]["data"], "fresh": False}

    return {"temperature": 28.0, "humidity": 65.0, "precipitation": 0.0,
            "risk_multiplier": 1.0, "fresh": False}


# ── News Ingestion ────────────────────────────────────────────────────────

def fetch_news_signal(region):
    """
    Fetch outbreak-related news volume for a region.
    Returns article count, risk score, and headlines.
    Falls back to cached data if Google News RSS fails.
    """
    cache = _load_cache(NEWS_CACHE_PATH)
    cache_key = f"news_{region}"

    if cache_key in cache and _is_cache_fresh(cache[cache_key], NEWS_CACHE_TTL_HOURS):
        return {**cache[cache_key]["data"], "fresh": True}

    query = f"{region} (dengue OR malaria OR outbreak OR virus)"
    encoded_query = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"

    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            root = ET.fromstring(resp.content)
            items = root.findall(".//item")
            article_count = len(items)

            risk_score = 1.0
            if article_count > 15:
                risk_score = 1.6
            elif article_count > 5:
                risk_score = 1.3
            elif article_count > 0:
                risk_score = 1.1

            headlines = []
            for item in items[:3]:
                title = item.find("title")
                if title is not None:
                    headlines.append(title.text)

            result = {"article_count": article_count,
                      "news_risk_score": float(risk_score), "headlines": headlines}

            cache[cache_key] = {"data": result, "timestamp": time.time()}
            _save_cache(NEWS_CACHE_PATH, cache)
            return {**result, "fresh": True}
    except Exception as e:
        logger.warning("News API failed for %s: %s", region, e)

    if cache_key in cache:
        return {**cache[cache_key]["data"], "fresh": False}

    return {"article_count": 0, "news_risk_score": 1.0, "headlines": [], "fresh": False}


# ── Feature Assembly ──────────────────────────────────────────────────────

def build_feature_row(region, case_history, weather_data=None, news_data=None, date=None):
    """
    Build a single feature row for model input.
    Core features (for prediction): 8 case lags + week seasonality + region ID.
    Exogenous features (for intelligence layer): weather + news.
    Returns (features_dict, freshness_info).
    """
    from core.adaptive_config import REGION_INDEX, WINDOW_SIZE

    features = {}
    freshness = {"weather_fresh": False, "news_fresh": False}

    # Case lag features (log-transformed for scale consistency)
    if len(case_history) >= WINDOW_SIZE:
        for i in range(WINDOW_SIZE):
            features[f"cases_lag_{i+1}"] = float(np.log1p(case_history[-(i+1)]))
    else:
        for i in range(WINDOW_SIZE):
            idx = -(i + 1)
            val = float(case_history[idx]) if abs(idx) <= len(case_history) else 0.0
            features[f"cases_lag_{i+1}"] = float(np.log1p(val))

    # Seasonality features (cyclic encoding of week-of-year)
    if date is not None:
        if hasattr(date, 'isocalendar'):
            wk = date.isocalendar()[1]
        else:
            wk = pd.Timestamp(date).isocalendar()[1]
        features["week_sin"] = float(np.sin(2 * np.pi * wk / 52))
        features["week_cos"] = float(np.cos(2 * np.pi * wk / 52))
    else:
        features["week_sin"] = 0.0
        features["week_cos"] = 0.0

    # Region identity (ordinal encoding for tree models)
    features["region_id"] = float(REGION_INDEX.get(region, 0))

    # Weather features
    if weather_data:
        features["temp_c_mean"] = weather_data.get("temperature", weather_data.get("temp_c_mean", 28.0))
        features["humidity_mean"] = weather_data.get("humidity", weather_data.get("humidity_mean", 65.0))
        features["precip_mm_sum"] = weather_data.get("precipitation", weather_data.get("precip_mm_sum", 0.0))
        features["weather_risk"] = weather_data.get("risk_multiplier", 1.0)
        freshness["weather_fresh"] = weather_data.get("fresh", False)
    else:
        features["temp_c_mean"] = 28.0
        features["humidity_mean"] = 65.0
        features["precip_mm_sum"] = 0.0
        features["weather_risk"] = 1.0

    # News features
    if news_data:
        features["news_count"] = news_data.get("article_count", 0)
        features["news_risk_score"] = news_data.get("news_risk_score", 1.0)
        freshness["news_fresh"] = news_data.get("fresh", False)
    else:
        features["news_count"] = 0
        features["news_risk_score"] = 1.0

    # Missingness flags
    features["missing_weather"] = 0 if freshness["weather_fresh"] else 1
    features["missing_news"] = 0 if freshness["news_fresh"] else 1

    return features, freshness


def get_feature_names():
    """Return ordered list of CORE feature names used for model training.
    Includes case lags + seasonality + region identity.
    Weather/news features are used in the intelligence layer only.
    """
    from core.adaptive_config import WINDOW_SIZE
    names = [f"cases_lag_{i+1}" for i in range(WINDOW_SIZE)]
    names += ["week_sin", "week_cos", "region_id"]
    return names


def get_all_feature_names():
    """Return full feature list including exogenous (for explainability/risk layer)."""
    names = get_feature_names()
    names += ["temp_c_mean", "humidity_mean", "precip_mm_sum", "weather_risk"]
    names += ["news_count", "news_risk_score"]
    names += ["missing_weather", "missing_news"]
    return names
