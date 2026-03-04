"""
Report generation route.
"""

import uuid
from datetime import datetime
from io import BytesIO

from flask import Blueprint, jsonify, request, render_template, make_response
from xhtml2pdf import pisa
from core.auth import require_auth
from core.logging_config import get_logger

logger = get_logger("foresee.app")

reports_bp = Blueprint("reports", __name__)


@reports_bp.route("/api/generate_report", methods=["POST"])
@require_auth(skip_db_check=True)
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
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }

        # Map anemia level
        if context["symptoms"] and "anemia_level" in context["symptoms"]:
            anemia_map = {1: "Severe", 2: "Moderate", 3: "Mild", 4: "None"}
            level = context["symptoms"]["anemia_level"]
            if isinstance(level, int) or (isinstance(level, str) and level.isdigit()):
                context["symptoms"]["anemia_level"] = anemia_map.get(int(level), str(level))

        if isinstance(context["confidence"], (float, int)) and context["confidence"] <= 1.0:
            context["confidence"] = round(float(context["confidence"]) * 100, 1)

        rendered_html = render_template("report.html", **context)

        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(src=rendered_html, dest=pdf_buffer)

        if pisa_status.err:
            return jsonify({"error": "PDF generation failed"}), 500

        response = make_response(pdf_buffer.getvalue())
        response.headers["Content-Type"] = "application/pdf"
        response.headers["Content-Disposition"] = (
            f"attachment; filename=Foresee_Report_{context['report_id']}.pdf"
        )

        return response

    except Exception as e:
        logger.error("Error generating report: %s", e)
        return jsonify({"error": str(e)}), 500
