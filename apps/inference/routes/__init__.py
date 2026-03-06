"""
Blueprint registration helper.

Call ``register_blueprints(app)`` once in the app factory to attach every
route group defined under ``routes/``.
"""

from routes.activity import activity_bp
from routes.admin import admin_bp
from routes.core import core_bp
from routes.diagnoses import diagnoses_bp
from routes.docs import docs_bp
from routes.forecasts import forecasts_bp
from routes.predictions import predictions_bp
from routes.reports import reports_bp
from routes.users import users_bp


def register_blueprints(app):
    """Register all Blueprints on *app*."""
    app.register_blueprint(core_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(diagnoses_bp)
    app.register_blueprint(forecasts_bp)
    app.register_blueprint(activity_bp)
    app.register_blueprint(predictions_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(docs_bp)
