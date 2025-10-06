from flask import Blueprint, render_template, request, redirect, url_for, session
from werkzeug.security import check_password_hash
from db_utils import get_config_db_connection

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/")
def root():
    return redirect(url_for("auth.login"))

@auth_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        conn = get_config_db_connection()
        user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        conn.close()

        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]

            if user["role"] == "admin":
                return redirect(url_for("auth.admin_dashboard"))
            else:
                return redirect(url_for("auth.repair_evaluator"))
        else:
            return render_template("login.html", error_message="Invalid username or password")

    return render_template("login.html")

@auth_bp.route("/admin")
def admin_dashboard():
    if "role" in session and session["role"] == "admin":
        return render_template("admin.html", username=session["username"])
    else:
        return redirect(url_for("auth.login"))

@auth_bp.route("/repair")
def repair_evaluator():
    if "role" in session and session["role"] == "agent":
        return render_template("index.html", username=session["username"])
    else:
        return redirect(url_for("auth.login"))
    
@auth_bp.route("/logout")
def logout():
    session.clear()  # Elimina todos los datos de la sesión
    return redirect(url_for("auth.login"))  # Redirige al login