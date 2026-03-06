import logging
import urllib.parse
import xml.etree.ElementTree as ET

import requests

logger = logging.getLogger("foresee.agents.web")

# Base coordinates for major Indian states
REGION_COORDS = {
    "Maharashtra": [19.7515, 75.7139],
    "Delhi": [28.7041, 77.1025],
    "Kerala": [10.8505, 76.2711],
    "Karnataka": [15.3173, 75.7139],
    "Tamil Nadu": [11.1271, 78.6569],
    "Uttar Pradesh": [26.8467, 80.9462],
    "Gujarat": [22.2587, 71.1924],
    "West Bengal": [22.9868, 87.8550],
    "Rajasthan": [27.0238, 74.2179],
    "Madhya Pradesh": [22.9734, 78.6569],
    "Bihar": [25.0961, 85.3131],
    "Punjab": [31.1471, 75.3412],
    "Haryana": [29.0588, 76.0856],
    "Assam": [26.2006, 92.9376],
    "Odisha": [20.9517, 85.0985]
}

def fetch_live_weather(region):
    """
    Fetches live weather from Open-Meteo API using the region's coordinates.
    Returns current temperature, humidity, precipitation and a risk multiplier.
    """
    if region not in REGION_COORDS:
        return {"temperature": 28.0, "humidity": 65.0, "precipitation": 0, "risk_multiplier": 1.0}

    lat, lon = REGION_COORDS[region]
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,precipitation&timezone=auto"

    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            current = data.get('current', {})
            temp = current.get('temperature_2m', 28.0)
            humidity = current.get('relative_humidity_2m', 65.0)
            precip = current.get('precipitation', 0.0)

            # Dengue/Malaria vectors thrive around 25-30C and high humidity (>70%), especially after rain.
            risk = 1.0
            if 25 <= temp <= 32:
                risk += 0.2
            if humidity > 70:
                risk += 0.2
            if precip > 0:
                risk += 0.3

            return {
                "temperature": float(temp),
                "humidity": float(humidity),
                "precipitation": float(precip),
                "risk_multiplier": float(risk)
            }
    except Exception as e:
        logger.error("Error fetching live weather for %s: %s", region, e)

    # Fallback to defaults
    return {"temperature": 28.0, "humidity": 65.0, "precipitation": 0.0, "risk_multiplier": 1.0}

def fetch_live_news_outbreak_risk(region):
    """
    Fetches current news headlines for the region related to outbreaks
    using Google News RSS to gauge real-time public/media alarm levels.
    """
    query = f"{region} (dengue OR malaria OR outbreak OR virus)"
    encoded_query = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl=en-IN&gl=IN&ceid=IN:en"

    try:
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            root = ET.fromstring(resp.content)
            items = root.findall('.//item')
            article_count = len(items)

            risk = 1.0
            if article_count > 15:
                risk = 1.6
            elif article_count > 5:
                risk = 1.3
            elif article_count > 0:
                risk = 1.1

            headlines = []
            for item in items[:2]:
                title = item.find('title')
                if title is not None:
                    headlines.append(title.text)

            return {
                "article_count": article_count,
                "risk_multiplier": float(risk),
                "headlines": headlines
            }
    except Exception as e:
        logger.error("Error fetching live news for %s: %s", region, e)

    return {"article_count": 0, "risk_multiplier": 1.0, "headlines": []}
