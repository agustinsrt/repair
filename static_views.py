from flask import Blueprint, render_template
from flask import session
from flask import redirect

static_bp = Blueprint("static_views", __name__)

@static_bp.route("/tax_exemptions")
def tax_exemptions():
    return render_template("tax_exemptions.html")

@static_bp.route("/parts_resources")
def parts_resources():
    return render_template("parts_resources.html")

@static_bp.route("/extended_coverage")
def extended_coverage():
    return render_template("extended_coverage.html")

@static_bp.route("/email_templates")
def email_templates():
    return render_template("email_templates.html")

@static_bp.route("/phone_directory")
def phone_directory():
    return render_template("phone_directory.html")

@static_bp.route("/calculator")
def calculator():
    return render_template("calculator.html")

@static_bp.route("/pending-cases")
def pending_cases():
    if "username" not in session:
        return redirect("/login")  # o el flujo que uses
    return render_template("pending_cases.html")

@static_bp.route("/quote")
def quote():
    return render_template("quote.html")

@static_bp.route("/interaction")
def interaction():
    return render_template("interaction.html")

@static_bp.route("/agent_log")
def agent_log():
    if "username" not in session:
        return redirect("/login")
    return render_template("agent_log.html")
