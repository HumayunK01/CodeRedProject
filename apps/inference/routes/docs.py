"""API documentation routes: serves OpenAPI spec and Swagger UI."""

import os

import yaml
from flask import Blueprint, Response, jsonify

docs_bp = Blueprint("docs", __name__)

_SPEC_PATH = os.path.join(os.path.dirname(__file__), os.pardir, "docs", "openapi.yaml")
_spec_cache: dict | None = None


def _load_spec() -> dict:
    global _spec_cache
    if _spec_cache is None:
        with open(_SPEC_PATH, encoding="utf-8") as f:
            _spec_cache = yaml.safe_load(f)
    return _spec_cache


@docs_bp.route("/openapi.json")
def openapi_json():
    return jsonify(_load_spec())


@docs_bp.route("/docs")
def swagger_ui():
    html = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Foresee API — Swagger UI</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>body{margin:0}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/openapi.json',
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
      layout: 'BaseLayout',
    });
  </script>
</body>
</html>"""
    return Response(html, content_type="text/html")
