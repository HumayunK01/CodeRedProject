"""
Tests for agents/live_web_agent.py.

External HTTP calls are mocked so tests run offline.
"""

from unittest.mock import MagicMock, patch

from agents.live_web_agent import fetch_live_news_outbreak_risk, fetch_live_weather

# ═══════════════════════════════════════════════════════════════════════════════
#  fetch_live_weather
# ═══════════════════════════════════════════════════════════════════════════════


class TestFetchLiveWeather:
    """fetch_live_weather should call Open-Meteo and return weather + risk."""

    @patch("agents.live_web_agent.requests.get")
    def test_success(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "current": {
                "temperature_2m": 28.5,
                "relative_humidity_2m": 75.0,
                "precipitation": 2.0,
            }
        }
        mock_get.return_value = mock_resp

        # Use a region we know is in REGION_COORDS
        result = fetch_live_weather("Maharashtra")

        assert result["temperature"] == 28.5
        assert result["humidity"] == 75.0
        assert result["precipitation"] == 2.0
        # Warm + humid + rain → multiplier should be > 1.0
        assert result["risk_multiplier"] > 1.0

    @patch("agents.live_web_agent.requests.get")
    def test_api_failure_returns_defaults(self, mock_get):
        mock_get.side_effect = Exception("Network timeout")

        result = fetch_live_weather("Maharashtra")

        assert result["temperature"] == 28.0
        assert result["humidity"] == 65.0
        assert result["risk_multiplier"] == 1.0

    def test_unknown_region_returns_defaults(self):
        result = fetch_live_weather("Atlantis")

        assert result["temperature"] == 28.0
        assert result["risk_multiplier"] == 1.0

    @patch("agents.live_web_agent.requests.get")
    def test_cold_dry_weather_lower_risk(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "current": {
                "temperature_2m": 10.0,
                "relative_humidity_2m": 30.0,
                "precipitation": 0.0,
            }
        }
        mock_get.return_value = mock_resp

        result = fetch_live_weather("Maharashtra")
        assert result["risk_multiplier"] == 1.0  # No risk bumps


# ═══════════════════════════════════════════════════════════════════════════════
#  fetch_live_news_outbreak_risk
# ═══════════════════════════════════════════════════════════════════════════════


class TestFetchLiveNewsOutbreakRisk:

    @patch("agents.live_web_agent.requests.get")
    def test_success_with_articles(self, mock_get):
        # Build a minimal RSS XML response
        rss_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <item><title>Dengue outbreak hits Maharashtra</title></item>
            <item><title>Malaria cases on the rise</title></item>
          </channel>
        </rss>"""

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.content = rss_xml.encode()
        mock_get.return_value = mock_resp

        result = fetch_live_news_outbreak_risk("Maharashtra")

        assert result["article_count"] == 2
        assert len(result["headlines"]) == 2
        assert result["risk_multiplier"] >= 1.0

    @patch("agents.live_web_agent.requests.get")
    def test_no_articles(self, mock_get):
        rss_xml = """<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0"><channel></channel></rss>"""

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.content = rss_xml.encode()
        mock_get.return_value = mock_resp

        result = fetch_live_news_outbreak_risk("Goa")
        assert result["article_count"] == 0
        assert result["risk_multiplier"] == 1.0

    @patch("agents.live_web_agent.requests.get")
    def test_network_failure(self, mock_get):
        mock_get.side_effect = Exception("DNS failure")

        result = fetch_live_news_outbreak_risk("Kerala")
        assert result["risk_multiplier"] == 1.0
        assert result["article_count"] == 0
